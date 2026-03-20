"""Unit tests for the Vercel serverless function (api/transcript.py)."""
import json
from io import BytesIO
from unittest.mock import MagicMock, patch

from api.transcript import handler


def _make_handler(path):
    """Create a mock handler to test the Vercel function."""
    h = object.__new__(handler)
    h.path = path
    h.wfile = BytesIO()
    h.send_response = MagicMock()
    h.send_header = MagicMock()
    h.end_headers = MagicMock()
    return h


def _get_response_json(h):
    """Extract the JSON body written to wfile."""
    return json.loads(h.wfile.getvalue().decode('utf-8'))


def test_missing_video_id():
    h = _make_handler('/api/transcript')
    h.do_GET()
    h.send_response.assert_called_with(400)
    data = _get_response_json(h)
    assert 'error' in data


def test_options_cors():
    h = _make_handler('/api/transcript')
    h.do_OPTIONS()
    h.send_response.assert_called_with(204)


def test_transcript_fetch_success():
    mock_snippets = [
        {'text': 'Hello world', 'start': 1.5, 'duration': 3.0},
    ]

    with patch('api.transcript._write_cookies'), \
         patch('api.transcript._fetch_transcript', return_value=(mock_snippets, 'en')), \
         patch('api.transcript._list_languages', return_value=[
             {'code': 'en', 'name': 'English', 'is_generated': True},
         ]):
        h = _make_handler('/api/transcript?video_id=dQw4w9WgXcQ')
        h.do_GET()

    h.send_response.assert_called_with(200)
    data = _get_response_json(h)
    assert data['video_id'] == 'dQw4w9WgXcQ'
    assert len(data['transcript']) == 1
    assert data['transcript'][0]['text'] == 'Hello world'


def test_list_languages():
    with patch('api.transcript._write_cookies'), \
         patch('api.transcript._list_languages', return_value=[
             {'code': 'en', 'name': 'English', 'is_generated': False},
         ]):
        h = _make_handler('/api/transcript?video_id=dQw4w9WgXcQ&list_langs=1')
        h.do_GET()

    h.send_response.assert_called_with(200)
    data = _get_response_json(h)
    assert 'languages' in data
    assert data['languages'][0]['code'] == 'en'
    assert 'transcript' not in data


def test_no_transcripts_available():
    with patch('api.transcript._write_cookies'), \
         patch('api.transcript._fetch_transcript', side_effect=Exception('No subtitles found')), \
         patch('api.transcript._list_languages', return_value=[]):
        h = _make_handler('/api/transcript?video_id=dQw4w9WgXcQ')
        h.do_GET()

    h.send_response.assert_called_with(500)
    data = _get_response_json(h)
    assert 'error' in data


def test_disabled_video_error_message():
    with patch('api.transcript._write_cookies'), \
         patch('api.transcript._fetch_transcript', side_effect=Exception('Subtitles are disabled for this video')), \
         patch('api.transcript._list_languages', return_value=[]):
        h = _make_handler('/api/transcript?video_id=xxx')
        h.do_GET()

    h.send_response.assert_called_with(500)
    data = _get_response_json(h)
    assert 'disabled' in data['error'].lower()
