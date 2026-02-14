import { useState } from 'react';
import { Globe, Key, Check, Info, ExternalLink } from 'lucide-react';
import useStore from '../store/useStore';

export default function SettingsPage() {
  const { apiSettings, updateApiSettings } = useStore();
  const [saved, setSaved] = useState(false);

  // Check if credentials are provided via .env file
  const envAppId = import.meta.env.VITE_ADZUNA_APP_ID || '';
  const envAppKey = import.meta.env.VITE_ADZUNA_APP_KEY || '';
  const hasEnvCredentials = !!(envAppId && envAppKey);

  const handleChange = (field, value) => {
    updateApiSettings({ [field]: value });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
        <p className="text-primary-400">Configure external job sources to get real listings</p>
      </div>

      {/* How it works */}
      <div className="bg-primary-900/50 rounded-xl p-6 border border-primary-700/30">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary-400 mt-0.5 shrink-0" />
          <div>
            <h2 className="text-sm font-bold text-white mb-2">How Job Sources Work</h2>
            <p className="text-sm text-primary-400 leading-relaxed">
              QuestCareer pulls real job listings from external APIs and blends them with sample data.
              The <strong className="text-emerald-400">Remotive API</strong> works out of the box with
              no setup needed (remote jobs only). To get broader listings across all job types,
              add your <strong className="text-sky-400">Adzuna API</strong> credentials below.
            </p>
          </div>
        </div>
      </div>

      {/* Remotive (no config needed) */}
      <div className="bg-primary-900/50 rounded-xl p-6 border border-primary-700/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Globe className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Remotive</h2>
              <p className="text-xs text-primary-400">Remote jobs — Free, no API key needed</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-500/30">
            <Check className="w-3 h-3" />
            Active
          </span>
        </div>
        <p className="text-sm text-primary-400">
          Remotive provides remote-focused job listings at no cost. This source is always active
          and requires no configuration.
        </p>
      </div>

      {/* Adzuna */}
      <div className="bg-primary-900/50 rounded-xl p-6 border border-primary-700/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-500/20 flex items-center justify-center">
              <Key className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Adzuna</h2>
              <p className="text-xs text-primary-400">All job types — Free tier, requires API key</p>
            </div>
          </div>
          {hasEnvCredentials ? (
            <span className="flex items-center gap-1.5 text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-500/30">
              <Check className="w-3 h-3" />
              Active via .env
            </span>
          ) : apiSettings.adzunaAppId && apiSettings.adzunaAppKey ? (
            <span className="flex items-center gap-1.5 text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-500/30">
              <Check className="w-3 h-3" />
              Configured
            </span>
          ) : (
            <span className="text-xs bg-primary-500/20 text-primary-400 px-3 py-1.5 rounded-full border border-primary-500/30">
              Not configured
            </span>
          )}
        </div>

        <p className="text-sm text-primary-400 mb-4">
          Adzuna provides broad job listings across multiple categories and countries.
          Sign up for free API credentials at{' '}
          <a
            href="https://developer.adzuna.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:text-sky-300 inline-flex items-center gap-1"
          >
            developer.adzuna.com
            <ExternalLink className="w-3 h-3" />
          </a>
        </p>

        {hasEnvCredentials && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-sm text-emerald-400 mb-4">
            Credentials loaded from <code className="bg-emerald-500/10 px-1.5 py-0.5 rounded text-xs">.env</code> file.
            The fields below are only used as a fallback when .env values are empty.
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-300 mb-1">App ID</label>
            <input
              type="text"
              value={apiSettings.adzunaAppId || ''}
              onChange={(e) => handleChange('adzunaAppId', e.target.value.trim())}
              disabled={hasEnvCredentials}
              className="w-full px-4 py-3 bg-primary-800/50 border border-primary-600/30 rounded-xl text-white placeholder-primary-500 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-all font-mono text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              placeholder={hasEnvCredentials ? 'Set via .env' : 'Your Adzuna App ID'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-300 mb-1">App Key</label>
            <input
              type="password"
              value={apiSettings.adzunaAppKey || ''}
              onChange={(e) => handleChange('adzunaAppKey', e.target.value.trim())}
              disabled={hasEnvCredentials}
              className="w-full px-4 py-3 bg-primary-800/50 border border-primary-600/30 rounded-xl text-white placeholder-primary-500 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-all font-mono text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              placeholder={hasEnvCredentials ? 'Set via .env' : 'Your Adzuna App Key'}
            />
          </div>
        </div>

        {saved && (
          <div className="flex items-center gap-2 text-green-400 text-sm mt-3 animate-slide-up">
            <Check className="w-4 h-4" />
            Settings saved — new jobs will appear on next search
          </div>
        )}
      </div>

      {/* Data note */}
      <div className="bg-primary-800/30 rounded-xl p-4 border border-primary-700/20 text-xs text-primary-500 space-y-2">
        <p>
          <strong className="text-primary-400">Recommended:</strong> Set your credentials in the{' '}
          <code className="bg-primary-700/50 px-1.5 py-0.5 rounded">.env</code> file at the project root:
        </p>
        <pre className="bg-primary-900/50 rounded-lg p-3 text-primary-300 overflow-x-auto">
{`VITE_ADZUNA_APP_ID=your_app_id
VITE_ADZUNA_APP_KEY=your_app_key`}
        </pre>
        <p>
          Credentials in <code className="bg-primary-700/50 px-1.5 py-0.5 rounded">.env</code> are
          gitignored and never committed. The form fields above serve as a browser-only fallback.
          Job listings are cached for 15 minutes to reduce API calls.
        </p>
      </div>
    </div>
  );
}
