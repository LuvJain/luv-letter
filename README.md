# Luv-Letter 💌

A decentralized monthly newsletter app for sharing where you'll be with friends. No backend, no APIs, no social media - just email and your phone.

## Live App

**Production URL:** https://luv-letter-five.vercel.app

Add to your phone's home screen for app-like experience.

## What It Does

Send monthly "luv-letters" to friends about where you'll be:
- Add events you're attending throughout the month
- Add friends to your subscriber list
- At month-end, tap "send" - opens email app with everything pre-filled
- Friends get a simple email with your plans
- No RSVP pressure, just "I'll be here if you want to join"

## How It's Different

**vs Group Chats:**
- No 200-message chaos
- No planning burden
- Monthly digest instead of constant notifications

**vs Partiful/Luma:**
- Not event planning - just sharing availability
- No formal RSVPs
- More casual "open invite" style

**vs Social Media:**
- Private - only goes to friends you choose
- Email-based - no new app required
- Monthly rhythm - intentionally slower

**Fully Decentralized:**
- No backend server
- Data stored in your browser (localStorage)
- Emails sent from YOUR email app
- No third-party services

## Tech Stack

- **React 18** + **Vite**
- **Tailwind CSS v3** - Custom color scheme (orange/rose/purple)
- **PWA** - Installable on mobile
- **LocalStorage** - All data client-side
- **Deployed on Vercel**

## Development

```bash
# Install dependencies
npm install

# Run locally
npm run dev
# Opens on http://localhost:5173

# Build for production
npm run build

# Deploy to Vercel
npx vercel --prod --yes
```

## Project Structure

```
src/
├── components/
│   ├── Events.jsx        # Add/manage where you'll be
│   ├── Subscribers.jsx   # Manage friends list
│   └── Newsletter.jsx    # Compose and send luv-letter
├── utils/
│   └── storage.js        # localStorage utilities
└── App.jsx              # Main app with navigation
```

## Features

### Events
- Add upcoming events (what, when, where, description)
- Events sorted by date
- Delete events
- Stored locally in your browser

### Friends
- Add friends (name + email)
- Import/export friend lists (share with others)
- View subscriber count

### Send Luv-Letter
- Preview your message
- Opens your email app with everything pre-filled
- All friends in BCC (private)
- Fallback if email too long: copies to clipboard

### Share Subscribe Link
- Generate shareable link
- Friends click → fill form → sends you their info
- Fully decentralized (no backend)

## Color Scheme (60/30/10 Rule)

- **60% Background:** Lavender/purple gradients
- **30% Secondary:** Rose/coral cards and borders
- **10% Primary:** Orange gradient buttons

## How Sending Works

When you tap "Send Luv-Letter":
1. Generates plain text email body
2. Creates mailto: link with BCC recipients
3. Opens your default email app
4. You hit send from YOUR email
5. If URL too long, copies to clipboard instead

## Data Storage

Everything stored in browser's localStorage:
- luvletter_events - Your events
- luvletter_subscribers - Your friends list

**Important:** Data is per-browser. Use import/export to move between devices.

## Deployment

```bash
# Deploy to production
npm run build && npx vercel --prod --yes
```

**Production URL:** https://luv-letter-five.vercel.app

This URL auto-updates with each deployment.

## Mobile Installation

**iPhone:**
1. Open URL in Safari
2. Tap Share → "Add to Home Screen"
3. Opens like a native app

**Android:**
1. Open URL in Chrome
2. Tap menu → "Install App"
3. Opens like a native app

## Philosophy

**Keep it simple, stupid.**
- No backend complexity
- No API keys
- No notifications
- No tracking
- No ads

Just a lightweight tool to share your social calendar without group chat hell.
