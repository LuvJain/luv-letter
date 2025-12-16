import { useState, useEffect } from 'react';
import { getEvents, getSubscribers } from '../utils/storage';

export default function Newsletter() {
  const [events, setEvents] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [introMessage, setIntroMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allEvents = getEvents();
    // Get upcoming events (future dates)
    const upcomingEvents = allEvents.filter(
      (e) => new Date(e.date) >= new Date()
    );
    upcomingEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

    setEvents(upcomingEvents);
    setSubscribers(getSubscribers());

    // Default intro message
    setIntroMessage(
      `hey friends! here's what i'm up to this month. would love to see you at any of these`
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const generateEmailBody = () => {
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });

    let body = `${introMessage}\n\n`;

    if (events.length > 0) {
      body += `WHERE I'LL BE:\n\n`;
      events.forEach((event) => {
        body += `${event.title}\n`;
        body += `${formatDate(event.date)}\n`;
        if (event.location) {
          body += `${event.location}\n`;
        }
        if (event.description) {
          body += `${event.description}\n`;
        }
        body += `\n`;
      });
    }

    body += `\nhope to see you soon!\n\n`;
    body += `sent with luv`;

    return body;
  };

  const handleSend = () => {
    if (subscribers.length === 0) {
      alert('Add some friends first!');
      return;
    }

    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const subject = `${currentMonth} update`;
    const body = generateEmailBody();
    const bcc = subscribers.map(s => s.email).join(',');

    // Create mailto link
    const mailtoLink = `mailto:?bcc=${encodeURIComponent(bcc)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Check if URL is too long (iOS/Android have ~2000 char limits)
    if (mailtoLink.length > 2000) {
      // Fallback: copy to clipboard instead
      const clipboardText = `To: (BCC your friends)\nSubject: ${subject}\n\n${body}`;
      navigator.clipboard.writeText(clipboardText);
      alert('Email is too long for auto-open! Content copied to clipboard. Paste into your email app.');
      return;
    }

    // Open email client
    try {
      window.location.href = mailtoLink;
    } catch (error) {
      // Fallback if mailto fails
      const clipboardText = `To: (BCC your friends)\nSubject: ${subject}\n\n${body}`;
      navigator.clipboard.writeText(clipboardText);
      alert('Could not open email app. Content copied to clipboard!');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent mb-6 animate-slide-up">send luv-letter</h1>

      <div className="card mb-4">
        <p className="text-sm text-gray-600">
          sending to {subscribers.length} friend{subscribers.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="card mb-4">
        <h2 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">
          your message
        </h2>
        <textarea
          className="input-field"
          rows="4"
          value={introMessage}
          onChange={(e) => setIntroMessage(e.target.value)}
          placeholder="hey! here's what i'm up to..."
        />
      </div>

      <div className="card mb-4">
        <h2 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">
          where you'll be ({events.length})
        </h2>
        {events.length === 0 ? (
          <p className="text-sm text-gray-500">no upcoming events yet</p>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="border-l-4 border-purple-400 pl-3 py-1">
                <p className="font-medium">{event.title}</p>
                <p className="text-sm text-gray-600">{formatDate(event.date)}</p>
                {event.location && (
                  <p className="text-sm text-gray-600">📍 {event.location}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="btn-secondary w-full"
        >
          {showPreview ? 'hide preview' : 'preview'}
        </button>

        <button
          onClick={handleSend}
          className="btn-primary w-full"
        >
          open in email app
        </button>
      </div>

      {showPreview && (
        <div className="mt-6 card bg-gradient-to-br from-purple-50 to-rose-50 animate-slide-up">
          <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-gray-500">
            preview
          </h3>
          <div className="bg-white rounded-xl p-6 shadow-inner">
            <div className="mb-4">
              <p className="text-gray-700 whitespace-pre-wrap">{introMessage}</p>
            </div>

            {events.length > 0 && (
              <div className="mb-4">
                <h4 className="font-bold text-gray-900 mb-3">WHERE I'LL BE:</h4>
                <div className="space-y-3">
                  {events.map((event) => (
                    <div key={event.id} className="border-l-4 border-orange-400 pl-3 py-1">
                      <p className="font-semibold text-gray-900">{event.title}</p>
                      <p className="text-sm text-gray-600">{formatDate(event.date)}</p>
                      {event.location && (
                        <p className="text-sm text-gray-600">{event.location}</p>
                      )}
                      {event.description && (
                        <p className="text-sm text-gray-500 mt-1 italic">{event.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-gray-600 text-sm mt-4">
              <p>hope to see you soon!</p>
              <p className="mt-2 text-gray-400">sent with luv</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
