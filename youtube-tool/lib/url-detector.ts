export type UrlType = 'youtube' | 'article' | 'unknown';

export function detectUrlType(url: string): UrlType {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace('www.', '');

    if (
      hostname === 'youtube.com' ||
      hostname === 'youtu.be' ||
      hostname === 'm.youtube.com'
    ) {
      // Validate it's a watch URL or short URL
      if (
        hostname === 'youtu.be' ||
        parsed.searchParams.has('v') ||
        parsed.pathname.startsWith('/shorts/')
      ) {
        return 'youtube';
      }
    }

    // Anything else with http(s) is treated as an article
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return 'article';
    }

    return 'unknown';
  } catch {
    return 'unknown';
  }
}

export function extractYoutubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace('www.', '');

    if (hostname === 'youtu.be') {
      return parsed.pathname.slice(1);
    }
    if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
      if (parsed.pathname.startsWith('/shorts/')) {
        return parsed.pathname.split('/shorts/')[1];
      }
      return parsed.searchParams.get('v');
    }
    return null;
  } catch {
    return null;
  }
}
