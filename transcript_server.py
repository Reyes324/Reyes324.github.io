#!/usr/bin/env python3
"""
YouTube 逐字稿提取服务器
配合 youtube-transcript.html 使用

安装依赖：
    pip install youtube-transcript-api flask flask-cors

启动：
    python3 transcript_server.py

服务器会在 http://localhost:5000 启动
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from youtube_transcript_api import YouTubeTranscriptApi

app = Flask(__name__)
CORS(app)

ytt_api = YouTubeTranscriptApi()


@app.route('/api/transcript')
def get_transcript():
    video_id = request.args.get('video_id', '').strip()
    lang = request.args.get('lang', '').strip()

    if not video_id:
        return jsonify({'error': '缺少 video_id 参数'}), 400

    try:
        # List available transcripts
        transcript_list = ytt_api.list(video_id)
        languages = []
        for t in transcript_list:
            languages.append({
                'code': t.language_code,
                'name': t.language,
                'is_generated': t.is_generated,
            })

        # Fetch transcript
        if lang:
            transcript = ytt_api.fetch(video_id, languages=[lang])
        else:
            transcript = ytt_api.fetch(video_id)

        snippets = []
        for snippet in transcript.snippets:
            snippets.append({
                'text': snippet.text,
                'start': snippet.start,
                'duration': snippet.duration,
            })

        return jsonify({
            'video_id': video_id,
            'language': transcript.language_code,
            'languages': languages,
            'transcript': snippets,
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/health')
def health():
    return jsonify({'status': 'ok'})


if __name__ == '__main__':
    print('YouTube 逐字稿服务器启动中...')
    print('访问 http://localhost:5000/api/health 检查状态')
    print('前端页面：打开 youtube-transcript.html')
    app.run(host='0.0.0.0', port=5000, debug=True)
