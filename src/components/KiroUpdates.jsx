import { useState, useEffect } from 'react';
import { scrapeAllSources, getSourceConfigs, filterFirstPartyKiroContent } from '../utils/kiro-scraper';
import { generateKiroNewsletter, generateKiroNewsletterSubject } from '../utils/kiro-newsletter';
import {
  getKiroItems,
  addKiroItems,
  clearKiroItems,
  addScrapeLogEntry,
  getScrapeLog,
  getLastScrapeTime,
  getSubscribers,
} from '../utils/storage';

export default function KiroUpdates() {
  const [items, setItems] = useState([]);
  const [scrapeLog, setScrapeLog] = useState([]);
  const [lastScrape, setLastScrape] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [introMessage, setIntroMessage] = useState('');
  const [subscribers, setSubscribers] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setItems(getKiroItems());
    setScrapeLog(getScrapeLog());
    setLastScrape(getLastScrapeTime());
    setSubscribers(getSubscribers());
  };

  const handleScanAll = async () => {
    setIsScanning(true);
    setScanResults(null);

    try {
      const results = await scrapeAllSources();

      let totalNew = 0;
      let totalFound = 0;
      let successCount = 0;
      let failCount = 0;

      for (const result of results) {
        if (result.success) {
          successCount++;
          // Filter to only first-party Kiro content
          const filtered = filterFirstPartyKiroContent(result.items);
          totalFound += filtered.length;
          if (filtered.length > 0) {
            const { added } = addKiroItems(filtered);
            totalNew += added;
          }
        } else {
          failCount++;
        }
      }

      const logEntry = {
        sourcesChecked: results.length,
        sourcesSucceeded: successCount,
        sourcesFailed: failCount,
        itemsFound: totalFound,
        newItems: totalNew,
      };
      addScrapeLogEntry(logEntry);

      setScanResults(logEntry);
      loadData();
    } catch (error) {
      console.error('Scan error:', error);
      setScanResults({
        sourcesChecked: 0,
        sourcesSucceeded: 0,
        sourcesFailed: 1,
        itemsFound: 0,
        newItems: 0,
        error: error.message,
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleClearItems = () => {
    if (confirm('Clear all scraped Kiro items? This cannot be undone.')) {
      clearKiroItems();
      loadData();
    }
  };

  const handleSendNewsletter = () => {
    if (subscribers.length === 0) {
      alert('Add some friends first from the friends tab!');
      return;
    }

    if (items.length === 0) {
      alert('No Kiro updates to send. Run a scan first!');
      return;
    }

    const subject = generateKiroNewsletterSubject();
    const body = generateKiroNewsletter(items, introMessage);

    const emailSubscribers = subscribers.filter(
      (s) => s.type === 'email' || !s.type
    );
    const phoneSubscribers = subscribers.filter((s) => s.type === 'phone');

    // Handle email subscribers via mailto
    if (emailSubscribers.length > 0) {
      const bcc = emailSubscribers
        .map((s) => s.contact || s.email)
        .join(',');
      const mailtoLink = `mailto:?bcc=${encodeURIComponent(bcc)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      if (mailtoLink.length > 2000) {
        const clipboardText = `To: (BCC your subscribers)\nSubject: ${subject}\n\n${body}`;
        navigator.clipboard.writeText(clipboardText);
        alert(
          'Newsletter is too long for auto-open! Content copied to clipboard. Paste into your email app.'
        );
      } else {
        window.location.href = mailtoLink;
      }
    }

    // Handle SMS subscribers
    if (phoneSubscribers.length > 0) {
      sendSmsNewsletter(phoneSubscribers, body);
    }
  };

  const sendSmsNewsletter = async (phoneSubscribers, body) => {
    const confirmSMS = confirm(
      `Send Kiro update SMS to ${phoneSubscribers.length} contact${phoneSubscribers.length !== 1 ? 's' : ''}?`
    );

    if (!confirmSMS) return;

    let success = 0;
    let failed = 0;

    for (const subscriber of phoneSubscribers) {
      try {
        const response = await fetch('/api/send-sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: subscriber.contact,
            message: body.substring(0, 1600), // SMS length limit
          }),
        });

        if (response.ok) {
          success++;
        } else {
          failed++;
          console.error(`Failed to send to ${subscriber.contact}`);
        }
      } catch (error) {
        failed++;
        console.error(`Error sending to ${subscriber.contact}:`, error);
      }
    }

    let msg = `Kiro update sent to ${success}/${phoneSubscribers.length} SMS contacts`;
    if (failed > 0) msg += ` (${failed} failed)`;
    alert(msg);
  };

  const formatTimeAgo = (isoString) => {
    if (!isoString) return 'never';
    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const sourceConfigs = getSourceConfigs();
  const previewBody = generateKiroNewsletter(items, introMessage);

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent mb-6 animate-slide-up">
        kiro updates
      </h1>

      {/* Scan Controls */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-gray-500">
            aws channel watcher
          </h2>
          <span className="text-xs text-gray-400">
            last scan: {formatTimeAgo(lastScrape)}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          monitors {sourceConfigs.length} official AWS channels for Kiro
          announcements, blog posts, and videos.
        </p>

        <button
          onClick={handleScanAll}
          disabled={isScanning}
          className="btn-primary w-full"
        >
          {isScanning ? 'scanning channels...' : 'scan for kiro updates'}
        </button>

        {scanResults && (
          <div className="mt-3 p-3 bg-purple-50 rounded-xl text-sm animate-slide-up">
            <p className="font-medium text-purple-800">
              scan complete
            </p>
            <p className="text-purple-600">
              {scanResults.sourcesSucceeded}/{scanResults.sourcesChecked}{' '}
              sources checked &middot; {scanResults.itemsFound} items found
              &middot; {scanResults.newItems} new
            </p>
            {scanResults.sourcesFailed > 0 && (
              <p className="text-orange-600 text-xs mt-1">
                {scanResults.sourcesFailed} source
                {scanResults.sourcesFailed !== 1 ? 's' : ''} failed
              </p>
            )}
            {scanResults.error && (
              <p className="text-red-600 text-xs mt-1">{scanResults.error}</p>
            )}
          </div>
        )}
      </div>

      {/* Sources List */}
      <div className="card mb-4">
        <h2 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">
          monitored sources ({sourceConfigs.length})
        </h2>
        <div className="space-y-2">
          {sourceConfigs.map((source) => (
            <div
              key={source.id}
              className="flex items-center gap-2 text-sm p-2 rounded-lg bg-gray-50"
            >
              <span className="text-lg">
                {source.type === 'youtube'
                  ? '🎬'
                  : source.type === 'docs'
                    ? '📄'
                    : '🌐'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">
                  {source.name}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {source.description}
                </p>
              </div>
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs whitespace-nowrap">
                {source.type}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Scraped Items */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-gray-500">
            kiro updates found ({items.length})
          </h2>
          {items.length > 0 && (
            <button
              onClick={handleClearItems}
              className="text-xs text-red-400 hover:text-red-600"
            >
              clear all
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-gray-500">
            no updates found yet. run a scan to check AWS channels.
          </p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {items.map((item, index) => (
              <div
                key={item.url || index}
                className="border-l-4 border-purple-400 pl-3 py-1"
              >
                <p className="font-medium text-sm">
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-700 hover:text-purple-900 underline"
                    >
                      {item.title}
                    </a>
                  ) : (
                    item.title
                  )}
                </p>
                {item.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                )}
                <div className="flex gap-2 mt-1">
                  <span className="text-xs text-gray-400">
                    {item.sourceName || 'AWS'}
                  </span>
                  {item.publishedAt && (
                    <span className="text-xs text-gray-400">
                      &middot;{' '}
                      {new Date(item.publishedAt).toLocaleDateString()}
                    </span>
                  )}
                  {item.discoveredAt && (
                    <span className="text-xs text-gray-400">
                      &middot; found {formatTimeAgo(item.discoveredAt)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Newsletter Compose & Send */}
      <div className="card mb-4">
        <h2 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">
          send kiro newsletter
        </h2>

        <p className="text-sm text-gray-600 mb-2">
          sending to {subscribers.length} friend
          {subscribers.length !== 1 ? 's' : ''}
        </p>

        <div className="mb-3">
          <label className="block text-xs font-semibold mb-1 uppercase tracking-wide text-gray-400">
            custom intro (optional)
          </label>
          <textarea
            className="input-field"
            rows="2"
            value={introMessage}
            onChange={(e) => setIntroMessage(e.target.value)}
            placeholder="hey! here are the latest kiro updates..."
          />
        </div>

        <div className="space-y-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="btn-secondary w-full"
          >
            {showPreview ? 'hide preview' : 'preview newsletter'}
          </button>
          <button
            onClick={handleSendNewsletter}
            className="btn-primary w-full"
            disabled={items.length === 0}
          >
            send kiro newsletter
          </button>
        </div>
      </div>

      {/* Newsletter Preview */}
      {showPreview && (
        <div className="card bg-gradient-to-br from-purple-50 to-rose-50 animate-slide-up mb-4">
          <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">
            preview
          </h3>
          <div className="bg-white rounded-xl p-6 shadow-inner">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
              {previewBody}
            </pre>
          </div>
        </div>
      )}

      {/* Scrape History */}
      {scrapeLog.length > 0 && (
        <div className="card">
          <h2 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">
            scan history
          </h2>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {scrapeLog.slice(0, 10).map((entry, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-xs text-gray-500 py-1 border-b border-gray-100 last:border-0"
              >
                <span>{formatTimeAgo(entry.timestamp)}</span>
                <span>
                  {entry.sourcesSucceeded}/{entry.sourcesChecked} sources
                  &middot; {entry.newItems} new
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
