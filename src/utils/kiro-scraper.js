// Scrapers/watchers for AWS official channels to detect Kiro-related content
// Fetches from aws.amazon.com, YouTube, and Kiro documentation sites

import { KIRO_SOURCE_CONFIGS, isFirstPartySource, isKiroRelated } from './kiro-sources';

// Scrape a single source by calling our serverless API endpoint
const scrapeSource = async (sourceConfig) => {
  try {
    const response = await fetch('/api/scrape-kiro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceId: sourceConfig.id,
        url: sourceConfig.url,
        type: sourceConfig.type,
        searchTerms: sourceConfig.searchTerms,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return {
      sourceId: sourceConfig.id,
      sourceName: sourceConfig.name,
      sourceType: sourceConfig.type,
      items: data.items || [],
      scrapedAt: new Date().toISOString(),
      success: true,
    };
  } catch (error) {
    console.error(`Error scraping ${sourceConfig.name}:`, error.message);
    return {
      sourceId: sourceConfig.id,
      sourceName: sourceConfig.name,
      sourceType: sourceConfig.type,
      items: [],
      scrapedAt: new Date().toISOString(),
      success: false,
      error: error.message,
    };
  }
};

// Scrape all configured sources
export const scrapeAllSources = async () => {
  const results = await Promise.allSettled(
    KIRO_SOURCE_CONFIGS.map((config) => scrapeSource(config))
  );

  return results.map((result) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    return {
      sourceId: 'unknown',
      sourceName: 'Unknown',
      sourceType: 'unknown',
      items: [],
      scrapedAt: new Date().toISOString(),
      success: false,
      error: result.reason?.message || 'Unknown error',
    };
  });
};

// Scrape a specific source by its ID
export const scrapeSourceById = async (sourceId) => {
  const config = KIRO_SOURCE_CONFIGS.find((c) => c.id === sourceId);
  if (!config) {
    throw new Error(`Unknown source: ${sourceId}`);
  }
  return scrapeSource(config);
};

// Filter scraped items to ensure only first-party Kiro content
export const filterFirstPartyKiroContent = (items) => {
  return items.filter((item) => {
    // Must be from a first-party domain
    if (item.url && !isFirstPartySource(item.url)) {
      return false;
    }
    // Must be Kiro-related (check title and description)
    const textToCheck = `${item.title || ''} ${item.description || ''} ${item.content || ''}`;
    return isKiroRelated(textToCheck);
  });
};

// Deduplicate items by URL, keeping the most recent version
export const deduplicateItems = (existingItems, newItems) => {
  const urlMap = new Map();

  // Add existing items first
  for (const item of existingItems) {
    if (item.url) {
      urlMap.set(item.url, item);
    }
  }

  // New items override existing ones (they may have updated content)
  const addedUrls = [];
  for (const item of newItems) {
    if (item.url && !urlMap.has(item.url)) {
      addedUrls.push(item.url);
    }
    if (item.url) {
      urlMap.set(item.url, item);
    }
  }

  return {
    items: Array.from(urlMap.values()),
    newCount: addedUrls.length,
  };
};

// Get all source configs
export const getSourceConfigs = () => KIRO_SOURCE_CONFIGS;
