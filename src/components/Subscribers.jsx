import { useState, useEffect } from 'react';
import {
  getSubscribers,
  addSubscriber,
  deleteSubscriber,
  exportData,
  getUserEmail,
  setUserEmail,
} from '../utils/storage';

export default function Subscribers() {
  const [subscribers, setSubscribers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showShareLink, setShowShareLink] = useState(false);
  const [userEmailInput, setUserEmailInput] = useState('');
  const [newSubscriber, setNewSubscriber] = useState({
    contact: '',
    name: '',
    type: 'email', // 'email' or 'phone'
  });

  useEffect(() => {
    loadSubscribers();
    const savedEmail = getUserEmail();
    if (savedEmail) {
      setUserEmailInput(savedEmail);
    }
  }, []);

  const loadSubscribers = () => {
    setSubscribers(getSubscribers());
  };

  const handleAddSubscriber = (e) => {
    e.preventDefault();
    if (newSubscriber.contact) {
      let contact = newSubscriber.contact;

      // Auto-add +1 to phone numbers if not present
      if (newSubscriber.type === 'phone') {
        // Remove any non-digit characters except leading +
        const cleaned = contact.replace(/[^\d+]/g, '');

        // If it doesn't start with +, add +1
        if (!cleaned.startsWith('+')) {
          contact = '+1' + cleaned;
        } else if (cleaned.startsWith('+') && !cleaned.startsWith('+1')) {
          // If it has + but not +1, assume US and add 1
          contact = '+1' + cleaned.substring(1);
        } else {
          contact = cleaned;
        }
      }

      addSubscriber(contact, newSubscriber.name, newSubscriber.type);
      setNewSubscriber({ contact: '', name: '', type: 'email' });
      setShowAddForm(false);
      loadSubscribers();
    }
  };

  const handleDeleteSubscriber = (id) => {
    if (confirm('Remove this subscriber?')) {
      deleteSubscriber(id);
      loadSubscribers();
    }
  };

  const handleExportFriends = async () => {
    const subs = getSubscribers();
    const friendList = JSON.stringify(subs, null, 2);

    try {
      await navigator.clipboard.writeText(friendList);
      alert(`Copied ${subs.length} friends to clipboard! Share this with someone to import.`);
    } catch (err) {
      // Fallback: show in alert
      alert(`Copy this and share:\n\n${friendList}`);
    }
  };

  const handleImportFriends = () => {
    const input = prompt('Paste friend list here:');
    if (!input) return;

    try {
      const importedFriends = JSON.parse(input);
      if (!Array.isArray(importedFriends)) {
        alert('Invalid format!');
        return;
      }

      // Add all imported friends
      importedFriends.forEach(friend => {
        if (friend.contact || friend.email) {
          // Support both old and new format
          const contact = friend.contact || friend.email;
          const type = friend.type || 'email';
          addSubscriber(contact, friend.name || '', type);
        }
      });

      loadSubscribers();
      alert(`Imported ${importedFriends.length} friends!`);
    } catch (err) {
      alert('Invalid friend list format!');
    }
  };

  const generateShareLink = () => {
    const userEmail = getUserEmail();
    if (!userEmail) {
      return null;
    }
    const subscribeUrl = `${window.location.origin}${window.location.pathname}?subscribe=true&owner=${encodeURIComponent(userEmail)}`;
    return subscribeUrl;
  };

  const handleSaveEmail = () => {
    if (!userEmailInput || !userEmailInput.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    setUserEmail(userEmailInput);
    alert('Email saved! Now you can share your subscribe link');
  };

  const copyShareLink = () => {
    const link = generateShareLink();
    if (!link) {
      alert('Please set your email first');
      return;
    }
    navigator.clipboard.writeText(link);
    alert('Link copied! Share this with friends');
  };

  const shareViaMessage = () => {
    const link = generateShareLink();
    if (!link) {
      alert('Please set your email first');
      return;
    }

    const message = `hey! i'm sending monthly luv-letters about where i'll be. click here to subscribe: ${link}`;

    // Try to use native share if available
    if (navigator.share) {
      navigator.share({
        title: 'Subscribe to my Luv-Letter',
        text: message,
      });
    } else {
      // Fallback to copy
      navigator.clipboard.writeText(message);
      alert('Message copied! Paste and send to your friends');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      <div className="flex justify-between items-center mb-6 animate-slide-up">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
          friends
        </h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
            showAddForm
              ? 'bg-gray-100 text-gray-700'
              : 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg hover:shadow-xl hover:scale-105'
          }`}
        >
          {showAddForm ? '✕' : '+ add'}
        </button>
      </div>

      {showAddForm && (
        <div className="card mb-6 animate-slide-up">
          <form onSubmit={handleAddSubscriber} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-gray-500">
                contact type *
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNewSubscriber({ ...newSubscriber, type: 'email', contact: '' })}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    newSubscriber.type === 'email'
                      ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setNewSubscriber({ ...newSubscriber, type: 'phone', contact: '' })}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    newSubscriber.type === 'phone'
                      ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Phone
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-gray-500">
                {newSubscriber.type === 'email' ? 'email' : 'phone number'} *
              </label>
              <input
                type={newSubscriber.type === 'email' ? 'email' : 'tel'}
                className="input-field"
                value={newSubscriber.contact}
                onChange={(e) =>
                  setNewSubscriber({ ...newSubscriber, contact: e.target.value })
                }
                placeholder={newSubscriber.type === 'email' ? 'friend@example.com' : '1234567890 or +11234567890'}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-gray-500">
                name (optional)
              </label>
              <input
                type="text"
                className="input-field"
                value={newSubscriber.name}
                onChange={(e) =>
                  setNewSubscriber({ ...newSubscriber, name: e.target.value })
                }
                placeholder="their name"
              />
            </div>

            <button type="submit" className="btn-primary w-full">
              add friend
            </button>
          </form>
        </div>
      )}

      <div className="space-y-3 mb-4">
        <div className="card">
          <p className="text-sm text-gray-600 mb-3">
            {subscribers.length} friend{subscribers.length !== 1 ? 's' : ''} on your list
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleExportFriends}
              className="btn-secondary text-xs flex-1"
            >
              share list
            </button>
            <button
              onClick={handleImportFriends}
              className="btn-secondary text-xs flex-1"
            >
              import list
            </button>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-rose-50 to-orange-50 border-rose-200">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="font-semibold text-gray-800 text-sm">share subscribe link</p>
              <p className="text-xs text-gray-500">let friends add themselves</p>
            </div>
            <button
              onClick={() => setShowShareLink(!showShareLink)}
              className="text-orange-600 hover:text-orange-800 font-semibold text-sm transition-colors"
            >
              {showShareLink ? '−' : '+'}
            </button>
          </div>

          {showShareLink && (
            <div className="space-y-3 pt-3 border-t border-rose-200 animate-slide-up">
              {!getUserEmail() ? (
                <div>
                  <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-gray-500">
                    your email (so friends can send you their info)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      className="input-field flex-1"
                      value={userEmailInput}
                      onChange={(e) => setUserEmailInput(e.target.value)}
                      placeholder="you@example.com"
                    />
                    <button
                      onClick={handleSaveEmail}
                      className="btn-primary text-sm whitespace-nowrap px-4"
                    >
                      save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-xs text-gray-500">
                    subscribe link ready for: <span className="font-semibold">{getUserEmail()}</span>
                  </p>
                  <button
                    onClick={shareViaMessage}
                    className="w-full btn-primary text-sm"
                  >
                    share via text
                  </button>
                  <button
                    onClick={copyShareLink}
                    className="w-full btn-secondary text-sm"
                  >
                    copy link
                  </button>
                  <div className="bg-white rounded-lg p-2">
                    <p className="text-xs text-gray-500 break-all font-mono">
                      {generateShareLink()}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {subscribers.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-6xl mb-4 animate-pulse">💜</div>
            <p className="text-xl font-bold text-gray-700 mb-2">no friends yet!</p>
            <p className="text-sm text-gray-400 mb-6">
              add friends who want your monthly updates
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary inline-block"
              >
                add friend
              </button>
              <button
                onClick={() => setShowShareLink(true)}
                className="btn-secondary inline-block"
              >
                share link
              </button>
            </div>
          </div>
        ) : (
          subscribers.map((subscriber, index) => (
            <div
              key={subscriber.id}
              className="card hover:shadow-lg hover:-translate-y-1 group animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {subscriber.name && (
                      <p className="font-semibold text-gray-900">{subscriber.name}</p>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      subscriber.type === 'phone'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {subscriber.type === 'phone' ? '📱' : '📧'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{subscriber.contact || subscriber.email}</p>
                </div>
                <button
                  onClick={() => handleDeleteSubscriber(subscriber.id)}
                  className="text-gray-400 hover:text-red-500 ml-4 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
