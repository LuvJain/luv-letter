import DateTimePicker from './date-time-picker';

const CHANNEL_OPTIONS = [
  { value: 'sms', label: 'SMS' },
  { value: 'letter', label: 'Letter' },
  { value: 'both', label: 'Both' },
];

/**
 * Schedule form with template dropdown, channel radio buttons,
 * date/time picker, and recipient count display.
 */
export default function ScheduleForm({
  templates,
  templateId,
  channel,
  scheduledAt,
  recipientCount,
  onTemplateChange,
  onChannelChange,
  onScheduledAtChange,
}) {
  return (
    <div className="space-y-4">
      {/* Template selection */}
      <div>
        <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-gray-500">
          template *
        </label>
        <select
          className="input-field"
          value={templateId || ''}
          onChange={(e) => onTemplateChange(e.target.value || null)}
          required
        >
          <option value="">select a template...</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.channel})
            </option>
          ))}
        </select>
        {templates.length === 0 && (
          <p className="mt-1 text-xs text-gray-400">
            no templates available — create one in the templates tab first
          </p>
        )}
      </div>

      {/* Channel selection */}
      <div>
        <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-gray-500">
          channel *
        </label>
        <div className="flex gap-2">
          {CHANNEL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChannelChange(opt.value)}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                channel === opt.value
                  ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date/time picker */}
      <DateTimePicker value={scheduledAt} onChange={onScheduledAtChange} />

      {/* Recipient count */}
      {recipientCount > 0 && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
          <span className="text-green-600 font-semibold text-sm">
            {recipientCount} recipient{recipientCount !== 1 ? 's' : ''} loaded
          </span>
        </div>
      )}
    </div>
  );
}
