export const CHAT_MESSAGE_LIMIT = 2000;
export const CHAT_HISTORY_LIMIT = 21;

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export const careerQuestions = [
  "What do you do at Oliver James?",
  "How did your product career start?",
  "What’s your experience with AI?",
  "Have you worked with Salesforce?",
];
