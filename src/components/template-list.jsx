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

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function TemplateList({ templates, onEdit, onDelete }) {
  if (templates.length === 0) {
    return (
      <div className="card text-center py-16">
        <div className="text-6xl mb-4 animate-bounce">📝</div>
        <p className="text-xl font-bold text-gray-700 mb-2">
          no templates yet!
        </p>
        <p className="text-sm text-gray-400">
          create your first message template above
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {templates.map((template, index) => (
        <div
          key={template.id}
          className="card hover:shadow-lg hover:-translate-y-1 group animate-slide-up"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg text-gray-900 truncate">
                  {template.name}
                </h3>
                <span
                  className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full border ${
                    CHANNEL_STYLES[template.channel] || CHANNEL_STYLES.sms
                  }`}
                >
                  {CHANNEL_LABELS[template.channel] || template.channel}
                </span>
              </div>
              <p className="text-sm text-gray-500 truncate">
                {template.content}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                created {formatDate(template.created_at)}
              </p>
            </div>
            <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(template)}
                className="text-gray-400 hover:text-blue-500 transition-colors"
                title="Edit template"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(template.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Delete template"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
