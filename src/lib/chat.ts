/** Limits shared by the chat client and server so both enforce the same rules. */
export const CHAT_MESSAGE_LIMIT = 2000; // characters per visitor question
export const CHAT_REPLY_LIMIT = 6000; // characters per assistant reply accepted back as history
export const CHAT_MAX_EXCHANGES = 10; // earlier question/answer pairs kept as context
export const CHAT_HISTORY_LIMIT = CHAT_MAX_EXCHANGES * 2 + 1; // pairs plus the new question
export const CHAT_HISTORY_CHAR_LIMIT = 24_000; // total characters across the conversation

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  /** Server-issued HMAC proving an assistant reply was not edited by the client. */
  signature?: string;
};

/**
 * Drops the oldest question/answer pairs until the conversation fits both the
 * message-count and character limits. Expects strict user/assistant
 * alternation ending with a user message, and always keeps that last question.
 */
export function trimHistory<T extends ChatMessage>(messages: T[]): T[] {
  let trimmed = messages;
  const characters = (list: T[]) => list.reduce((sum, message) => sum + message.content.length, 0);
  while (
    trimmed.length > 1 &&
    (trimmed.length > CHAT_HISTORY_LIMIT || characters(trimmed) > CHAT_HISTORY_CHAR_LIMIT)
  ) {
    trimmed = trimmed.slice(2);
  }
  return trimmed;
}

export const careerQuestions = [
  "What do you do at Oliver James?",
  "How did your product career start?",
  "What’s your experience with AI?",
  "Have you worked with Salesforce?",
];
