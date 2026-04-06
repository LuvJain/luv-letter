// Official AWS/Kiro first-party source definitions and URL patterns
// Only these domains are considered first-party sources for Kiro content

export const FIRST_PARTY_DOMAINS = [
  'aws.amazon.com',
  'kiro.dev',
  'docs.aws.amazon.com',
  'youtube.com',
  'www.youtube.com',
  'aboutamazon.com',
  'amazon.com',
];

// Specific URL patterns for Kiro-related content on AWS channels
export const KIRO_SOURCE_CONFIGS = [
  {
    id: 'aws-blog',
    name: 'AWS Blog',
    type: 'website',
    url: 'https://aws.amazon.com/blogs/devops/',
    searchTerms: ['kiro'],
    description: 'AWS DevOps Blog - Kiro announcements and feature posts',
  },
  {
    id: 'aws-product-page',
    name: 'Kiro Product Page',
    type: 'website',
    url: 'https://aws.amazon.com/kiro/',
    searchTerms: ['kiro'],
    description: 'Official AWS Kiro product page',
  },
  {
    id: 'kiro-docs',
    name: 'Kiro Documentation',
    type: 'docs',
    url: 'https://kiro.dev/docs/',
    searchTerms: ['kiro'],
    description: 'Official Kiro documentation site',
  },
  {
    id: 'kiro-changelog',
    name: 'Kiro Changelog',
    type: 'docs',
    url: 'https://kiro.dev/changelog/',
    searchTerms: ['kiro'],
    description: 'Kiro changelog and release notes',
  },
  {
    id: 'aws-youtube',
    name: 'AWS YouTube Channel',
    type: 'youtube',
    url: 'https://www.youtube.com/@amazonwebservices',
    searchTerms: ['kiro'],
    description: 'AWS official YouTube channel - Kiro videos',
  },
  {
    id: 'aws-whats-new',
    name: 'AWS What\'s New',
    type: 'website',
    url: 'https://aws.amazon.com/about-aws/whats-new/',
    searchTerms: ['kiro'],
    description: 'AWS What\'s New feed for Kiro announcements',
  },
];

// Validate that a URL is from a first-party source
export const isFirstPartySource = (url) => {
  try {
    const parsedUrl = new URL(url);
    return FIRST_PARTY_DOMAINS.some(
      (domain) =>
        parsedUrl.hostname === domain ||
        parsedUrl.hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
};

// Keywords used to identify Kiro-related content
export const KIRO_KEYWORDS = [
  'kiro',
  'kiro ide',
  'kiro developer',
  'aws kiro',
  'amazon kiro',
];

// Check if text content is Kiro-related
export const isKiroRelated = (text) => {
  const lowerText = text.toLowerCase();
  return KIRO_KEYWORDS.some((keyword) => lowerText.includes(keyword));
};
