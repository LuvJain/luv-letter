/**
 * Date-time picker component using HTML5 datetime-local input.
 * Prevents selection of past dates and captures timezone-aware datetime.
 */
export default function DateTimePicker({ value, onChange }) {
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

  const handleChange = (e) => {
    const localValue = e.target.value;
    if (!localValue) {
      onChange('');
      return;
    }

    // Convert local datetime to ISO 8601 with timezone offset
    const date = new Date(localValue);
    onChange(date.toISOString());
  };

  const handleClear = () => {
    onChange('');
  };

  // Convert ISO string back to datetime-local format for input display
  const getDisplayValue = () => {
    if (!value) return '';
    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const formatPreview = () => {
    if (!value) return null;
    const date = new Date(value);
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

  const preview = formatPreview();

  return (
    <div>
      <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-gray-500">
        scheduled date & time *
      </label>
      <div className="flex gap-2">
        <input
          type="datetime-local"
          className="input-field flex-1"
          value={getDisplayValue()}
          min={getMinDateTime()}
          onChange={handleChange}
          required
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            title="Clear date"
          >
            clear
          </button>
        )}
      </div>
      {preview && (
        <p className="mt-2 text-sm text-gray-500">{preview}</p>
      )}
    </div>
  );
}
