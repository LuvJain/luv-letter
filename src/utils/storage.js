// LocalStorage utility for managing app data

const STORAGE_KEYS = {
  EVENTS: 'luvletter_events',
  SUBSCRIBERS: 'luvletter_subscribers',
  SETTINGS: 'luvletter_settings',
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

// Export/Import
export const exportData = () => {
  return {
    events: getEvents(),
    subscribers: getSubscribers(),
    settings: getSettings(),
    exportedAt: new Date().toISOString(),
  };
};

export const importData = (data) => {
  if (data.events) saveEvents(data.events);
  if (data.subscribers) saveSubscribers(data.subscribers);
  if (data.settings) saveSettings(data.settings);
};
