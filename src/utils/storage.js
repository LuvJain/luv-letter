// LocalStorage utility for managing app data

const STORAGE_KEYS = {
  EVENTS: 'luvletter_events',
  SUBSCRIBERS: 'luvletter_subscribers',
  SETTINGS: 'luvletter_settings',
  KIRO_ITEMS: 'luvletter_kiro_items',
  KIRO_SCRAPE_LOG: 'luvletter_kiro_scrape_log',
  KIRO_NEWSLETTER_HISTORY: 'luvletter_kiro_newsletter_history',
  KIRO_SUBSCRIBERS: 'luvletter_kiro_subscribers',
};

// Events
export const getEvents = () => {
  const events = localStorage.getItem(STORAGE_KEYS.EVENTS);
  return events ? JSON.parse(events) : [];
};

export const saveEvents = (events) => {
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
};

export const addEvent = (event) => {
  const events = getEvents();
  const newEvent = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    ...event,
  };
  events.push(newEvent);
  saveEvents(events);
  return newEvent;
};

export const updateEvent = (id, updatedEvent) => {
  const events = getEvents();
  const index = events.findIndex(e => e.id === id);
  if (index !== -1) {
    events[index] = { ...events[index], ...updatedEvent };
    saveEvents(events);
    return events[index];
  }
  return null;
};

export const deleteEvent = (id) => {
  const events = getEvents();
  const filtered = events.filter(e => e.id !== id);
  saveEvents(filtered);
};

// Subscribers
export const getSubscribers = () => {
  const subscribers = localStorage.getItem(STORAGE_KEYS.SUBSCRIBERS);
  return subscribers ? JSON.parse(subscribers) : [];
};

export const saveSubscribers = (subscribers) => {
  localStorage.setItem(STORAGE_KEYS.SUBSCRIBERS, JSON.stringify(subscribers));
};

export const addSubscriber = (contact, name = '', type = 'email') => {
  const subscribers = getSubscribers();
  const newSubscriber = {
    id: Date.now().toString(),
    contact, // email or phone number
    name,
    type, // 'email' or 'phone'
    addedAt: new Date().toISOString(),
  };
  subscribers.push(newSubscriber);
  saveSubscribers(subscribers);
  return newSubscriber;
};

export const deleteSubscriber = (id) => {
  const subscribers = getSubscribers();
  const filtered = subscribers.filter(s => s.id !== id);
  saveSubscribers(filtered);
};

// Settings
export const getSettings = () => {
  const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return settings ? JSON.parse(settings) : {
    userEmail: '',
  };
};

export const saveSettings = (settings) => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

export const getUserEmail = () => {
  const settings = getSettings();
  return settings.userEmail || '';
};

export const setUserEmail = (email) => {
  const settings = getSettings();
  settings.userEmail = email;
  saveSettings(settings);
};

// Kiro Scraper Items
export const getKiroItems = () => {
  const items = localStorage.getItem(STORAGE_KEYS.KIRO_ITEMS);
  return items ? JSON.parse(items) : [];
};

export const saveKiroItems = (items) => {
  localStorage.setItem(STORAGE_KEYS.KIRO_ITEMS, JSON.stringify(items));
};

export const addKiroItems = (newItems) => {
  const existing = getKiroItems();
  const existingUrls = new Set(existing.map((item) => item.url));
  const uniqueNew = newItems.filter((item) => item.url && !existingUrls.has(item.url));
  const merged = [...existing, ...uniqueNew];
  saveKiroItems(merged);
  return { total: merged.length, added: uniqueNew.length };
};

export const clearKiroItems = () => {
  saveKiroItems([]);
};

// Kiro Scrape Log
export const getScrapeLog = () => {
  const log = localStorage.getItem(STORAGE_KEYS.KIRO_SCRAPE_LOG);
  return log ? JSON.parse(log) : [];
};

export const addScrapeLogEntry = (entry) => {
  const log = getScrapeLog();
  log.unshift({
    ...entry,
    timestamp: new Date().toISOString(),
  });
  // Keep last 50 entries
  if (log.length > 50) {
    log.length = 50;
  }
  localStorage.setItem(STORAGE_KEYS.KIRO_SCRAPE_LOG, JSON.stringify(log));
};

export const getLastScrapeTime = () => {
  const log = getScrapeLog();
  return log.length > 0 ? log[0].timestamp : null;
};

// Kiro Newsletter History
export const getNewsletterHistory = () => {
  const history = localStorage.getItem(STORAGE_KEYS.KIRO_NEWSLETTER_HISTORY);
  return history ? JSON.parse(history) : [];
};

export const addNewsletterHistoryEntry = (entry) => {
  const history = getNewsletterHistory();
  history.unshift({
    ...entry,
    sentAt: new Date().toISOString(),
  });
  // Keep last 20 newsletters
  if (history.length > 20) {
    history.length = 20;
  }
  localStorage.setItem(STORAGE_KEYS.KIRO_NEWSLETTER_HISTORY, JSON.stringify(history));
};

// Kiro Newsletter Subscribers
export const getKiroSubscribers = () => {
  const subscribers = localStorage.getItem(STORAGE_KEYS.KIRO_SUBSCRIBERS);
  return subscribers ? JSON.parse(subscribers) : [];
};

export const saveKiroSubscribers = (subscribers) => {
  localStorage.setItem(STORAGE_KEYS.KIRO_SUBSCRIBERS, JSON.stringify(subscribers));
};

// Generate a simple random token for unsubscribe links
const generateToken = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
};

export const addKiroSubscriber = (email, name = '') => {
  const subscribers = getKiroSubscribers();
  // Check for duplicate email
  const existing = subscribers.find(
    (s) => s.email.toLowerCase() === email.toLowerCase()
  );
  if (existing) {
    // Reactivate if previously unsubscribed
    if (!existing.active) {
      existing.active = true;
      existing.resubscribedAt = new Date().toISOString();
      saveKiroSubscribers(subscribers);
    }
    return existing;
  }

  const newSubscriber = {
    id: Date.now().toString(),
    email,
    name,
    active: true,
    unsubscribeToken: generateToken(),
    addedAt: new Date().toISOString(),
  };
  subscribers.push(newSubscriber);
  saveKiroSubscribers(subscribers);
  return newSubscriber;
};

export const removeKiroSubscriber = (id) => {
  const subscribers = getKiroSubscribers();
  const filtered = subscribers.filter((s) => s.id !== id);
  saveKiroSubscribers(filtered);
};

export const unsubscribeByToken = (token) => {
  const subscribers = getKiroSubscribers();
  const subscriber = subscribers.find((s) => s.unsubscribeToken === token);
  if (subscriber) {
    subscriber.active = false;
    subscriber.unsubscribedAt = new Date().toISOString();
    saveKiroSubscribers(subscribers);
    return { success: true, email: subscriber.email };
  }
  return { success: false };
};

export const getActiveKiroSubscribers = () => {
  return getKiroSubscribers().filter((s) => s.active);
};

// Export/Import
export const exportData = () => {
  return {
    events: getEvents(),
    subscribers: getSubscribers(),
    settings: getSettings(),
    kiroItems: getKiroItems(),
    kiroSubscribers: getKiroSubscribers(),
    newsletterHistory: getNewsletterHistory(),
    exportedAt: new Date().toISOString(),
  };
};

export const importData = (data) => {
  if (data.events) saveEvents(data.events);
  if (data.subscribers) saveSubscribers(data.subscribers);
  if (data.settings) saveSettings(data.settings);
  if (data.kiroItems) saveKiroItems(data.kiroItems);
  if (data.kiroSubscribers) saveKiroSubscribers(data.kiroSubscribers);
};
