import { CHAT_HISTORY_LIMIT, CHAT_MESSAGE_LIMIT, type ChatMessage } from "../chat";
import { careerSystemPrompt } from "./career-context";

export const CAREER_MODEL = "gpt-4.1-mini";
const MAX_BODY_BYTES = 48_000;
const MAX_HISTORY_CHARACTERS = 28_000;
const TIMEOUT_MS = 60_000;
const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

export class ChatRateLimiter {
  private entries = new Map<string, { count: number; expires: number }>();

  take(client: string, now = Date.now()) {
    for (const [key, entry] of this.entries) {
      if (entry.expires <= now) this.entries.delete(key);
    }
    const entry = this.entries.get(client);
    if (entry && entry.count >= 10) return Math.max(1, Math.ceil((entry.expires - now) / 1000));
    if (entry) entry.count++;
    else {
      if (this.entries.size >= 500) return 60;
      this.entries.set(client, { count: 1, expires: now + 60_000 });
    }
    return 0;
  }
}

const defaultLimiter = new ChatRateLimiter();

function error(message: string, status: number, extraHeaders: Record<string, string> = {}) {
  return Response.json({ error: message }, { status, headers: { ...headers, ...extraHeaders } });
}

function isMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Record<string, unknown>;
  return (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string" && message.content.trim().length > 0 &&
    message.content.length <= (message.role === "user" ? CHAT_MESSAGE_LIMIT : 6000);
}

async function readBody(request: Request) {
  if (!request.body) return null;
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

type ChatDependencies = {
  apiKey?: string;
  expiresAt?: string;
  fetchImpl?: typeof fetch;
  limiter?: ChatRateLimiter;
};

export async function handleCareerChat(request: Request, dependencies: ChatDependencies) {
  const origin = request.headers.get("origin");
  const requestUrl = new URL(request.url);
  let sameOrigin = !origin || origin === requestUrl.origin;
  // Next can use localhost internally even when the browser uses 127.0.0.1.
  // Compare the actual Host header too, without trusting a forwarded host.
  if (origin && !sameOrigin) {
    try {
      const browserOrigin = new URL(origin);
      sameOrigin = browserOrigin.origin === origin && browserOrigin.host === request.headers.get("host") && browserOrigin.protocol === requestUrl.protocol;
    } catch { sameOrigin = false; }
  }
  if (!sameOrigin || request.headers.get("sec-fetch-site") === "cross-site") {
    return error("Please use the chat on Alec’s website.", 403);
  }
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
  const messages = body && typeof body === "object" ? (body as Record<string, unknown>).messages : undefined;
  if (!Array.isArray(messages) || messages.length < 1 || messages.length > CHAT_HISTORY_LIMIT ||
    !messages.every(isMessage) || messages.some((message, index) => message.role !== (index % 2 === 0 ? "user" : "assistant")) ||
    messages.at(-1)?.role !== "user" || messages.reduce((sum, message) => sum + message.content.length, 0) > MAX_HISTORY_CHARACTERS) {
    return error("Please send a question of up to 2,000 characters. You can start a new chat if the conversation is too long.", 400);
  }
  if (!dependencies.apiKey?.trim()) {
    return error("The chat isn’t configured yet. You can contact Alec by email or LinkedIn.", 503);
  }
  if (dependencies.expiresAt?.trim()) {
    const expiresAt = Date.parse(dependencies.expiresAt.trim());
    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      return error("The chat service needs attention from the site owner. You can still reach Alec by email or LinkedIn.", 503);
    }
  }
  const client = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const retryIn = (dependencies.limiter || defaultLimiter).take(client);
  if (retryIn) return error("You’ve sent quite a few questions. Please wait a moment before trying again.", 429, { "Retry-After": String(retryIn) });

  try {
    const response = await (dependencies.fetchImpl || fetch)("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Authorization": `Bearer ${dependencies.apiKey.trim()}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: CAREER_MODEL,
        instructions: careerSystemPrompt(),
        input: messages.map(message => ({ role: message.role, content: message.content.trim() })),
        temperature: 0.3,
        max_output_tokens: 900,
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
        if (data?.error?.code === "insufficient_quota") {
          return error("The chat service needs attention from the site owner. You can still reach Alec by email or LinkedIn.", 503);
        }
        const retryAfter = response.headers.get("retry-after");
        return error("The chat service is busy. Please try again later.", 429,
          retryAfter && /^\d{1,6}$/.test(retryAfter) ? { "Retry-After": retryAfter } : {});
      }
      if ([401, 402, 403].includes(code)) return error("The chat service needs attention from the site owner. You can still reach Alec by email or LinkedIn.", 503);
      return error("I couldn’t reach the chat service. Please try again in a moment.", 503);
    }
    if (data?.status === "incomplete") return error("The reply was cut short. Please try a shorter question.", 502);
    // Raw Responses API output may include non-message items. Only return
    // assistant text, never reasoning, tool output or provider metadata.
    const answer = Array.isArray(data?.output) ? data.output
      .filter((item: { type?: string; role?: string }) => item?.type === "message" && item.role === "assistant")
      .flatMap((item: { content?: unknown[] }) => Array.isArray(item.content) ? item.content : [])
      .filter((part: { type?: string; text?: unknown }) => part?.type === "output_text" && typeof part.text === "string")
      .map((part: { text: string }) => part.text)
      .join("\n").trim() : "";
    if (!answer) return error("The chat service didn’t return an answer. Please try again.", 502);
    return Response.json({ message: answer, model: CAREER_MODEL }, { headers });
  } catch (cause) {
    if (cause instanceof Error && ["TimeoutError", "AbortError"].includes(cause.name)) {
      return error("The reply took too long or was stopped. Please try again.", 504);
    }
    return error("I couldn’t reach the chat service. Please try again in a moment.", 503);
  }
}
