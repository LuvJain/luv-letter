import { useState, useEffect } from 'react';
import { getSourceConfigs } from '../utils/kiro-scraper';
import { runPipeline, formatDigestAsText, compileAndDeliver, CATEGORY_META } from '../utils/kiro-pipeline';
import {
  getKiroItems,
  clearKiroItems,
  getScrapeLog,
  getLastScrapeTime,
  getSubscribers,
  getNewsletterHistory,
  getKiroSubscribers,
  addKiroSubscriber,
  removeKiroSubscriber,
  getActiveKiroSubscribers,
  unsubscribeByToken,
  getSettings,
} from '../utils/storage';

export default function KiroUpdates() {
  const [items, setItems] = useState([]);
  const [scrapeLog, setScrapeLog] = useState([]);
  const [lastScrape, setLastScrape] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [digest, setDigest] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [introMessage, setIntroMessage] = useState('');
  const [subscribers, setSubscribers] = useState([]);
  const [kiroSubscribers, setKiroSubscribers] = useState([]);
  const [newsletterHistory, setNewsletterHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('pipeline');
  const [newSubEmail, setNewSubEmail] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [emailApiKey, setEmailApiKey] = useState('');
  const [emailProvider, setEmailProvider] = useState('resend');
  const [fromEmail, setFromEmail] = useState('');
  const [fromName, setFromName] = useState('');

  useEffect(() => {
    loadData();
    // Process any pending unsubscribes from the unsubscribe endpoint
    processPendingUnsubscribes();
  }, []);

  const loadData = () => {
    setItems(getKiroItems());
    setScrapeLog(getScrapeLog());
    setLastScrape(getLastScrapeTime());
    setSubscribers(getSubscribers());
    setKiroSubscribers(getKiroSubscribers());
    setNewsletterHistory(getNewsletterHistory());
    // Load saved email settings
    const settings = getSettings();
    if (settings.kiroEmailApiKey) setEmailApiKey(settings.kiroEmailApiKey);
    if (settings.kiroEmailProvider) setEmailProvider(settings.kiroEmailProvider);
    if (settings.kiroFromEmail) setFromEmail(settings.kiroFromEmail);
    if (settings.kiroFromName) setFromName(settings.kiroFromName);
  };

  const processPendingUnsubscribes = () => {
    try {
      const pending = JSON.parse(localStorage.getItem('luvletter_kiro_unsubscribes') || '[]');
      if (pending.length > 0) {
        for (const token of pending) {
          unsubscribeByToken(token);
        }
        localStorage.removeItem('luvletter_kiro_unsubscribes');
        setKiroSubscribers(getKiroSubscribers());
      }
    } catch {
      // Ignore errors processing pending unsubscribes
    }
  };

  // Run the full pipeline: scrape -> deduplicate -> filter -> score -> format
  const handleRunPipeline = async () => {
    setIsScanning(true);
    setScanResults(null);
    setDigest(null);

    try {
      const result = await runPipeline({
        minRelevanceScore: 3,
        includePreviouslySeen: false,
      });

      setDigest(result.digest);
      setScanResults({
        ...result.stats.stages.scrape,
        newItems: result.newItems,
        digestItems: result.totalItems,
        categories: result.digest.length,
      });
      loadData();
    } catch (error) {
      console.error('Pipeline error:', error);
      setScanResults({
        sourcesChecked: 0,
        sourcesSucceeded: 0,
        sourcesFailed: 1,
        rawItemsFound: 0,
        newItems: 0,
        digestItems: 0,
        error: error.message,
      });
    } finally {
      setIsScanning(false);
    }
  };

  // Full end-to-end: detect -> compile -> deliver
  const handleCompileAndDeliver = async () => {
    const activeKiroSubs = getActiveKiroSubscribers();
    const legacySubs = subscribers;
    const allRecipients = [...activeKiroSubs, ...legacySubs];

    if (allRecipients.length === 0) {
      alert('Add some subscribers first from the subscribers tab!');
      return;
    }

    const allItems = getKiroItems();
    if (allItems.length === 0) {
      alert('No Kiro updates to send. Run the pipeline first!');
      return;
    }

    // Check if API settings are configured for Kiro subscribers
    if (activeKiroSubs.length > 0 && (!emailApiKey || !fromEmail)) {
      alert('Configure email API settings in the subscribers tab to send to Kiro subscribers.');
      return;
    }

    setIsSending(true);

    try {
      const emailSettings = emailApiKey && fromEmail ? {
        apiKey: emailApiKey,
        apiProvider: emailProvider,
        fromEmail,
        fromName,
      } : null;

      const result = await compileAndDeliver(allRecipients, {
        introMessage,
        minRelevanceScore: 3,
        emailSettings,
      });

      const emailCount = result.delivery.email.sent;
      const smsCount = result.delivery.sms.sent;
      const failCount = result.delivery.email.failed + result.delivery.sms.failed;

      let msg = `Newsletter delivered! ${result.totalItems} updates sent.`;
      if (emailCount > 0) msg += `\n${emailCount} email${emailCount !== 1 ? 's' : ''}`;
      if (smsCount > 0) msg += `\n${smsCount} SMS`;
      if (failCount > 0) msg += `\n${failCount} failed`;
      if (result.delivery.email.method === 'clipboard') {
        msg += '\n\nContent copied to clipboard (too long for mailto).';
      }

      alert(msg);
      loadData();
    } catch (error) {
      console.error('Delivery error:', error);
      alert(`Failed to deliver newsletter: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  // Subscriber management handlers
  const handleAddKiroSubscriber = (e) => {
    e.preventDefault();
    if (!newSubEmail.trim()) return;
    addKiroSubscriber(newSubEmail.trim(), newSubName.trim());
    setNewSubEmail('');
    setNewSubName('');
    setKiroSubscribers(getKiroSubscribers());
  };

  const handleRemoveKiroSubscriber = (id) => {
    removeKiroSubscriber(id);
    setKiroSubscribers(getKiroSubscribers());
  };

  const handleSaveEmailSettings = () => {
    const settings = getSettings();
    settings.kiroEmailApiKey = emailApiKey;
    settings.kiroEmailProvider = emailProvider;
    settings.kiroFromEmail = fromEmail;
    settings.kiroFromName = fromName;
    localStorage.setItem('luvletter_settings', JSON.stringify(settings));
    alert('Email settings saved.');
  };

  const handleClearItems = () => {
    if (confirm('Clear all scraped Kiro items? This cannot be undone.')) {
      clearKiroItems();
      setDigest(null);
      loadData();
    }
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

  // Generate preview text from current items using the pipeline format
  const getPreviewText = () => {
    if (digest && digest.length > 0) {
      return formatDigestAsText(digest, introMessage);
    }
    // Fallback: build a quick preview from stored items
    const allItems = getKiroItems();
    if (allItems.length === 0) return 'No updates to preview. Run the pipeline first.';

    // Build a simple preview from raw items
    let text = `KIRO WEEKLY DIGEST\n`;
    text += `${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}\n`;
    text += `${'━'.repeat(40)}\n\n`;
    if (introMessage) text += `${introMessage}\n\n`;
    for (const item of allItems.slice(0, 15)) {
      text += `  ${item.title}\n`;
      if (item.description) {
        const desc = item.description.length > 120 ? item.description.substring(0, 117) + '...' : item.description;
        text += `  ${desc}\n`;
      }
      if (item.url) text += `  ${item.url}\n`;
      text += `  ${item.sourceName || 'AWS'}\n\n`;
    }
    text += `${'━'.repeat(40)}\nKiro Digest - Automated Newsletter\n`;
    return text;
  };

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent mb-2 animate-slide-up">
        kiro updates
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        automated digest pipeline: detect &rarr; compile &rarr; deliver
      </p>

      {/* Sub-navigation */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1">
        {[
          { id: 'pipeline', label: 'pipeline' },
          { id: 'digest', label: 'digest' },
          { id: 'subscribers', label: 'subscribers' },
          { id: 'history', label: 'history' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 text-sm font-semibold py-2 px-3 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Pipeline Tab */}
      {activeTab === 'pipeline' && (
        <>
          {/* Pipeline Controls */}
          <div className="card mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sm uppercase tracking-wide text-gray-500">
                aggregation pipeline
              </h2>
              <span className="text-xs text-gray-400">
                last scan: {formatTimeAgo(lastScrape)}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              scans {sourceConfigs.length} official AWS channels, deduplicates,
              filters for Kiro relevance, and compiles a bite-sized digest.
            </p>

            {/* Pipeline stages visualization */}
            <div className="flex items-center justify-between mb-4 text-xs text-gray-400">
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md font-medium">scrape</span>
              <span>&rarr;</span>
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md font-medium">filter</span>
              <span>&rarr;</span>
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md font-medium">dedup</span>
              <span>&rarr;</span>
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md font-medium">score</span>
              <span>&rarr;</span>
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md font-medium">digest</span>
            </div>

            <button
              onClick={handleRunPipeline}
              disabled={isScanning}
              className="btn-primary w-full"
            >
              {isScanning ? 'running pipeline...' : 'run kiro pipeline'}
            </button>

            {scanResults && (
              <div className="mt-3 p-3 bg-purple-50 rounded-xl text-sm animate-slide-up">
                <p className="font-medium text-purple-800">pipeline complete</p>
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                  <div className="bg-white rounded-lg p-2">
                    <span className="text-gray-500">sources</span>
                    <p className="font-semibold text-purple-700">
                      {scanResults.sourcesSucceeded}/{scanResults.sourcesChecked}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    <span className="text-gray-500">raw items</span>
                    <p className="font-semibold text-purple-700">
                      {scanResults.rawItemsFound}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    <span className="text-gray-500">new unique</span>
                    <p className="font-semibold text-purple-700">
                      {scanResults.newItems}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    <span className="text-gray-500">in digest</span>
                    <p className="font-semibold text-purple-700">
                      {scanResults.digestItems}
                    </p>
                  </div>
                </div>
                {scanResults.sourcesFailed > 0 && (
                  <p className="text-orange-600 text-xs mt-2">
                    {scanResults.sourcesFailed} source{scanResults.sourcesFailed !== 1 ? 's' : ''} failed
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

          {/* Raw Items */}
          <div className="card mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sm uppercase tracking-wide text-gray-500">
                stored items ({items.length})
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
                no items yet. run the pipeline to scan AWS channels.
              </p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {items.slice(0, 20).map((item, index) => (
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
                      {item.discoveredAt && (
                        <span className="text-xs text-gray-400">
                          &middot; found {formatTimeAgo(item.discoveredAt)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {items.length > 20 && (
                  <p className="text-xs text-gray-400 text-center py-2">
                    + {items.length - 20} more items
                  </p>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Digest Tab */}
      {activeTab === 'digest' && (
        <>
          {/* Digest Preview */}
          <div className="card mb-4">
            <h2 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">
              newsletter digest
            </h2>

            {digest && digest.length > 0 ? (
              <div className="space-y-4">
                {digest.map((section) => (
                  <div key={section.category}>
                    <h3 className="text-sm font-semibold text-purple-700 mb-2 flex items-center gap-1">
                      <span>{section.emoji}</span>
                      <span>{section.label}</span>
                      <span className="text-xs text-gray-400 font-normal ml-1">
                        ({section.items.length})
                      </span>
                    </h3>
                    <div className="space-y-2">
                      {section.items.map((item, idx) => (
                        <div
                          key={item.url || idx}
                          className="bg-white rounded-xl p-3 border border-purple-100 shadow-sm"
                        >
                          <p className="font-medium text-sm">
                            {item.url ? (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-800 hover:text-purple-600 underline"
                              >
                                {item.title}
                              </a>
                            ) : (
                              item.title
                            )}
                          </p>
                          {item.summary && (
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                              {item.summary}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                            <span>{item.source}</span>
                            {item.publishedAt && (
                              <>
                                <span>&middot;</span>
                                <span>
                                  {new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                              </>
                            )}
                            {item.url && (
                              <>
                                <span>&middot;</span>
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-500 hover:text-purple-700"
                                >
                                  source &rarr;
                                </a>
                              </>
                            )}
                            <span className="ml-auto bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded text-[10px]">
                              score: {item.relevanceScore}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">no digest generated yet</p>
                <p className="text-xs mt-1">run the pipeline from the pipeline tab first</p>
              </div>
            )}
          </div>

          {/* Send Controls */}
          <div className="card mb-4">
            <h2 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">
              compile &amp; deliver
            </h2>

            <p className="text-sm text-gray-600 mb-2">
              sending to {getActiveKiroSubscribers().length + subscribers.length} recipient{(getActiveKiroSubscribers().length + subscribers.length) !== 1 ? 's' : ''}
              {getActiveKiroSubscribers().length > 0 && (
                <span className="text-xs text-purple-600 ml-1">
                  ({getActiveKiroSubscribers().length} kiro subscriber{getActiveKiroSubscribers().length !== 1 ? 's' : ''})
                </span>
              )}
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
                {showPreview ? 'hide text preview' : 'preview as text'}
              </button>
              <button
                onClick={handleCompileAndDeliver}
                className="btn-primary w-full"
                disabled={items.length === 0 || isSending}
              >
                {isSending ? 'sending...' : 'run full cycle: detect → compile → deliver'}
              </button>
            </div>
          </div>

          {/* Text Preview */}
          {showPreview && (
            <div className="card bg-gradient-to-br from-purple-50 to-rose-50 animate-slide-up mb-4">
              <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">
                text preview
              </h3>
              <div className="bg-white rounded-xl p-6 shadow-inner">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                  {getPreviewText()}
                </pre>
              </div>
            </div>
          )}
        </>
      )}

      {/* Subscribers Tab */}
      {activeTab === 'subscribers' && (
        <>
          {/* Add Subscriber */}
          <div className="card mb-4">
            <h2 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">
              add subscriber
            </h2>
            <form onSubmit={handleAddKiroSubscriber} className="space-y-2">
              <input
                type="email"
                className="input-field"
                placeholder="email address"
                value={newSubEmail}
                onChange={(e) => setNewSubEmail(e.target.value)}
                required
              />
              <input
                type="text"
                className="input-field"
                placeholder="name (optional)"
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
              />
              <button type="submit" className="btn-primary w-full">
                add subscriber
              </button>
            </form>
          </div>

          {/* Subscriber List */}
          <div className="card mb-4">
            <h2 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">
              kiro subscribers ({kiroSubscribers.length})
            </h2>

            {kiroSubscribers.length === 0 ? (
              <p className="text-sm text-gray-500">
                no subscribers yet. add email addresses above to start sending the kiro digest.
              </p>
            ) : (
              <div className="space-y-2">
                {kiroSubscribers.map((sub) => (
                  <div
                    key={sub.id}
                    className={`flex items-center justify-between p-2 rounded-lg ${
                      sub.active ? 'bg-gray-50' : 'bg-red-50'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {sub.name ? `${sub.name} ` : ''}
                        <span className="text-gray-500">{sub.email}</span>
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        {sub.active ? (
                          <span className="text-green-600">active</span>
                        ) : (
                          <span className="text-red-500">unsubscribed</span>
                        )}
                        <span>&middot;</span>
                        <span>added {formatTimeAgo(sub.addedAt)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveKiroSubscriber(sub.id)}
                      className="text-xs text-red-400 hover:text-red-600 ml-2 shrink-0"
                    >
                      remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Email API Settings */}
          <div className="card mb-4">
            <h2 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">
              email delivery settings
            </h2>
            <p className="text-xs text-gray-500 mb-3">
              required to send emails via API. each recipient gets a personal unsubscribe link.
            </p>

            <div className="space-y-2">
              <div>
                <label className="block text-xs font-semibold mb-1 uppercase tracking-wide text-gray-400">
                  provider
                </label>
                <select
                  className="input-field"
                  value={emailProvider}
                  onChange={(e) => setEmailProvider(e.target.value)}
                >
                  <option value="resend">Resend</option>
                  <option value="sendgrid">SendGrid</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 uppercase tracking-wide text-gray-400">
                  api key
                </label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="your API key"
                  value={emailApiKey}
                  onChange={(e) => setEmailApiKey(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 uppercase tracking-wide text-gray-400">
                  from email
                </label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="newsletter@yourdomain.com"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 uppercase tracking-wide text-gray-400">
                  from name (optional)
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Kiro Digest"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                />
              </div>
              <button
                onClick={handleSaveEmailSettings}
                className="btn-secondary w-full"
              >
                save settings
              </button>
            </div>
          </div>
        </>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <>
          {/* Newsletter History */}
          <div className="card mb-4">
            <h2 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">
              newsletter history ({newsletterHistory.length})
            </h2>

            {newsletterHistory.length === 0 ? (
              <p className="text-sm text-gray-500">
                no newsletters sent yet. run the full cycle from the digest tab.
              </p>
            ) : (
              <div className="space-y-3">
                {newsletterHistory.map((entry, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm text-gray-800">
                        {entry.subject}
                      </p>
                      <span className="text-xs text-gray-400">
                        {formatTimeAgo(entry.sentAt)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2 text-xs">
                      <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                        {entry.digestItemCount} items
                      </span>
                      {entry.categories && entry.categories.map((cat) => (
                        <span
                          key={cat}
                          className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                        >
                          {CATEGORY_META[cat]?.emoji || '📌'} {cat}
                        </span>
                      ))}
                    </div>
                    {entry.delivery && (
                      <div className="mt-2 text-xs text-gray-500">
                        {entry.delivery.email?.sent > 0 && (
                          <span className="mr-3">
                            {entry.delivery.email.sent} email{entry.delivery.email.sent !== 1 ? 's' : ''}
                          </span>
                        )}
                        {entry.delivery.sms?.sent > 0 && (
                          <span>
                            {entry.delivery.sms.sent} SMS
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Scrape Log */}
          {scrapeLog.length > 0 && (
            <div className="card">
              <h2 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">
                scan log
              </h2>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {scrapeLog.slice(0, 15).map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-xs text-gray-500 py-1 border-b border-gray-100 last:border-0"
                  >
                    <span>{formatTimeAgo(entry.timestamp)}</span>
                    <span>
                      {entry.sourcesSucceeded}/{entry.sourcesChecked} sources
                      &middot; {entry.newItems} new
                      {entry.pipeline && (
                        <span className="ml-1 bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded text-[10px]">
                          pipeline
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
