import OpenAI from 'openai';

let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

export async function chatCompletion(
  systemPrompt: string,
  userPrompt: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const openai = getOpenAIClient();
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 4096,
    response_format: { type: 'json_object' },
  });
  return response.choices[0].message.content || '{}';
}

export async function transcribeAudio(audioBuffer: Buffer, filename: string): Promise<string> {
  const openai = getOpenAIClient();
  const file = new File([new Uint8Array(audioBuffer)], filename, { type: 'audio/webm' });
  const transcription = await openai.audio.transcriptions.create({
    model: 'whisper-1',
    file,
    language: 'fr',
  });
  return transcription.text;
}
