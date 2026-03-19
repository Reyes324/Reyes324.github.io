"""
Vercel Serverless Function: YouTube transcript extraction
Uses youtube-transcript-api (no cookies/browser needed)
"""

from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import json

from youtube_transcript_api import YouTubeTranscriptApi


class handler(BaseHTTPRequestHandler):
    def _set_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def _send_json(self, data, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self._set_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(204)
        self._set_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)

        video_id = params.get('video_id', [''])[0].strip()
        if not video_id:
            self._send_json({'error': 'Missing video_id parameter'}, 400)
            return

        list_langs = params.get('list_langs', [''])[0]
        lang = params.get('lang', [''])[0].strip() or 'en'

        try:
            ytt_api = YouTubeTranscriptApi()

            # List available languages
            if list_langs == '1':
                transcript_list = ytt_api.list(video_id)
                languages = []
                for t in transcript_list:
                    languages.append({
                        'code': t.language_code,
                        'name': t.language,
                        'is_generated': t.is_generated,
                    })
                self._send_json({
                    'video_id': video_id,
                    'languages': languages,
                })
                return

            # Fetch transcript
            transcript_list = ytt_api.list(video_id)

            # Try to find the requested language
            transcript = None
            try:
                transcript = transcript_list.find_transcript([lang])
            except Exception:
                # Fall back: try generated captions
                try:
                    transcript = transcript_list.find_generated_transcript([lang])
                except Exception:
                    # Last resort: get the first available
                    for t in transcript_list:
                        transcript = t
                        break

            if transcript is None:
                self._send_json({'error': 'No transcripts available for this video'}, 404)
                return

            snippets = transcript.fetch()

            # Build language list
            languages = []
            for t in transcript_list:
                languages.append({
                    'code': t.language_code,
                    'name': t.language,
                    'is_generated': t.is_generated,
                })

            # Format response
            result_transcript = []
            for snippet in snippets:
                result_transcript.append({
                    'text': snippet.text,
                    'start': snippet.start,
                    'duration': snippet.duration,
                })

            self._send_json({
                'video_id': video_id,
                'language': transcript.language_code,
                'languages': languages,
                'transcript': result_transcript,
            })

        except Exception as e:
            error_msg = str(e)
            if 'disabled' in error_msg.lower():
                error_msg = 'This video has subtitles disabled'
            elif 'no transcript' in error_msg.lower():
                error_msg = 'No subtitles found for this video'
            self._send_json({'error': error_msg}, 500)
