const CHANNEL_LABELS = {
  sms: 'SMS',
  letter: 'Letter',
  both: 'Both',
};

const CHANNEL_STYLES = {
  sms: 'bg-blue-50 text-blue-700 border-blue-200',
  letter: 'bg-orange-50 text-orange-700 border-orange-200',
  both: 'bg-purple-50 text-purple-700 border-purple-200',
};

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-700',
  scheduled: 'bg-blue-100 text-blue-700',
  sent: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function truncateId(id) {
  if (!id) return '-';
  return id.substring(0, 8) + '...';
}

export default function ScheduleTable({
  schedules,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onDelete,
  templates,
}) {
  const allSelected =
    schedules.length > 0 && selectedIds.length === schedules.length;

  const getTemplateName = (schedule) => {
    if (!schedule.template_id || !templates) return '-';
    const template = templates.find((t) => t.id === schedule.template_id);
    return template ? template.name : '-';
  };

  const getRecipientCount = (schedule) => {
    if (schedule.schedule_recipients) {
      return schedule.schedule_recipients.length;
    }
    return 0;
  };

  if (schedules.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="text-4xl mb-3">-</div>
        <p className="text-sm text-gray-400">no schedules found</p>
        <p className="text-xs text-gray-300 mt-1">
          try adjusting your filters
        </p>
      </div>
    );
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-3 px-2 w-10">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleSelectAll}
                className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
            </th>
            <th className="text-left py-3 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              id
            </th>
            <th className="text-left py-3 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              template
            </th>
            <th className="text-left py-3 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              channel
            </th>
            <th className="text-left py-3 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              scheduled at
            </th>
            <th className="text-left py-3 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              status
            </th>
            <th className="text-left py-3 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              recipients
            </th>
            <th className="text-right py-3 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              actions
            </th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((schedule, index) => {
            const isSelected = selectedIds.includes(schedule.id);
            return (
              <tr
                key={schedule.id}
                className={`border-b border-gray-50 transition-colors animate-slide-up ${
                  isSelected ? 'bg-orange-50/50' : 'hover:bg-gray-50'
                }`}
                style={{ animationDelay: `${index * 0.02}s` }}
              >
                <td className="py-3 px-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(schedule.id)}
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                </td>
                <td className="py-3 px-2 text-gray-400 font-mono text-xs">
                  {truncateId(schedule.id)}
                </td>
                <td className="py-3 px-2 font-semibold text-gray-800">
                  {getTemplateName(schedule)}
                </td>
                <td className="py-3 px-2">
                  <span
                    className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full border ${
                      CHANNEL_STYLES[schedule.channel] || CHANNEL_STYLES.sms
                    }`}
                  >
                    {CHANNEL_LABELS[schedule.channel] || schedule.channel}
                  </span>
                </td>
                <td className="py-3 px-2 text-gray-600">
                  {schedule.scheduled_at
                    ? formatDateTime(schedule.scheduled_at)
                    : '-'}
                </td>
                <td className="py-3 px-2">
                  <span
                    className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${
                      STATUS_STYLES[schedule.status] || STATUS_STYLES.pending
                    }`}
                  >
                    {schedule.status}
                  </span>
                </td>
                <td className="py-3 px-2 text-gray-600">
                  {getRecipientCount(schedule)}
                </td>
                <td className="py-3 px-2 text-right">
                  <button
                    type="button"
                    onClick={() => onDelete(schedule.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors text-xs font-semibold"
                    title="Cancel schedule"
                  >
                    cancel
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
