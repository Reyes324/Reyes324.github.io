#!/usr/bin/env python3
"""
Scraper for Paul Graham's essays from paulgraham.com
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import re
from datetime import datetime
from urllib.parse import urljoin

BASE_URL = "https://paulgraham.com/"
ARTICLES_URL = "https://paulgraham.com/articles.html"

def get_article_links():
    """Get all article links from the main articles page."""
    print("Fetching article list...")
    response = requests.get(ARTICLES_URL, timeout=30)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, 'html.parser')

    articles = []
    # Find all links that point to .html files
    for link in soup.find_all('a', href=True):
        href = link.get('href')
        title = link.get_text(strip=True)

        # Filter to only essay links (exclude external links, index, etc.)
        if href and href.endswith('.html') and title:
            # Skip the articles.html itself and other index pages
            if href in ['articles.html', 'index.html', 'books.html']:
                continue

            full_url = urljoin(BASE_URL, href)
            articles.append({
                'title': title,
                'url': full_url,
                'slug': href.replace('.html', '')
            })

    print(f"Found {len(articles)} articles")
    return articles


def extract_date_from_content(text):
    """Try to extract date from article content."""
    # Common patterns Paul Graham uses
    patterns = [
        r'(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})',
        r'(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})',
    ]

    for pattern in patterns:
        match = re.search(pattern, text[:2000])  # Check first part of content
        if match:
            return match.group(0)

    return None


def scrape_article(url, title):
    """Scrape a single article's content."""
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, 'html.parser')

        # Remove script and style elements
        for element in soup(['script', 'style', 'img']):
            element.decompose()

        # Get all text content
        # Paul Graham's pages are simple HTML, usually the main content is in a table or body
        body = soup.find('body')
        if body:
            text = body.get_text(separator='\n', strip=True)
        else:
            text = soup.get_text(separator='\n', strip=True)

        # Clean up the text
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        content = '\n'.join(lines)

        # Try to extract date
        date = extract_date_from_content(content)

        # Try to get the actual title from the page (often in font tags or first heading)
        page_title = None
        title_tag = soup.find('title')
        if title_tag:
            page_title = title_tag.get_text(strip=True)

        # Also check for font tags with size="+1" which PG often uses for titles
        font_title = soup.find('font', size=True)
        if font_title:
            page_title = font_title.get_text(strip=True) or page_title

        return {
            'page_title': page_title,
            'date': date,
            'content': content,
            'content_length': len(content)
        }

    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return {
            'page_title': None,
            'date': None,
            'content': None,
            'content_length': 0,
            'error': str(e)
        }


def main():
    """Main function to scrape all articles."""
    # Get article links
    articles = get_article_links()

    # Scrape each article
    results = []
    total = len(articles)

    for i, article in enumerate(articles, 1):
        print(f"[{i}/{total}] Scraping: {article['title'][:50]}...")

        details = scrape_article(article['url'], article['title'])

        result = {
            'title': article['title'],
            'url': article['url'],
            'slug': article['slug'],
            'page_title': details.get('page_title'),
            'date': details.get('date'),
            'content': details.get('content'),
            'content_length': details.get('content_length', 0),
            'error': details.get('error')
        }
        results.append(result)

        # Be polite - add a small delay between requests
        time.sleep(0.5)

    # Save results
    output_file = 'paulgraham_articles.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"\nDone! Saved {len(results)} articles to {output_file}")

    # Print summary
    successful = [r for r in results if r.get('content')]
    print(f"Successfully scraped: {len(successful)}")
    print(f"Failed: {len(results) - len(successful)}")

    # Total content size
    total_chars = sum(r.get('content_length', 0) for r in results)
    print(f"Total content: {total_chars:,} characters")

    return results


if __name__ == '__main__':
    main()
