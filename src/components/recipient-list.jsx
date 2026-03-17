/**
 * Displays uploaded recipients in a table with row count
 * and allows removing individual rows.
 */
export default function RecipientList({ recipients, onRemove }) {
  if (!recipients || recipients.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        no recipients uploaded yet
      </div>
    );
  }

  // Collect all personalization field keys across all recipients
  const personalizationKeys = [
    ...new Set(
      recipients.flatMap((r) =>
        Object.keys(r.personalizationData || {})
      )
    ),
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
          recipients
        </label>
        <span className="text-xs font-semibold bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
          {recipients.length} recipient{recipients.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                id
              </th>
              <th className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                phone
              </th>
              <th className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                address
              </th>
              {personalizationKeys.map((key) => (
                <th
                  key={key}
                  className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500"
                >
                  {key}
                </th>
              ))}
              <th className="px-3 py-2 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {recipients.map((recipient, index) => (
              <tr
                key={recipient.recipientId || index}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="px-3 py-2 text-gray-700 font-mono text-xs">
                  {recipient.recipientId}
                </td>
                <td className="px-3 py-2 text-gray-700 text-xs">
                  {recipient.phoneNumber || '-'}
                </td>
                <td className="px-3 py-2 text-gray-700 text-xs max-w-[200px] truncate">
                  {recipient.address || '-'}
                </td>
                {personalizationKeys.map((key) => (
                  <td
                    key={key}
                    className="px-3 py-2 text-gray-700 text-xs"
                  >
                    {recipient.personalizationData?.[key] || '-'}
                  </td>
                ))}
                <td className="px-3 py-2 text-center">
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors text-xs"
                    title="Remove recipient"
                  >
                    x
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
