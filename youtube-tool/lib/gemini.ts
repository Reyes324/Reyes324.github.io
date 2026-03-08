import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  TRANSLATE_TO_ZH,
  SUMMARIZE_CONTENT,
  GENERATE_PODCAST_SCRIPT,
} from './prompts';

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');
  return new GoogleGenerativeAI(apiKey);
}

async function generateText(prompt: string): Promise<string> {
  const client = getClient();
  const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function translateToZh(content: string): Promise<string> {
  // Split long content into chunks to stay within token limits
  const CHUNK_SIZE = 6000;
  if (content.length <= CHUNK_SIZE) {
    return generateText(TRANSLATE_TO_ZH(content));
  }

  // Split by paragraphs
  const paragraphs = content.split(/\n\n+/);
  const chunks: string[] = [];
  let current = '';

  for (const para of paragraphs) {
    if ((current + para).length > CHUNK_SIZE && current) {
      chunks.push(current.trim());
      current = para;
    } else {
      current += '\n\n' + para;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  const translated = await Promise.all(
    chunks.map((chunk) => generateText(TRANSLATE_TO_ZH(chunk)))
  );
  return translated.join('\n\n');
}

export interface Summary {
  core_summary: string;
  key_points: string[];
  quotes: string[];
  reflections: string[];
}

export async function generateSummary(
  contentZh: string,
  type: 'video' | 'article'
): Promise<Summary> {
  const text = await generateText(SUMMARIZE_CONTENT(contentZh, type));
  const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(cleaned);
}

export interface PodcastLine {
  speaker: 'Alex' | 'Sam';
  text: string;
}

export async function generatePodcastScript(
  contentZh: string,
  title: string
): Promise<PodcastLine[]> {
  const text = await generateText(GENERATE_PODCAST_SCRIPT(contentZh, title));
  const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(cleaned);
}
