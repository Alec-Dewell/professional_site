"use client";

import Link from "next/link";
import {
  ArrowUp,
  ArrowUpRight,
  LoaderCircle,
  MessageCircle,
  RotateCcw,
  Square,
  X,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { careerQuestions, CHAT_MESSAGE_LIMIT, trimHistory, type ChatMessage } from "@/lib/chat";
import "./career-chat.css";

type DisplayMessage = ChatMessage & { id: number; failed?: boolean };

export function CareerChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [failedQuestion, setFailedQuestion] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<AbortController | null>(null);
  const sequence = useRef(0);
  const nextId = useRef(0);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!open) {
      if (dialog.open) dialog.close();
      return;
    }
    if (!dialog.open) dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
    return () => {
      document.body.style.overflow = previousOverflow;
      cancelAnimationFrame(frame);
    };
  }, [open]);

  useEffect(() => {
    const transcript = transcriptRef.current;
    if (transcript) transcript.scrollTop = transcript.scrollHeight;
  }, [messages, busy, error, open]);

  useEffect(
    () => () => {
      requestRef.current?.abort();
    },
    [],
  );

  function focusInput() {
    requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
  }

  function reset() {
    sequence.current++;
    requestRef.current?.abort();
    setMessages([]);
    setError("");
    setFailedQuestion("");
    setInput("");
    setBusy(false);
    focusInput();
  }

  async function send(question: string) {
    const content = question.trim();
    if (busy || !content || content.length > CHAT_MESSAGE_LIMIT) return;
    const base = messages.filter((message) => !message.failed);
    const next: DisplayMessage[] = [...base, { id: nextId.current++, role: "user", content }];
    const requestId = ++sequence.current;
    const controller = new AbortController();
    requestRef.current = controller;
    setMessages(next);
    setInput("");
    setError("");
    setFailedQuestion("");
    setBusy(true);
    try {
      // The full conversation stays on screen; only the most recent part that
      // fits the shared limits is sent as context.
      const history = trimHistory(next).map(({ role, content, signature }) => ({
        role,
        content,
        signature,
      }));
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          typeof data?.error === "string"
            ? data.error
            : "The chat is unavailable. Please try again.",
        );
      }
      if (typeof data?.message !== "string" || !data.message.trim()) {
        throw new Error("No answer came back. Please try again.");
      }
      if (requestId !== sequence.current) return;
      setMessages([
        ...next,
        {
          id: nextId.current++,
          role: "assistant",
          content: data.message,
          signature: typeof data.signature === "string" ? data.signature : undefined,
        },
      ]);
    } catch (cause) {
      if (requestId !== sequence.current) return;
      setMessages([...base, { id: nextId.current++, role: "user", content, failed: true }]);
      setFailedQuestion(content);
      setError(
        controller.signal.aborted
          ? "Reply stopped. You can retry or ask another question."
          : cause instanceof Error
            ? cause.message
            : "I couldn’t send that question. Please try again.",
      );
    } finally {
      if (requestId === sequence.current) {
        setBusy(false);
        requestRef.current = null;
        focusInput();
      }
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void send(input);
  }

  function keyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void send(input);
    }
  }

  function closeOnBackdrop(event: MouseEvent<HTMLDialogElement>) {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const outside =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;
    if (outside) setOpen(false);
  }

  return (
    <>
      <button
        className="chat-launcher"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <MessageCircle size={19} strokeWidth={1.6} />
        <span>
          Ask my AI <span>About my career</span>
        </span>
        <ArrowUpRight size={17} />
      </button>
      <dialog
        ref={dialogRef}
        className="career-chat"
        aria-labelledby="career-chat-title"
        onClose={() => setOpen(false)}
        onClick={closeOnBackdrop}
      >
        <div className="chat-shell">
          <header className="chat-header">
            <div className="chat-avatar" aria-hidden="true">
              ad<span>↗</span>
            </div>
            <div className="chat-heading">
              <h2 id="career-chat-title">Alec’s digital twin</h2>
              <span>
                <i />
                AI career chat
              </span>
            </div>
            <button
              className="chat-icon-button"
              onClick={reset}
              aria-label="Start a new chat"
              title="Start a new chat"
              disabled={messages.length === 0 && !busy}
            >
              <RotateCcw size={16} />
            </button>
            <button
              className="chat-icon-button"
              onClick={() => setOpen(false)}
              aria-label="Close career chat"
            >
              <X size={20} />
            </button>
          </header>
          <div
            ref={transcriptRef}
            className="chat-transcript"
            role="log"
            aria-label="Career conversation"
            aria-live="polite"
            aria-relevant="additions text"
          >
            {messages.length === 0 ? (
              <div className="chat-welcome">
                <span className="chat-eyebrow">ASK ABOUT MY CAREER</span>
                <h3>
                  What would you
                  <br />
                  <span>like to know?</span>
                </h3>
                <p>I’m an AI version of Alec. My answers use his career profile.</p>
                <p className="chat-no-personal-data">
                  Please don’t share personal details such as your phone number or address.
                </p>
                <div className="chat-suggestions">
                  {careerQuestions.map((question) => (
                    <button key={question} onClick={() => void send(question)}>
                      {question}
                      <ArrowUpRight size={14} />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <p className="chat-identity">AI answers based on Alec’s career profile.</p>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`chat-message chat-message-${message.role}${message.failed ? " chat-message-failed" : ""}`}
                  >
                    <span className="chat-speaker">
                      {message.role === "user" ? "YOU" : "ALEC’S DIGITAL TWIN"}
                    </span>
                    <p>{message.content}</p>
                    {message.role === "assistant" && (
                      <Link href="/#journey" onClick={() => setOpen(false)}>
                        View career history
                        <ArrowUpRight size={11} />
                      </Link>
                    )}
                  </div>
                ))}
              </>
            )}
            {busy && (
              <div className="chat-thinking" role="status">
                <LoaderCircle size={15} />
                <span>Checking my career profile…</span>
              </div>
            )}
            {error && (
              <div className="chat-error" role="alert">
                <p>{error}</p>
                <button onClick={() => void send(failedQuestion)}>
                  <RotateCcw size={13} />
                  Try again
                </button>
              </div>
            )}
          </div>
          <form className="chat-composer" onSubmit={submit}>
            <label htmlFor="career-question" className="chat-input-label">
              Your question
            </label>
            <div className="chat-input-row">
              {/* readOnly (not disabled) keeps keyboard and screen-reader focus here while a reply loads. */}
              <textarea
                id="career-question"
                ref={inputRef}
                placeholder="Ask about my experience…"
                rows={2}
                value={input}
                maxLength={CHAT_MESSAGE_LIMIT}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={keyDown}
                readOnly={busy}
                aria-busy={busy}
              />
              {busy ? (
                <button
                  type="button"
                  className="chat-send chat-stop"
                  onClick={() => requestRef.current?.abort()}
                  aria-label="Stop reply"
                >
                  <Square size={14} fill="currentColor" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="chat-send"
                  disabled={!input.trim()}
                  aria-label="Send question"
                >
                  <ArrowUp size={19} />
                </button>
              )}
            </div>
            <div className="chat-input-hint">
              <span>Enter to send · Shift + Enter for a new line</span>
              {input.length > CHAT_MESSAGE_LIMIT - 200 && (
                <span>
                  {input.length}/{CHAT_MESSAGE_LIMIT}
                </span>
              )}
            </div>
            <p className="chat-privacy">
              This is AI, not a live chat with Alec. Messages are sent to OpenAI to generate a
              reply. This site doesn’t save your chat.{" "}
              <Link href="/privacy" onClick={() => setOpen(false)}>
                Privacy notice
              </Link>
            </p>
          </form>
        </div>
      </dialog>
    </>
  );
}
