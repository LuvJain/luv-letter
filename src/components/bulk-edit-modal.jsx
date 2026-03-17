import { useState } from 'react';

export default function BulkEditModal({ selectedCount, onSubmit, onClose }) {
  const [scheduledAt, setScheduledAt] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Compute minimum datetime (now, rounded to the next minute)
  const getMinDateTime = () => {
    const now = new Date();
    now.setSeconds(0, 0);
    now.setMinutes(now.getMinutes() + 1);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleDateChange = (e) => {
    setScheduledAt(e.target.value);
    setError('');
    setConfirming(false);
  };

  const formatPreview = () => {
    if (!scheduledAt) return null;
    const date = new Date(scheduledAt);
    return date.toLocaleString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  };

  const handleSubmitClick = () => {
    setError('');

    if (!scheduledAt) {
      setError('Please select a date and time');
      return;
    }

    const selectedDate = new Date(scheduledAt);
    if (selectedDate <= new Date()) {
      setError('Scheduled date must be in the future');
      return;
    }

    if (!confirming) {
      setConfirming(true);
      return;
    }

    // Confirmed — submit
    setSubmitting(true);
    const isoDate = selectedDate.toISOString();
    onSubmit(isoDate);
  };

  const preview = formatPreview();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 animate-slide-up">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            bulk reschedule
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl transition-colors"
          >
            x
          </button>
        </div>

        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-xl">
          <p className="text-sm text-orange-700 font-semibold">
            {selectedCount} schedule{selectedCount !== 1 ? 's' : ''} selected
          </p>
          <p className="text-xs text-orange-500 mt-1">
            set a new date and time for all selected schedules
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-gray-500">
            new scheduled date & time *
          </label>
          <input
            type="datetime-local"
            className="input-field w-full"
            value={scheduledAt}
            min={getMinDateTime()}
            onChange={handleDateChange}
            required
          />
          {preview && (
            <p className="mt-2 text-sm text-gray-500">{preview}</p>
          )}
        </div>

        {confirming && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-sm text-yellow-700 font-semibold">
              are you sure?
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              this will update the scheduled time for {selectedCount} schedule
              {selectedCount !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
          >
            cancel
          </button>
          <button
            type="button"
            onClick={handleSubmitClick}
            disabled={submitting}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg text-sm font-semibold shadow hover:shadow-lg transition-all disabled:opacity-50"
          >
            {submitting
              ? 'updating...'
              : confirming
                ? 'confirm update'
                : 'reschedule all'}
          </button>
        </div>
      </div>
    </div>
  );
}
