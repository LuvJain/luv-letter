import { useState, useEffect, useRef } from 'react';
import VariablePicker from './variable-picker';

const CHANNEL_OPTIONS = [
  { value: 'sms', label: 'SMS' },
  { value: 'letter', label: 'Letter' },
  { value: 'both', label: 'Both' },
];

/**
 * Extract variable names from template content.
 * Matches {{variableName}} patterns.
 */
function extractVariables(content) {
  const matches = content.match(/\{\{(\w+)\}\}/g);
  if (!matches) return [];
  return [...new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, '')))];
}

/**
 * Render content preview with highlighted variable placeholders.
 */
function ContentPreview({ content }) {
  if (!content) {
    return (
      <p className="text-sm text-gray-400 italic">
        start typing to see preview...
      </p>
    );
  }

  const parts = content.split(/(\{\{\w+\}\})/g);

  return (
    <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
      {parts.map((part, i) =>
        /^\{\{\w+\}\}$/.test(part) ? (
          <span
            key={i}
            className="inline-block bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-semibold text-xs mx-0.5"
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </div>
  );
}

export default function TemplateForm({ template, onSubmit, onCancel }) {
  const [name, setName] = useState('');
  const [channel, setChannel] = useState('sms');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef(null);

  const isEditing = !!template;

  useEffect(() => {
    if (template) {
      setName(template.name || '');
      setChannel(template.channel || 'sms');
      setContent(template.content || '');
    } else {
      setName('');
      setChannel('sms');
      setContent('');
    }
  }, [template]);

  const handleInsertVariable = (variableName) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const placeholder = `{{${variableName}}}`;
    const newContent =
      content.substring(0, start) + placeholder + content.substring(end);

    setContent(newContent);

    // Restore cursor position after the inserted variable
    requestAnimationFrame(() => {
      textarea.focus();
      const newPos = start + placeholder.length;
      textarea.setSelectionRange(newPos, newPos);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      const variables = extractVariables(content);
      await onSubmit({
        name: name.trim(),
        content: content.trim(),
        channel,
        variables,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card animate-slide-up">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-900">
          {isEditing ? 'edit template' : 'new template'}
        </h2>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 text-xl transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-gray-500">
            template name *
          </label>
          <input
            type="text"
            className="input-field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="monthly check-in"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-gray-500">
            channel *
          </label>
          <div className="flex gap-2">
            {CHANNEL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setChannel(opt.value)}
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

        <div>
          <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-gray-500">
            content *
          </label>
          <textarea
            ref={textareaRef}
            className="input-field"
            rows="5"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="hey {{firstName}}, just wanted to say..."
            required
          />
        </div>

        <VariablePicker onInsert={handleInsertVariable} />

        <div>
          <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-gray-500">
            preview
          </label>
          <div className="bg-gray-50 rounded-xl border border-purple-100 p-4 min-h-[60px]">
            <ContentPreview content={content} />
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary w-full"
          disabled={submitting || !name.trim() || !content.trim()}
        >
          {submitting
            ? 'saving...'
            : isEditing
              ? 'update template'
              : 'create template'}
        </button>
      </form>
    </div>
  );
}
