// Aggregation pipeline: scrape -> deduplicate -> filter -> score -> format -> deliver
// Transforms raw scraped items into structured "bite-sized" newsletter digests

import { scrapeAllSources, filterFirstPartyKiroContent, deduplicateItems } from './kiro-scraper';
import { KIRO_KEYWORDS } from './kiro-sources';
import {
  getKiroItems,
  addKiroItems,
  addScrapeLogEntry,
  addNewsletterHistoryEntry,
} from './storage';

// Relevance scoring: higher score = more relevant to Kiro specifically
const scoreRelevance = (item) => {
  let score = 0;
  const text = `${item.title || ''} ${item.description || ''} ${item.content || ''}`.toLowerCase();

  // Direct Kiro mentions in title are strongest signal
  if ((item.title || '').toLowerCase().includes('kiro')) {
    score += 10;
  }

  // Count keyword hits across all text
  for (const keyword of KIRO_KEYWORDS) {
    const regex = new RegExp(keyword, 'gi');
    const matches = text.match(regex);
    if (matches) {
      score += matches.length * 2;
    }
  }

  // Boost for specific content types
  if (item.sourceType === 'docs') score += 3; // Docs updates are high signal
  if (item.publishedAt) score += 2; // Items with dates are more structured

  // Penalize very short titles (likely navigation fragments)
  if ((item.title || '').length < 10) score -= 5;

  // Penalize items that are just generic AWS content with a passing Kiro mention
  const genericAwsTerms = ['aws', 'amazon web services', 'cloud', 'serverless'];
  const kiroTermCount = (text.match(/kiro/gi) || []).length;
  const genericTermCount = genericAwsTerms.reduce((acc, term) => {
    return acc + (text.match(new RegExp(term, 'gi')) || []).length;
  }, 0);

  // If generic terms heavily outweigh Kiro mentions, it's probably AWS noise
  if (genericTermCount > kiroTermCount * 3 && kiroTermCount <= 1) {
    score -= 4;
  }

  return Math.max(0, score);
};

// Categorize an item by update type for the digest
const categorizeItem = (item) => {
  const title = (item.title || '').toLowerCase();
  const desc = (item.description || '').toLowerCase();
  const text = `${title} ${desc}`;

  if (item.sourceType === 'youtube') return 'video';
  if (item.sourceType === 'docs') {
    if (text.includes('changelog') || text.includes('release')) return 'release';
    return 'docs';
  }

  if (text.includes('launch') || text.includes('announce') || text.includes('introducing') || text.includes('new feature')) {
    return 'launch';
  }
  if (text.includes('update') || text.includes('improve') || text.includes('enhance')) {
    return 'update';
  }
  if (text.includes('tutorial') || text.includes('how to') || text.includes('guide') || text.includes('getting started')) {
    return 'tutorial';
  }
  if (text.includes('changelog') || text.includes('release') || text.includes('version')) {
    return 'release';
  }

  return 'announcement';
};

// Category display metadata
const CATEGORY_META = {
  launch: { label: 'New Launches', emoji: '🚀', priority: 1 },
  release: { label: 'Release Notes', emoji: '📋', priority: 2 },
  update: { label: 'Updates & Improvements', emoji: '⚡', priority: 3 },
  announcement: { label: 'Announcements', emoji: '📢', priority: 4 },
  docs: { label: 'Documentation', emoji: '📄', priority: 5 },
  tutorial: { label: 'Tutorials & Guides', emoji: '📚', priority: 6 },
  video: { label: 'Videos', emoji: '🎬', priority: 7 },
};

// Create a bite-sized summary from an item
const createBiteSizedEntry = (item) => {
  // Truncate description to ~120 chars for scannability
  let summary = item.description || '';
  if (summary.length > 120) {
    summary = summary.substring(0, 117).replace(/\s+\S*$/, '') + '...';
  }

  return {
    title: (item.title || 'Untitled').substring(0, 100),
    summary,
    url: item.url || null,
    source: item.sourceName || 'AWS',
    sourceType: item.sourceType || 'website',
    category: categorizeItem(item),
    publishedAt: item.publishedAt || null,
    discoveredAt: item.discoveredAt || new Date().toISOString(),
    relevanceScore: scoreRelevance(item),
  };
};

// Run the full pipeline: scrape -> deduplicate -> filter -> score -> format
export const runPipeline = async (options = {}) => {
  const {
    minRelevanceScore = 3,
    maxItemsPerCategory = 10,
    includePreviouslySeen = false,
  } = options;

  const pipelineLog = {
    startedAt: new Date().toISOString(),
    stages: {},
  };

  // Stage 1: Scrape all sources
  const scrapeResults = await scrapeAllSources();

  let totalRawItems = 0;
  let successCount = 0;
  let failCount = 0;
  const allNewItems = [];

  for (const result of scrapeResults) {
    if (result.success) {
      successCount++;
      totalRawItems += result.items.length;
      allNewItems.push(...result.items);
    } else {
      failCount++;
    }
  }

  pipelineLog.stages.scrape = {
    sourcesChecked: scrapeResults.length,
    sourcesSucceeded: successCount,
    sourcesFailed: failCount,
    rawItemsFound: totalRawItems,
  };

  // Stage 2: First-party filtering
  const firstPartyItems = filterFirstPartyKiroContent(allNewItems);
  pipelineLog.stages.firstPartyFilter = {
    before: allNewItems.length,
    after: firstPartyItems.length,
    removed: allNewItems.length - firstPartyItems.length,
  };

  // Stage 3: Deduplicate against existing stored items
  const existingItems = getKiroItems();
  const { items: mergedItems, newCount } = deduplicateItems(existingItems, firstPartyItems);

  pipelineLog.stages.deduplication = {
    existingItems: existingItems.length,
    newUniqueItems: newCount,
    totalAfterMerge: mergedItems.length,
  };

  // Persist merged items
  if (newCount > 0) {
    addKiroItems(firstPartyItems);
  }

  // Stage 4: Decide which items go into the digest
  const itemsForDigest = includePreviouslySeen ? mergedItems : firstPartyItems;

  // Stage 5: Score and create bite-sized entries
  const biteSizedEntries = itemsForDigest
    .map(createBiteSizedEntry)
    .filter((entry) => entry.relevanceScore >= minRelevanceScore)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

  pipelineLog.stages.scoring = {
    totalScored: itemsForDigest.length,
    passedThreshold: biteSizedEntries.length,
    filteredOut: itemsForDigest.length - biteSizedEntries.length,
    minScoreUsed: minRelevanceScore,
  };

  // Stage 6: Group by category and cap per category
  const grouped = {};
  for (const entry of biteSizedEntries) {
    if (!grouped[entry.category]) {
      grouped[entry.category] = [];
    }
    if (grouped[entry.category].length < maxItemsPerCategory) {
      grouped[entry.category].push(entry);
    }
  }

  // Sort categories by priority
  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    return (CATEGORY_META[a]?.priority || 99) - (CATEGORY_META[b]?.priority || 99);
  });

  const digest = sortedCategories.map((cat) => ({
    category: cat,
    label: CATEGORY_META[cat]?.label || cat,
    emoji: CATEGORY_META[cat]?.emoji || '📌',
    items: grouped[cat],
  }));

  const totalDigestItems = digest.reduce((sum, section) => sum + section.items.length, 0);

  pipelineLog.stages.categorization = {
    categories: sortedCategories.length,
    totalDigestItems,
  };

  pipelineLog.completedAt = new Date().toISOString();

  // Log the scrape
  addScrapeLogEntry({
    sourcesChecked: scrapeResults.length,
    sourcesSucceeded: successCount,
    sourcesFailed: failCount,
    itemsFound: totalRawItems,
    newItems: newCount,
    digestItems: totalDigestItems,
    pipeline: true,
  });

  return {
    digest,
    stats: pipelineLog,
    totalItems: totalDigestItems,
    newItems: newCount,
  };
};

// Format digest into plain text newsletter (bite-sized format)
export const formatDigestAsText = (digest, introMessage = '') => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  let text = '';

  // Header
  text += `KIRO WEEKLY DIGEST\n`;
  text += `${dateStr}\n`;
  text += `${'━'.repeat(40)}\n\n`;

  if (introMessage) {
    text += `${introMessage}\n\n`;
  }

  if (digest.length === 0) {
    text += `No new Kiro updates this period.\n\n`;
    text += `We monitor 6 official AWS channels so you don't have to.\n`;
    text += `Check back soon!\n\n`;
  }

  for (const section of digest) {
    text += `${section.emoji} ${section.label.toUpperCase()}\n`;
    text += `${'─'.repeat(35)}\n\n`;

    for (const item of section.items) {
      // Bite-sized: title + one-line summary + link
      text += `  ${item.title}\n`;
      if (item.summary) {
        text += `  ${item.summary}\n`;
      }
      if (item.url) {
        text += `  ${item.url}\n`;
      }
      if (item.publishedAt) {
        const d = new Date(item.publishedAt);
        text += `  ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} | ${item.source}\n`;
      } else {
        text += `  ${item.source}\n`;
      }
      text += `\n`;
    }
  }

  // Footer
  text += `${'━'.repeat(40)}\n`;
  text += `Kiro Digest - Automated Newsletter\n`;
  text += `Sources: AWS Blog, Kiro Docs, Kiro Changelog,\n`;
  text += `AWS YouTube, AWS What's New (first-party only)\n`;

  return text;
};

// Format digest as HTML for email (bite-sized format)
// unsubscribeUrl is optional — when provided, an unsubscribe link is added to the footer
export const formatDigestAsHtml = (digest, introMessage = '', unsubscribeUrl = '') => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  let html = '';

  html += `<div style="max-width:600px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a2e;">`;

  // Header
  html += `<div style="background:linear-gradient(135deg,#7c3aed,#ec4899);padding:24px 20px;border-radius:16px 16px 0 0;">`;
  html += `<h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">Kiro Weekly Digest</h1>`;
  html += `<p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">${dateStr}</p>`;
  html += `</div>`;

  html += `<div style="padding:20px;background:#faf5ff;border-radius:0 0 16px 16px;">`;

  if (introMessage) {
    html += `<p style="font-size:14px;color:#4a4a6a;margin:0 0 16px;line-height:1.5;">${introMessage}</p>`;
  }

  if (digest.length === 0) {
    html += `<p style="font-size:14px;color:#6b7280;text-align:center;padding:24px 0;">No new Kiro updates this period. Check back soon!</p>`;
  }

  for (const section of digest) {
    html += `<div style="margin-bottom:20px;">`;
    html += `<h2 style="font-size:14px;text-transform:uppercase;letter-spacing:1px;color:#7c3aed;margin:0 0 10px;border-bottom:2px solid #e9d5ff;padding-bottom:6px;">${section.emoji} ${section.label}</h2>`;

    for (const item of section.items) {
      html += `<div style="background:#fff;border-radius:10px;padding:12px 14px;margin-bottom:8px;border-left:3px solid #a78bfa;">`;
      if (item.url) {
        html += `<a href="${item.url}" style="font-size:14px;font-weight:600;color:#4c1d95;text-decoration:none;" target="_blank">${item.title}</a>`;
      } else {
        html += `<span style="font-size:14px;font-weight:600;color:#4c1d95;">${item.title}</span>`;
      }
      if (item.summary) {
        html += `<p style="font-size:13px;color:#6b7280;margin:4px 0 0;line-height:1.4;">${item.summary}</p>`;
      }
      html += `<div style="margin-top:6px;font-size:11px;color:#9ca3af;">`;
      html += `${item.source}`;
      if (item.publishedAt) {
        const d = new Date(item.publishedAt);
        html += ` &middot; ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      }
      if (item.url) {
        html += ` &middot; <a href="${item.url}" style="color:#7c3aed;text-decoration:none;" target="_blank">Read more &rarr;</a>`;
      }
      html += `</div>`;
      html += `</div>`;
    }

    html += `</div>`;
  }

  // Footer
  html += `<div style="text-align:center;padding:16px 0 0;border-top:1px solid #e5e7eb;">`;
  html += `<p style="font-size:11px;color:#9ca3af;margin:0;">Kiro Digest &mdash; Automated Newsletter</p>`;
  html += `<p style="font-size:11px;color:#9ca3af;margin:2px 0 0;">Sources: AWS official channels only (first-party)</p>`;
  if (unsubscribeUrl) {
    html += `<p style="font-size:11px;margin:8px 0 0;"><a href="${unsubscribeUrl}" style="color:#7c3aed;text-decoration:underline;">Unsubscribe</a> from this newsletter</p>`;
  }
  html += `</div>`;

  html += `</div></div>`;

  return html;
};

// Build the base URL for the app (used for unsubscribe links)
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.host}`;
  }
  return '';
};

// Compile and deliver: full end-to-end cycle
// Now supports Kiro-specific subscribers with per-recipient unsubscribe links
export const compileAndDeliver = async (subscribers, options = {}) => {
  const { introMessage = '', minRelevanceScore = 3, emailSettings = null } = options;

  // Run pipeline with all stored items included for a complete digest
  const pipelineResult = await runPipeline({
    minRelevanceScore,
    includePreviouslySeen: true,
  });

  const { digest, stats, totalItems } = pipelineResult;

  // Generate newsletter content
  const textBody = formatDigestAsText(digest, introMessage);
  const subject = `Kiro Digest - ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
  const baseUrl = getBaseUrl();

  // Delivery results
  const deliveryResults = {
    email: { sent: 0, failed: 0, recipients: [], method: '' },
    sms: { sent: 0, failed: 0, recipients: [] },
  };

  // Separate Kiro subscribers (have unsubscribeToken) from legacy subscribers
  const kiroEmailSubscribers = subscribers.filter(
    (s) => s.unsubscribeToken && s.email && s.active !== false
  );
  const legacyEmailSubscribers = subscribers.filter(
    (s) => !s.unsubscribeToken && (s.type === 'email' || !s.type)
  );
  const phoneSubscribers = subscribers.filter((s) => s.type === 'phone');

  // Deliver via API to Kiro subscribers (with per-recipient unsubscribe links)
  if (kiroEmailSubscribers.length > 0 && emailSettings && emailSettings.apiKey) {
    const recipients = kiroEmailSubscribers.map((sub) => {
      const unsubscribeUrl = `${baseUrl}/api/unsubscribe?token=${sub.unsubscribeToken}`;
      const personalizedHtml = formatDigestAsHtml(digest, introMessage, unsubscribeUrl);
      return {
        email: sub.email,
        html: personalizedHtml,
      };
    });

    try {
      const response = await fetch('/api/send-kiro-newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients,
          subject,
          html: formatDigestAsHtml(digest, introMessage), // fallback html without unsub link
          settings: emailSettings,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        deliveryResults.email.sent += result.sent || 0;
        deliveryResults.email.failed += result.failed || 0;
        deliveryResults.email.method = 'api';
      } else {
        deliveryResults.email.failed += kiroEmailSubscribers.length;
        deliveryResults.email.method = 'api-failed';
      }
    } catch {
      deliveryResults.email.failed += kiroEmailSubscribers.length;
      deliveryResults.email.method = 'api-failed';
    }
    deliveryResults.email.recipients.push(
      ...kiroEmailSubscribers.map((s) => s.email)
    );
  }

  // Deliver via mailto to legacy subscribers (fallback for subscribers without tokens)
  if (legacyEmailSubscribers.length > 0) {
    const bcc = legacyEmailSubscribers.map((s) => s.contact || s.email).join(',');
    const mailtoLink = `mailto:?bcc=${encodeURIComponent(bcc)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(textBody)}`;

    if (mailtoLink.length > 2000) {
      try {
        await navigator.clipboard.writeText(`To: (BCC your subscribers)\nSubject: ${subject}\n\n${textBody}`);
        deliveryResults.email.sent += legacyEmailSubscribers.length;
        if (!deliveryResults.email.method) deliveryResults.email.method = 'clipboard';
      } catch {
        deliveryResults.email.failed += legacyEmailSubscribers.length;
        if (!deliveryResults.email.method) deliveryResults.email.method = 'clipboard-failed';
      }
    } else {
      window.location.href = mailtoLink;
      deliveryResults.email.sent += legacyEmailSubscribers.length;
      if (!deliveryResults.email.method) deliveryResults.email.method = 'mailto';
    }
    deliveryResults.email.recipients.push(
      ...legacyEmailSubscribers.map((s) => s.contact || s.email)
    );
  }

  // Deliver via SMS
  if (phoneSubscribers.length > 0) {
    const smsBody = textBody.substring(0, 1600);

    for (const subscriber of phoneSubscribers) {
      try {
        const response = await fetch('/api/send-sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: subscriber.contact,
            message: smsBody,
          }),
        });

        if (response.ok) {
          deliveryResults.sms.sent++;
        } else {
          deliveryResults.sms.failed++;
        }
      } catch {
        deliveryResults.sms.failed++;
      }
    }
    deliveryResults.sms.recipients = phoneSubscribers.map((s) => s.contact);
  }

  // Record newsletter in history
  const historyEntry = {
    subject,
    digestItemCount: totalItems,
    categories: digest.map((d) => d.category),
    delivery: deliveryResults,
    pipelineStats: stats,
  };
  addNewsletterHistoryEntry(historyEntry);

  return {
    subject,
    textBody,
    digest,
    stats,
    delivery: deliveryResults,
    totalItems,
  };
};

// Export for testing/direct use
export { scoreRelevance, categorizeItem, createBiteSizedEntry, CATEGORY_META };
