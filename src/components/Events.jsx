import { useState, useEffect } from 'react';
import { getEvents, addEvent, deleteEvent } from '../utils/storage';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    location: '',
    description: '',
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = () => {
    const storedEvents = getEvents();
    // Sort by date
    storedEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    setEvents(storedEvents);
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (newEvent.title && newEvent.date) {
      addEvent(newEvent);
      setNewEvent({ title: '', date: '', location: '', description: '' });
      setShowAddForm(false);
      loadEvents();
    }
  };

  const handleDeleteEvent = (id) => {
    if (confirm('Delete this event?')) {
      deleteEvent(id);
      loadEvents();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      <div className="flex justify-between items-center mb-6 animate-slide-up">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
          where i'll be
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
          <form onSubmit={handleAddEvent} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-gray-500">
                what's happening? *
              </label>
              <input
                type="text"
                className="input-field"
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
                placeholder="dinner at tartine"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-gray-500">
                when? *
              </label>
              <input
                type="datetime-local"
                className="input-field"
                value={newEvent.date}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, date: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-gray-500">
                where?
              </label>
              <input
                type="text"
                className="input-field"
                value={newEvent.location}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, location: e.target.value })
                }
                placeholder="123 main st, sf"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-gray-500">
                vibe check
              </label>
              <textarea
                className="input-field"
                rows="2"
                value={newEvent.description}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, description: e.target.value })
                }
                placeholder="casual dinner, come thru!"
              />
            </div>

            <button type="submit" className="btn-primary w-full">
              save
            </button>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {events.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-6xl mb-4 animate-bounce">📍</div>
            <p className="text-xl font-bold text-gray-700 mb-2">no plans yet!</p>
            <p className="text-sm text-gray-400 mb-6">
              add where you'll be this month
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary inline-block"
            >
              + add your first event
            </button>
          </div>
        ) : (
          events.map((event, index) => (
            <div
              key={event.id}
              className="card hover:shadow-lg hover:-translate-y-1 group animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900">{event.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(event.date)}
                  </p>
                  {event.location && (
                    <p className="text-sm text-gray-500 mt-1">
                      {event.location}
                    </p>
                  )}
                  {event.description && (
                    <p className="text-sm text-gray-600 mt-2 italic">
                      {event.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteEvent(event.id)}
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
