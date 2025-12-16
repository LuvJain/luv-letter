import { useState, useEffect } from 'react';
import { getSettings, saveSettings, exportData, importData } from '../utils/storage';

export default function Settings() {
  const [settings, setSettings] = useState({
    apiKey: '',
    apiProvider: 'resend',
    fromEmail: '',
    fromName: '',
  });
  const [saved, setSaved] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `luvletter-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result);
          if (confirm('This will replace all your current data. Continue?')) {
            importData(data);
            setSettings(getSettings());
            alert('Data imported successfully!');
          }
        } catch (error) {
          alert('Invalid backup file');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="card mb-6">
        <h2 className="font-semibold mb-4">Email Configuration</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Email Provider
            </label>
            <select
              className="input-field"
              value={settings.apiProvider}
              onChange={(e) =>
                setSettings({ ...settings, apiProvider: e.target.value })
              }
            >
              <option value="resend">Resend</option>
              <option value="sendgrid">SendGrid</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {settings.apiProvider === 'resend'
                ? 'Get your API key at resend.com/api-keys'
                : 'Get your API key at app.sendgrid.com/settings/api_keys'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              API Key *
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                className="input-field pr-10"
                value={settings.apiKey}
                onChange={(e) =>
                  setSettings({ ...settings, apiKey: e.target.value })
                }
                placeholder="re_..."
                required
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showApiKey ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              From Email *
            </label>
            <input
              type="email"
              className="input-field"
              value={settings.fromEmail}
              onChange={(e) =>
                setSettings({ ...settings, fromEmail: e.target.value })
              }
              placeholder="you@example.com"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be a verified domain in your email provider
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              From Name
            </label>
            <input
              type="text"
              className="input-field"
              value={settings.fromName}
              onChange={(e) =>
                setSettings({ ...settings, fromName: e.target.value })
              }
              placeholder="Your Name"
            />
          </div>

          <button type="submit" className="btn-primary w-full">
            {saved ? '✓ Saved!' : 'Save Settings'}
          </button>
        </form>
      </div>

      <div className="card mb-6">
        <h2 className="font-semibold mb-4">Data Backup</h2>
        <div className="space-y-3">
          <button onClick={handleExport} className="btn-secondary w-full">
            Export All Data
          </button>
          <div>
            <label className="btn-secondary w-full cursor-pointer inline-block text-center">
              Import Data
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Backup includes: events, subscribers, and settings
        </p>
      </div>

      <div className="card bg-blue-50 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Setup Instructions</h3>
        <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
          <li>
            Sign up for{' '}
            <a
              href="https://resend.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Resend
            </a>{' '}
            (free tier: 3,000 emails/month)
          </li>
          <li>Verify your domain or use their test domain</li>
          <li>Create an API key and paste it above</li>
          <li>Add your verified sending email</li>
          <li>Save and you're ready to send!</li>
        </ol>
      </div>
    </div>
  );
}
