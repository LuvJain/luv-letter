const AVAILABLE_VARIABLES = [
  { name: 'firstName', label: 'first name' },
  { name: 'lastName', label: 'last name' },
  { name: 'fullName', label: 'full name' },
  { name: 'phoneNumber', label: 'phone number' },
  { name: 'email', label: 'email' },
  { name: 'customField1', label: 'custom field 1' },
  { name: 'customField2', label: 'custom field 2' },
  { name: 'customField3', label: 'custom field 3' },
];

export default function VariablePicker({ onInsert }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-gray-500">
        insert variable
      </label>
      <div className="flex flex-wrap gap-2">
        {AVAILABLE_VARIABLES.map((variable) => (
          <button
            key={variable.name}
            type="button"
            onClick={() => onInsert(variable.name)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 hover:border-purple-300 transition-all duration-200 active:scale-95"
          >
            {`{{${variable.label}}}`}
          </button>
        ))}
      </div>
    </div>
  );
}

export { AVAILABLE_VARIABLES };
