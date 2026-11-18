import { handleCareerChat } from "@/lib/server/career-chat";

export const runtime = "nodejs";
export const maxDuration = 65;

export async function POST(request: Request) {
  return handleCareerChat(request, {
    apiKey: process.env.OPENAI_API_KEY,
    expiresAt: process.env.OPEN_AI_EXPIRATION,
    model: process.env.CAREER_MODEL,
    signingSecret: process.env.CHAT_SIGNING_SECRET,
    clientIpHeader: process.env.CHAT_CLIENT_IP_HEADER,
    dailyRequestLimit: process.env.CHAT_DAILY_REQUEST_LIMIT,
  });
}
