import { useState, useRef } from 'react';

/**
 * Validate and format a phone number using existing SMS validation rules.
 * Returns { valid, formatted, error }.
 */
function validatePhoneNumber(phone) {
  if (!phone || !phone.trim()) {
    return { valid: true, formatted: '', error: null };
  }

  // Remove any non-digit characters except leading +
  const cleaned = phone.trim().replace(/[^\d+]/g, '');

  let formatted = cleaned;

  // If it doesn't start with +, add +1 (assume US)
  if (!cleaned.startsWith('+')) {
    formatted = '+1' + cleaned;
  } else if (cleaned.startsWith('+') && !cleaned.startsWith('+1')) {
    // If it has + but not +1, assume US and add 1
    formatted = '+1' + cleaned.substring(1);
  }

  // Basic length validation: should have at least 10 digits after country code
  const digitsOnly = formatted.replace(/\D/g, '');
  if (digitsOnly.length < 10) {
    return { valid: false, formatted, error: `Invalid phone number: "${phone}" (too few digits)` };
  }
  if (digitsOnly.length > 15) {
    return { valid: false, formatted, error: `Invalid phone number: "${phone}" (too many digits)` };
  }

  return { valid: true, formatted, error: null };
}

/**
 * Parse CSV text into an array of objects using header row.
 */
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) {
    throw new Error('CSV must have a header row and at least one data row');
  }

  const headers = lines[0].split(',').map((h) => h.trim());

  // Validate required column
  if (!headers.includes('recipient_id')) {
    throw new Error('CSV must include a "recipient_id" column');
  }

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(',').map((v) => v.trim());
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  return { headers, rows };
}

/**
 * Convert a parsed CSV row into a recipient object.
 * Known columns map to specific fields; others go into personalizationData.
 */
function rowToRecipient(row) {
  const knownFields = ['recipient_id', 'phone_number', 'address', 'firstName', 'lastName'];
  const personalizationData = {};

  for (const [key, value] of Object.entries(row)) {
    if (!knownFields.includes(key) && value) {
      personalizationData[key] = value;
    }
  }

  // Include firstName/lastName in personalization as well
  if (row.firstName) personalizationData.firstName = row.firstName;
  if (row.lastName) personalizationData.lastName = row.lastName;

  return {
    recipientId: row.recipient_id,
    phoneNumber: row.phone_number || '',
    address: row.address || '',
    personalizationData,
  };
}

export default function RecipientUploader({ onUpload }) {
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setError(null);
    setValidationErrors([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const { rows } = parseCSV(text);

        if (rows.length === 0) {
          setError('CSV file contains no data rows');
          return;
        }

        // Convert rows and validate phone numbers
        const recipients = [];
        const phoneErrors = [];

        for (let i = 0; i < rows.length; i++) {
          const recipient = rowToRecipient(rows[i]);

          if (!recipient.recipientId) {
            phoneErrors.push(`Row ${i + 2}: missing recipient_id`);
            continue;
          }

          if (recipient.phoneNumber) {
            const validation = validatePhoneNumber(recipient.phoneNumber);
            if (!validation.valid) {
              phoneErrors.push(`Row ${i + 2}: ${validation.error}`);
              continue;
            }
            recipient.phoneNumber = validation.formatted;
          }

          recipients.push(recipient);
        }

        if (phoneErrors.length > 0) {
          setValidationErrors(phoneErrors);
        }

        if (recipients.length === 0) {
          setError('No valid recipients found in CSV');
          return;
        }

        onUpload(recipients);
      } catch (err) {
        setError(err.message);
      }
    };

    reader.onerror = () => {
      setError('Failed to read file');
    };

    reader.readAsText(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-gray-500">
        upload recipients (csv) *
      </label>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        type="button"
        onClick={handleClick}
        className="w-full p-6 border-2 border-dashed border-gray-300 rounded-xl text-center hover:border-orange-400 hover:bg-orange-50/50 transition-all cursor-pointer"
      >
        <div className="text-3xl mb-2">+</div>
        <p className="text-sm font-semibold text-gray-600">
          click to upload CSV
        </p>
        <p className="text-xs text-gray-400 mt-1">
          columns: recipient_id, phone_number, address, firstName, lastName, ...
        </p>
      </button>

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
          <p className="font-semibold mb-1">
            {validationErrors.length} row(s) skipped:
          </p>
          <ul className="list-disc list-inside space-y-0.5">
            {validationErrors.slice(0, 5).map((err, i) => (
              <li key={i} className="text-xs">{err}</li>
            ))}
            {validationErrors.length > 5 && (
              <li className="text-xs text-yellow-600">
                ...and {validationErrors.length - 5} more
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
