// Serverless API handler for scraping AWS official channels for Kiro content
// Fetches pages and extracts Kiro-related announcements, blog posts, and videos

// Allowed first-party domains - only scrape from these
const ALLOWED_DOMAINS = [
  'aws.amazon.com',
  'kiro.dev',
  'docs.aws.amazon.com',
  'youtube.com',
  'www.youtube.com',
  'aboutamazon.com',
];

const isAllowedDomain = (url) => {
  try {
    const parsedUrl = new URL(url);
    return ALLOWED_DOMAINS.some(
      (domain) =>
        parsedUrl.hostname === domain ||
        parsedUrl.hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
};

// Extract Kiro-related items from HTML content
const extractItemsFromHtml = (html, sourceUrl, sourceType) => {
  const items = [];
  const baseUrl = new URL(sourceUrl);

  // Extract links with surrounding text that mention Kiro
  // Pattern: find <a> tags and their text content
  const linkPattern = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = linkPattern.exec(html)) !== null) {
    const href = match[1];
    const linkText = match[2].replace(/<[^>]*>/g, '').trim();

    if (!linkText || linkText.length < 5) continue;

    // Check if the link text mentions Kiro
    if (!linkText.toLowerCase().includes('kiro')) continue;

    // Resolve relative URLs
    let fullUrl;
    try {
      fullUrl = new URL(href, sourceUrl).href;
    } catch {
      continue;
    }

    // Only include first-party links
    if (!isAllowedDomain(fullUrl)) continue;

    items.push({
      title: linkText.substring(0, 200),
      url: fullUrl,
      sourceType,
      sourceName: getSourceName(sourceUrl),
      discoveredAt: new Date().toISOString(),
    });
  }

  // Extract meta/title info from the page itself
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const pageTitle = titleMatch
    ? titleMatch[1].replace(/<[^>]*>/g, '').trim()
    : '';

  // Extract meta description
  const metaDescMatch = html.match(
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i
  );
  const metaDesc = metaDescMatch ? metaDescMatch[1].trim() : '';

  // If the page itself is Kiro-related, include it
  const pageText = `${pageTitle} ${metaDesc}`;
  if (pageText.toLowerCase().includes('kiro')) {
    // Check if we already have this URL
    const alreadyIncluded = items.some((item) => item.url === sourceUrl);
    if (!alreadyIncluded) {
      items.push({
        title: pageTitle || 'Kiro Page',
        description: metaDesc || '',
        url: sourceUrl,
        sourceType,
        sourceName: getSourceName(sourceUrl),
        discoveredAt: new Date().toISOString(),
      });
    }
  }

  // Extract structured data (JSON-LD) if present
  const jsonLdPattern = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let jsonLdMatch;
  while ((jsonLdMatch = jsonLdPattern.exec(html)) !== null) {
    try {
      const data = JSON.parse(jsonLdMatch[1]);
      const entries = Array.isArray(data) ? data : [data];
      for (const entry of entries) {
        if (
          entry.name &&
          entry.name.toLowerCase().includes('kiro') &&
          entry.url
        ) {
          if (isAllowedDomain(entry.url)) {
            items.push({
              title: entry.name,
              description: entry.description || '',
              url: entry.url,
              publishedAt: entry.datePublished || entry.dateCreated || null,
              sourceType,
              sourceName: getSourceName(sourceUrl),
              discoveredAt: new Date().toISOString(),
            });
          }
        }
      }
    } catch {
      // Invalid JSON-LD, skip
    }
  }

  return deduplicateByUrl(items);
};

// Extract items from YouTube search results
const extractYoutubeItems = (html) => {
  const items = [];

  // YouTube embeds video data in initial data scripts
  // Look for video renderer patterns with Kiro in title
  const videoPattern =
    /"title":\s*\{"runs":\s*\[\{"text":\s*"([^"]*[Kk]iro[^"]*)"\}/g;
  let match;
  while ((match = videoPattern.exec(html)) !== null) {
    const title = match[1];
    items.push({
      title,
      url: '', // Will be populated from videoId if found
      sourceType: 'youtube',
      sourceName: 'AWS YouTube',
      discoveredAt: new Date().toISOString(),
    });
  }

  // Try to extract video IDs near Kiro mentions
  const videoIdPattern = /"videoId":\s*"([a-zA-Z0-9_-]{11})"/g;
  let idMatch;
  const videoIds = [];
  while ((idMatch = videoIdPattern.exec(html)) !== null) {
    videoIds.push(idMatch[1]);
  }

  // Match video IDs to items (best effort)
  for (let i = 0; i < Math.min(items.length, videoIds.length); i++) {
    items[i].url = `https://www.youtube.com/watch?v=${videoIds[i]}`;
  }

  return items.filter((item) => item.url);
};

// Get human-readable source name from URL
const getSourceName = (url) => {
  try {
    const hostname = new URL(url).hostname;
    if (hostname.includes('youtube')) return 'AWS YouTube';
    if (hostname.includes('kiro.dev')) return 'Kiro Docs';
    if (hostname.includes('aws.amazon.com')) return 'AWS';
    return 'AWS';
  } catch {
    return 'AWS';
  }
};

// Deduplicate items by URL
const deduplicateByUrl = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    if (!item.url || seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sourceId, url, type, searchTerms } = req.body;

    if (!url || !type) {
      return res
        .status(400)
        .json({ error: 'Missing required fields: url, type' });
    }

    // Validate URL is from an allowed domain
    if (!isAllowedDomain(url)) {
      return res
        .status(400)
        .json({ error: 'URL is not from an allowed first-party domain' });
    }

    console.log(`Scraping ${type} source: ${url}`);

    let fetchUrl = url;

    // For YouTube, use search URL to find Kiro content
    if (type === 'youtube') {
      const terms = (searchTerms || ['kiro']).join('+');
      fetchUrl = `https://www.youtube.com/results?search_query=aws+${encodeURIComponent(terms)}&sp=CAI%253D`;
    }

    // Fetch the page
    const response = await fetch(fetchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; KiroNewsletterBot/1.0; +https://github.com/luv-letter)',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${fetchUrl}: HTTP ${response.status}`);
      return res.status(502).json({
        error: `Failed to fetch source: HTTP ${response.status}`,
        items: [],
      });
    }

    const html = await response.text();

    // Extract items based on source type
    let items;
    if (type === 'youtube') {
      items = extractYoutubeItems(html);
    } else {
      items = extractItemsFromHtml(html, url, type);
    }

    console.log(
      `Found ${items.length} Kiro-related items from ${sourceId || url}`
    );

    return res.status(200).json({
      success: true,
      sourceId,
      items,
      scrapedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Scrape error:', error.message);
    return res.status(500).json({
      error: 'Failed to scrape source',
      details: error.message,
      items: [],
    });
  }
}
