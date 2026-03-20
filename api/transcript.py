"""
Vercel Serverless Function: YouTube transcript extraction
Uses yt-dlp with cookie authentication to bypass YouTube IP blocks
"""

from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import json
import os
import tempfile

import yt_dlp


COOKIE_PATH = '/tmp/yt_cookies.txt'


def _write_cookies():
    """Write cookies from env var to temp file. Returns True if cookies available."""
    content = os.environ.get('YOUTUBE_COOKIES', '')
    if content:
        with open(COOKIE_PATH, 'w') as f:
            f.write(content)
        return True
    return False


def _ydl_opts(extra=None):
    """Base yt-dlp options with cookie support."""
    opts = {
        'skip_download': True,
        'quiet': True,
        'no_warnings': True,
        'ignore_no_formats_error': True,
    }
    if os.path.exists(COOKIE_PATH):
        opts['cookiefile'] = COOKIE_PATH
    if extra:
        opts.update(extra)
    return opts


def _list_languages(video_id):
    """List available subtitle languages for a video."""
    with yt_dlp.YoutubeDL(_ydl_opts()) as ydl:
        info = ydl.extract_info(
            f'https://www.youtube.com/watch?v={video_id}', download=False
        )

    languages = []
    # Manual subtitles first
    for code, tracks in (info.get('subtitles') or {}).items():
        name = tracks[0].get('name', code) if tracks else code
        languages.append({'code': code, 'name': name, 'is_generated': False})
    # Then auto-generated
    for code, tracks in (info.get('automatic_captions') or {}).items():
        name = tracks[0].get('name', code) if tracks else code
        languages.append({'code': code, 'name': name, 'is_generated': True})

    return languages


def _fetch_transcript(video_id, lang='en'):
    """Fetch transcript for a video in the requested language."""
    with tempfile.TemporaryDirectory() as tmpdir:
        output = os.path.join(tmpdir, 'sub')
        opts = _ydl_opts({
            'writeautomaticsub': True,
            'writesubtitles': True,
            'subtitleslangs': [lang],
            'subtitlesformat': 'json3',
            'outtmpl': output,
        })

        with yt_dlp.YoutubeDL(opts) as ydl:
            ydl.download([f'https://www.youtube.com/watch?v={video_id}'])

        # Find the subtitle file
        sub_file = None
        for f in os.listdir(tmpdir):
            if f.endswith('.json3'):
                sub_file = os.path.join(tmpdir, f)
                break

        if not sub_file:
            raise Exception('No subtitles found for this video')

        # Detect actual language from filename (e.g. sub.en.json3)
        actual_lang = os.path.basename(sub_file).replace('sub.', '').replace('.json3', '')

        with open(sub_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

    # Parse json3 format
    snippets = []
    for event in data.get('events', []):
        segs = event.get('segs', [])
        text = ''.join(s.get('utf8', '') for s in segs).strip()
        if not text or text == '\n':
            continue
        snippets.append({
            'text': text,
            'start': event.get('tStartMs', 0) / 1000.0,
            'duration': event.get('dDurationMs', 0) / 1000.0,
        })

    return snippets, actual_lang


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

        _write_cookies()

        try:
            if list_langs == '1':
                languages = _list_languages(video_id)
                self._send_json({
                    'video_id': video_id,
                    'languages': languages,
                })
                return

            snippets, actual_lang = _fetch_transcript(video_id, lang)
            languages = _list_languages(video_id)

            self._send_json({
                'video_id': video_id,
                'language': actual_lang,
                'languages': languages,
                'transcript': snippets,
            })

        except Exception as e:
            error_msg = str(e)
            if 'disabled' in error_msg.lower():
                error_msg = 'This video has subtitles disabled'
            elif 'no subtitle' in error_msg.lower() or 'no transcript' in error_msg.lower():
                error_msg = 'No subtitles found for this video'
            self._send_json({'error': error_msg}, 500)
