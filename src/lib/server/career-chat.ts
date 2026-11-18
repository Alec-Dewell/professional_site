import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import {
  CHAT_HISTORY_CHAR_LIMIT,
  CHAT_HISTORY_LIMIT,
  CHAT_MESSAGE_LIMIT,
  CHAT_REPLY_LIMIT,
  type ChatMessage,
} from "../chat";
import { careerSystemPrompt } from "./career-context";

export const DEFAULT_CAREER_MODEL = "gpt-4.1-mini";
/** @deprecated Use DEFAULT_CAREER_MODEL. Kept for scripts that import the old name. */
export const CAREER_MODEL = DEFAULT_CAREER_MODEL;

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
// UTF-8 can use up to 4 bytes per character; allow headroom for JSON and signatures.
const MAX_BODY_BYTES = CHAT_HISTORY_CHAR_LIMIT * 4 + 16_000;
const TIMEOUT_MS = 60_000;
const MAX_OUTPUT_TOKENS = 900;

const RATE_LIMIT_REQUESTS = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_CLIENTS = 500;
export const DEFAULT_DAILY_REQUEST_LIMIT = 200;

const MODEL_PATTERN = /^[A-Za-z0-9._:-]{1,64}$/;
const SIGNATURE_PATTERN = /^[0-9a-f]{64}$/;
const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

const OWNER_ATTENTION =
  "The chat service needs attention from the site owner. You can still reach Alec by email or LinkedIn.";

/**
 * Fixed-window, per-client rate limiter.
 *
 * Every entry lives for the same window, and Map iteration follows insertion
 * order, so entries are ordered by expiry: cleanup stops at the first live
 * entry, and when the table is full the oldest client is evicted rather than
 * refusing everyone new (which would let one sender lock out all visitors).
 */
export class ChatRateLimiter {
  private entries = new Map<string, { count: number; expires: number }>();

  constructor(
    private readonly limit = RATE_LIMIT_REQUESTS,
    private readonly windowMs = RATE_LIMIT_WINDOW_MS,
    private readonly maxClients = RATE_LIMIT_MAX_CLIENTS,
  ) {}

  /** Returns 0 when allowed, otherwise the seconds to wait. */
  take(client: string, now = Date.now()) {
    for (const [key, entry] of this.entries) {
      if (entry.expires > now) break;
      this.entries.delete(key);
    }
    const entry = this.entries.get(client);
    if (entry) {
      if (entry.count >= this.limit) return Math.max(1, Math.ceil((entry.expires - now) / 1000));
      entry.count++;
      return 0;
    }
    if (this.entries.size >= this.maxClients) {
      const oldest = this.entries.keys().next().value;
      if (oldest !== undefined) this.entries.delete(oldest);
    }
    this.entries.set(client, { count: 1, expires: now + this.windowMs });
    return 0;
  }

  get size() {
    return this.entries.size;
  }
}

/** Global ceiling on upstream requests per UTC day, whoever sends them. */
export class ChatBudget {
  private day = "";
  private used = 0;

  /** Returns 0 when allowed, otherwise the seconds until the budget resets. */
  take(dailyLimit: number, now = Date.now()) {
    const day = new Date(now).toISOString().slice(0, 10);
    if (day !== this.day) {
      this.day = day;
      this.used = 0;
    }
    if (this.used >= dailyLimit) {
      const nextMidnight = Date.parse(`${day}T00:00:00Z`) + 86_400_000;
      return Math.max(1, Math.ceil((nextMidnight - now) / 1000));
    }
    this.used++;
    return 0;
  }
}

const defaultLimiter = new ChatRateLimiter();
const defaultBudget = new ChatBudget();
// Used when CHAT_SIGNING_SECRET is not set. Fine for a single local process;
// set the variable when running several instances so they share one key.
const processSigningSecret = randomBytes(32).toString("hex");

/**
 * Identifies the client for rate limiting.
 *
 * X-Forwarded-For is client-controlled unless a proxy you trust rewrites it, so
 * it is ignored by default and every visitor shares one bucket (the daily
 * budget still caps total spend). When deployed behind a platform that sets a
 * trusted header, name it in CHAT_CLIENT_IP_HEADER (for example
 * "cf-connecting-ip" or "x-real-ip"). For "x-forwarded-for", the right-most
 * entry is used because that is the one appended by your own proxy.
 */
export function clientKey(request: Request, trustedHeader?: string) {
  const name = trustedHeader?.trim().toLowerCase();
  if (!name) return "shared";
  const values = (request.headers.get(name) || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return values.at(-1) || "shared";
}

/** HMAC over the question and the reply, so replies cannot be edited or moved. */
export function signReply(secret: string, question: string, reply: string) {
  return createHmac("sha256", secret)
    .update(JSON.stringify([question, reply]))
    .digest("hex");
}

function verifyReply(secret: string, question: string, reply: string, signature: unknown) {
  if (typeof signature !== "string" || !SIGNATURE_PATTERN.test(signature)) return false;
  const expected = Buffer.from(signReply(secret, question, reply), "hex");
  return timingSafeEqual(expected, Buffer.from(signature, "hex"));
}

function error(message: string, status: number, extraHeaders: Record<string, string> = {}) {
  return Response.json({ error: message }, { status, headers: { ...headers, ...extraHeaders } });
}

function isMessageShape(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Record<string, unknown>;
  return (
    (message.role === "user" || message.role === "assistant") && typeof message.content === "string"
  );
}

async function readBody(request: Request) {
  if (!request.body) return null;
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    throw new RangeError("Request too large");
  }
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let body = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new RangeError("Request too large");
      }
      body += decoder.decode(value, { stream: true });
    }
    return JSON.parse(body + decoder.decode()) as unknown;
  } finally {
    reader.releaseLock();
  }
}

type Validation = { ok: true; messages: ChatMessage[] } | { ok: false; response: Response };

/** Checks the conversation and returns a specific, accurate error when it fails. */
function validateConversation(body: unknown, signingSecret: string): Validation {
  const fail = (message: string, status: number) => ({
    ok: false as const,
    response: error(message, status),
  });
  const messages =
    body && typeof body === "object" ? (body as Record<string, unknown>).messages : undefined;
  const malformed = "I couldn’t read that conversation. Please start a new chat.";
  if (!Array.isArray(messages) || messages.length < 1 || !messages.every(isMessageShape)) {
    return fail(malformed, 400);
  }
  const alternates = messages.every(
    (message, index) => message.role === (index % 2 === 0 ? "user" : "assistant"),
  );
  if (!alternates || messages.at(-1)?.role !== "user") return fail(malformed, 400);

  const question = messages.at(-1)!.content;
  if (!question.trim()) return fail("Please type a question.", 400);
  if (question.length > CHAT_MESSAGE_LIMIT) {
    return fail("Please keep your question to 2,000 characters or fewer.", 400);
  }
  const tooLong = "This conversation is too long. Please start a new chat.";
  const totalCharacters = messages.reduce((sum, message) => sum + message.content.length, 0);
  if (messages.length > CHAT_HISTORY_LIMIT || totalCharacters > CHAT_HISTORY_CHAR_LIMIT) {
    return fail(tooLong, 413);
  }
  for (let index = 0; index < messages.length - 1; index++) {
    const message = messages[index];
    const limit = message.role === "user" ? CHAT_MESSAGE_LIMIT : CHAT_REPLY_LIMIT;
    if (!message.content.trim() || message.content.length > limit) return fail(malformed, 400);
    if (
      message.role === "assistant" &&
      !verifyReply(signingSecret, messages[index - 1].content, message.content, message.signature)
    ) {
      return fail("This conversation couldn’t be verified. Please start a new chat.", 409);
    }
  }
  return { ok: true, messages };
}

type ChatDependencies = {
  apiKey?: string;
  expiresAt?: string;
  model?: string;
  signingSecret?: string;
  clientIpHeader?: string;
  dailyRequestLimit?: string | number;
  fetchImpl?: typeof fetch;
  limiter?: ChatRateLimiter;
  budget?: ChatBudget;
  now?: () => number;
};

function isSameOrigin(request: Request) {
  // Requests with no Origin header (curl, server-side scripts) are allowed by
  // design: this check stops cross-site browser requests, not direct callers.
  // Direct callers are bounded by the rate limiter and the daily budget.
  const origin = request.headers.get("origin");
  const requestUrl = new URL(request.url);
  let sameOrigin = !origin || origin === requestUrl.origin;
  // Next can use localhost internally even when the browser uses 127.0.0.1.
  // Compare the actual Host header too, without trusting a forwarded host.
  if (origin && !sameOrigin) {
    try {
      const browserOrigin = new URL(origin);
      sameOrigin =
        browserOrigin.origin === origin &&
        browserOrigin.host === request.headers.get("host") &&
        browserOrigin.protocol === requestUrl.protocol;
    } catch {
      sameOrigin = false;
    }
  }
  return sameOrigin && request.headers.get("sec-fetch-site") !== "cross-site";
}

export async function handleCareerChat(request: Request, dependencies: ChatDependencies) {
  const now = dependencies.now || Date.now;
  if (!isSameOrigin(request)) return error("Please use the chat on Alec’s website.", 403);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return error("Send your question as a JSON message.", 415);
  }

  let body: unknown;
  try {
    body = await readBody(request);
  } catch (cause) {
    return cause instanceof RangeError
      ? error("This conversation is too long. Please start a new chat.", 413)
      : error("I couldn’t read that question. Please try again.", 400);
  }
  const signingSecret = dependencies.signingSecret?.trim() || processSigningSecret;
  const validation = validateConversation(body, signingSecret);
  if (!validation.ok) return validation.response;
  const { messages } = validation;

  const apiKey = dependencies.apiKey?.trim();
  if (!apiKey) {
    return error("The chat isn’t configured yet. You can contact Alec by email or LinkedIn.", 503);
  }
  if (dependencies.expiresAt?.trim()) {
    const expiresAt = Date.parse(dependencies.expiresAt.trim());
    if (!Number.isFinite(expiresAt) || expiresAt <= now()) return error(OWNER_ATTENTION, 503);
  }

  const retryIn = (dependencies.limiter || defaultLimiter).take(
    clientKey(request, dependencies.clientIpHeader),
    now(),
  );
  if (retryIn) {
    return error(
      "You’ve sent quite a few questions. Please wait a moment before trying again.",
      429,
      { "Retry-After": String(retryIn) },
    );
  }
  const configuredLimit = Number(dependencies.dailyRequestLimit);
  const dailyLimit =
    Number.isInteger(configuredLimit) && configuredLimit >= 0
      ? configuredLimit
      : DEFAULT_DAILY_REQUEST_LIMIT;
  const budgetRetry = (dependencies.budget || defaultBudget).take(dailyLimit, now());
  if (budgetRetry) {
    return error(
      "The chat has reached its daily limit. Please try again tomorrow, or contact Alec by email or LinkedIn.",
      503,
      { "Retry-After": String(budgetRetry) },
    );
  }

  const model =
    dependencies.model?.trim() && MODEL_PATTERN.test(dependencies.model.trim())
      ? dependencies.model.trim()
      : DEFAULT_CAREER_MODEL;

  try {
    const response = await (dependencies.fetchImpl || fetch)(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        instructions: careerSystemPrompt(),
        // Signatures are for this server only and are never sent upstream.
        input: messages.map((message) => ({
          role: message.role,
          content: message.content.trim(),
        })),
        temperature: 0.3,
        max_output_tokens: MAX_OUTPUT_TOKENS,
        store: false,
        stream: false,
      }),
      cache: "no-store",
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(TIMEOUT_MS)]),
    });
    const data = await response.json().catch(() => null);
    const code = Number(data?.error?.code) || response.status;
    if (!response.ok || data?.error || data?.status === "failed") {
      // Never expose upstream messages: they may include provider internals.
      if (code === 429) {
        if (data?.error?.code === "insufficient_quota") return error(OWNER_ATTENTION, 503);
        const retryAfter = response.headers.get("retry-after");
        return error(
          "The chat service is busy. Please try again later.",
          429,
          retryAfter && /^\d{1,6}$/.test(retryAfter) ? { "Retry-After": retryAfter } : {},
        );
      }
      if ([401, 402, 403].includes(code)) return error(OWNER_ATTENTION, 503);
      return error("I couldn’t reach the chat service. Please try again in a moment.", 503);
    }
    if (data?.status === "incomplete") {
      return error("The reply was cut short. Please try a shorter question.", 502);
    }
    // Raw Responses API output may include non-message items. Only return
    // assistant text, never reasoning, tool output or provider metadata.
    const answer = Array.isArray(data?.output)
      ? data.output
          .filter(
            (item: { type?: string; role?: string }) =>
              item?.type === "message" && item.role === "assistant",
          )
          .flatMap((item: { content?: unknown[] }) =>
            Array.isArray(item.content) ? item.content : [],
          )
          .filter(
            (part: { type?: string; text?: unknown }) =>
              part?.type === "output_text" && typeof part.text === "string",
          )
          .map((part: { text: string }) => part.text)
          .join("\n")
          .trim()
          .slice(0, CHAT_REPLY_LIMIT)
      : "";
    if (!answer) return error("The chat service didn’t return an answer. Please try again.", 502);
    const question = messages.at(-1)!.content;
    return Response.json(
      { message: answer, model, signature: signReply(signingSecret, question, answer) },
      { headers },
    );
  } catch (cause) {
    if (cause instanceof Error && ["TimeoutError", "AbortError"].includes(cause.name)) {
      return error("The reply took too long or was stopped. Please try again.", 504);
    }
    return error("I couldn’t reach the chat service. Please try again in a moment.", 503);
  }
}
