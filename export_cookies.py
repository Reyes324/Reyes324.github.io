"""
从 Chrome 自动提取 YouTube cookies，输出 Netscape 格式。
用法：python export_cookies.py
输出文件：/tmp/yt_cookies.txt（同时打印内容，方便粘贴到 Vercel 环境变量）
"""
import sys
from pycookiecheat import chrome_cookies
from http.cookiejar import MozillaCookieJar
import http.cookiejar
import time

url = "https://www.youtube.com"
cookies = chrome_cookies(url)

if not cookies:
    print("没有找到 YouTube cookies，确认你已经在 Chrome 登录了 YouTube。")
    sys.exit(1)

# 写成 Netscape 格式
output_path = "/tmp/yt_cookies.txt"
jar = MozillaCookieJar(output_path)

for name, value in cookies.items():
    cookie = http.cookiejar.Cookie(
        version=0, name=name, value=value,
        port=None, port_specified=False,
        domain=".youtube.com", domain_specified=True, domain_initial_dot=True,
        path="/", path_specified=True,
        secure=True, expires=int(time.time()) + 86400 * 365,
        discard=False, comment=None, comment_url=None, rest={}, rfc2109=False,
    )
    jar.set_cookie(cookie)

jar.save(ignore_discard=True, ignore_expires=True)

with open(output_path) as f:
    content = f.read()

print(content)
print(f"\n✅ 已保存到 {output_path}")
print("📋 把上面的内容粘贴到 Vercel 环境变量 YOUTUBE_COOKIES 里就行")
