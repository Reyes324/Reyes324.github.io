import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

export interface ArticleData {
  title: string;
  author: string | null;
  siteName: string | null;
  content: string;
  language: string;
  excerpt: string | null;
}

export async function extractArticle(url: string): Promise<ArticleData | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; ContentBot/1.0; +https://github.com)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) return null;

    const lang =
      dom.window.document.documentElement.lang ||
      detectLanguage(article.textContent ?? '');

    return {
      title: article.title ?? '',
      author: article.byline ?? null,
      siteName: article.siteName ?? new URL(url).hostname ?? null,
      content: article.textContent ?? '',
      language: lang.startsWith('zh') ? 'zh' : 'en',
      excerpt: article.excerpt ?? null,
    };
  } catch (err) {
    console.error('Article extraction failed:', err);
    return null;
  }
}

function detectLanguage(text: string): string {
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) ?? []).length;
  const totalChars = text.replace(/\s/g, '').length;
  return totalChars > 0 && chineseChars / totalChars > 0.1 ? 'zh' : 'en';
}
