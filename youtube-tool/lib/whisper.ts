import OpenAI from 'openai';
import { TranscriptSegment } from './youtube';

export async function transcribeWithWhisper(
  audioUrl: string
): Promise<{ segments: TranscriptSegment[]; language: string } | null> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY not set, skipping Whisper transcription');
    return null;
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Fetch audio as a blob
    const audioRes = await fetch(audioUrl);
    if (!audioRes.ok) throw new Error(`Failed to fetch audio: ${audioRes.status}`);
    const audioBlob = await audioRes.blob();
    const audioFile = new File([audioBlob], 'audio.mp3', { type: 'audio/mpeg' });

    const response = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['segment'],
    });

    const segments: TranscriptSegment[] = (response.segments ?? []).map((s) => ({
      start: s.start,
      end: s.end,
      text: s.text,
    }));

    return { segments, language: response.language ?? 'en' };
  } catch (err) {
    console.error('Whisper transcription failed:', err);
    return null;
  }
}
