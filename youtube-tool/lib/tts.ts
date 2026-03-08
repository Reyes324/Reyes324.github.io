import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import path from 'path';
import fs from 'fs/promises';
import { PodcastLine } from './gemini';

const VOICES = {
  Alex: 'zh-CN-YunxiNeural',
  Sam: 'zh-CN-XiaoxiaoNeural',
};

export async function generatePodcastAudio(
  script: PodcastLine[],
  outputId: string
): Promise<string> {
  const audioDir = path.join(process.cwd(), 'public', 'audio');
  await fs.mkdir(audioDir, { recursive: true });

  const tts = new MsEdgeTTS();
  const segments: Buffer[] = [];

  for (const line of script) {
    const voice = VOICES[line.speaker] ?? VOICES.Alex;
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    const audioData = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      const { audioStream } = tts.toStream(line.text);
      audioStream.on('data', (chunk: Buffer) => chunks.push(chunk));
      audioStream.on('end', () => resolve(Buffer.concat(chunks)));
      audioStream.on('error', reject);
    });

    segments.push(audioData);
  }

  const combined = Buffer.concat(segments);
  const filename = `${outputId}.mp3`;
  const filePath = path.join(audioDir, filename);
  await fs.writeFile(filePath, combined);

  return `/audio/${filename}`;
}
