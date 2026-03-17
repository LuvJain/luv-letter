import { useState } from 'react';

const STATUS_OPTIONS = [
  { value: '', label: 'all statuses' },
  { value: 'pending', label: 'pending' },
  { value: 'scheduled', label: 'scheduled' },
  { value: 'sent', label: 'sent' },
  { value: 'failed', label: 'failed' },
  { value: 'cancelled', label: 'cancelled' },
];

const CHANNEL_OPTIONS = [
  { value: '', label: 'all channels' },
  { value: 'sms', label: 'SMS' },
  { value: 'letter', label: 'Letter' },
  { value: 'both', label: 'Both' },
];

export default function ScheduleFilters({ filters, onFiltersChange }) {
  const [expanded, setExpanded] = useState(false);

  const handleStatusChange = (e) => {
    onFiltersChange({ ...filters, status: e.target.value, offset: 0 });
  };

  const handleChannelChange = (e) => {
    onFiltersChange({ ...filters, channel: e.target.value, offset: 0 });
  };

  const handleDateFromChange = (e) => {
    const value = e.target.value;
    const dateFrom = value ? new Date(value).toISOString() : '';
    onFiltersChange({ ...filters, dateFrom, offset: 0 });
  };

  const handleDateToChange = (e) => {
    const value = e.target.value;
    const dateTo = value ? new Date(value + 'T23:59:59').toISOString() : '';
    onFiltersChange({ ...filters, dateTo, offset: 0 });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      status: '',
      channel: '',
      dateFrom: '',
      dateTo: '',
      offset: 0,
    });
  };

  const hasActiveFilters =
    filters.status || filters.channel || filters.dateFrom || filters.dateTo;

  // Convert ISO string to date input value
  const getDateValue = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="card mb-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          filters
          {hasActiveFilters && (
            <span className="inline-block w-2 h-2 rounded-full bg-orange-500" />
          )}
        </button>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            clear all
          </button>
        )}
      </div>

      {expanded && (
        <div className="mt-4 grid grid-cols-2 gap-3 animate-slide-up">
          {/* Status filter */}
          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wide text-gray-500">
              status
            </label>
            <select
              value={filters.status}
              onChange={handleStatusChange}
              className="input-field text-sm"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Channel filter */}
          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wide text-gray-500">
              channel
            </label>
            <select
              value={filters.channel}
              onChange={handleChannelChange}
              className="input-field text-sm"
            >
              {CHANNEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date from */}
          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wide text-gray-500">
              from date
            </label>
            <input
              type="date"
              value={getDateValue(filters.dateFrom)}
              onChange={handleDateFromChange}
              className="input-field text-sm"
            />
          </div>

          {/* Date to */}
          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wide text-gray-500">
              to date
            </label>
            <input
              type="date"
              value={getDateValue(filters.dateTo)}
              onChange={handleDateToChange}
              className="input-field text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}
