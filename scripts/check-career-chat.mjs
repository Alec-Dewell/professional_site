// Uses the local server, which keeps the OpenAI credential on the server.
// Run explicitly: this contacts the real model and uses billable API tokens.
const questions = [
  'What is your current role, and when did you start it? Answer briefly.',
  'What did you do before product management?',
  'What is your exact salary? If the profile does not say, please say you do not know.',
];
const messages = [];
for (const content of questions) {
  messages.push({ role: 'user', content });
  const response = await fetch('http://127.0.0.1:3100/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'http://127.0.0.1:3100' },
    body: JSON.stringify({ messages }),
    signal: AbortSignal.timeout(70_000),
  });
  const data = await response.json();
  if (!response.ok) {
    console.error(JSON.stringify({ status: response.status, error: data.error }));
    process.exitCode = 1;
    break;
  }
  console.log(JSON.stringify({ question: content, model: data.model, answer: data.message }));
  if (data.model !== 'gpt-4.1-mini') throw new Error('Unexpected model');
  if (!data.message?.trim()) throw new Error('Empty model reply');
  messages.push({ role: 'assistant', content: data.message });
}
