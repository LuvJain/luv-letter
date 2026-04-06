// Compile scraped Kiro content into newsletter format

// Generate a plain text newsletter from scraped items
export const generateKiroNewsletter = (items, introMessage = '') => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  let newsletter = '';

  if (introMessage) {
    newsletter += `${introMessage}\n\n`;
  } else {
    newsletter += `Kiro Updates - ${dateStr}\n\n`;
    newsletter += `Here's the latest from AWS Kiro:\n\n`;
  }

  // Group items by source type
  const grouped = groupByType(items);

  if (grouped.announcements.length > 0) {
    newsletter += `ANNOUNCEMENTS & BLOG POSTS\n`;
    newsletter += `${'─'.repeat(30)}\n\n`;
    for (const item of grouped.announcements) {
      newsletter += formatItem(item);
    }
  }

  if (grouped.docs.length > 0) {
    newsletter += `DOCUMENTATION UPDATES\n`;
    newsletter += `${'─'.repeat(30)}\n\n`;
    for (const item of grouped.docs) {
      newsletter += formatItem(item);
    }
  }

  if (grouped.videos.length > 0) {
    newsletter += `VIDEOS\n`;
    newsletter += `${'─'.repeat(30)}\n\n`;
    for (const item of grouped.videos) {
      newsletter += formatItem(item);
    }
  }

  if (items.length === 0) {
    newsletter += `No new Kiro updates found since last check.\n\n`;
  }

  newsletter += `\n---\nAutomated Kiro Update Newsletter\n`;
  newsletter += `Sources: AWS official channels only\n`;

  return newsletter;
};

// Group items by their source type
const groupByType = (items) => {
  const grouped = {
    announcements: [],
    docs: [],
    videos: [],
  };

  for (const item of items) {
    if (item.sourceType === 'youtube') {
      grouped.videos.push(item);
    } else if (item.sourceType === 'docs') {
      grouped.docs.push(item);
    } else {
      grouped.announcements.push(item);
    }
  }

  return grouped;
};

// Format a single item for the newsletter
const formatItem = (item) => {
  let text = '';
  text += `${item.title}\n`;
  if (item.publishedAt) {
    const date = new Date(item.publishedAt);
    text += `  ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}\n`;
  }
  if (item.description) {
    // Truncate long descriptions
    const desc =
      item.description.length > 200
        ? item.description.substring(0, 200) + '...'
        : item.description;
    text += `  ${desc}\n`;
  }
  if (item.url) {
    text += `  ${item.url}\n`;
  }
  text += `  Source: ${item.sourceName || 'AWS'}\n\n`;
  return text;
};

// Generate subject line for the newsletter email
export const generateKiroNewsletterSubject = () => {
  const now = new Date();
  const monthYear = now.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  return `Kiro Updates - ${monthYear}`;
};
