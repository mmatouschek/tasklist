import React, { useState } from 'react';
import { X, Check, Copy, Globe, ShieldCheck, Terminal, ExternalLink, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface GitHubPagesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubPagesModal: React.FC<GitHubPagesModalProps> = ({ isOpen, onClose }) => {
  const { allowedOwnerEmail, singleUserMode } = useAuth();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [repoName, setRepoName] = useState('todo-pulse');

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const ghActionYaml = `name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 p-6 md:p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/50 dark:border-indigo-800/50">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Deploy to GitHub Pages</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Host your personal to-do app completely free</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Highlight */}
        <div className="my-5 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-semibold text-emerald-800 dark:text-emerald-200">
              Single-User Public Endpoint Protection is Active
            </p>
            <p className="text-emerald-700 dark:text-emerald-300">
              {singleUserMode ? (
                <>
                  Your app is configured so <strong>only {allowedOwnerEmail}</strong> can sign in and access tasks. If anyone else visits your public GitHub Pages URL, they will be blocked by the owner authentication shield and cannot see or edit any tasks.
                </>
              ) : (
                'Single-user mode is currently disabled in Settings. Turn it on so only your email can view tasks.'
              )}
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-6 text-sm">
          {/* Step 1 */}
          <div>
            <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100 mb-1">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">1</span>
              <span>Set Repository Base Path</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              If your GitHub repo will be <code>username.github.io/{repoName}</code>, your <code>vite.config.ts</code> can set <code>base: '/{repoName}/'</code>:
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Repository Name:</span>
              <input
                type="text"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                className="px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                placeholder="repo-name"
              />
            </div>
          </div>

          {/* Step 2: Firebase Auth Authorized Domains */}
          <div>
            <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100 mb-1">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">2</span>
              <span>Whitelist your GitHub Pages domain in Firebase</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Go to Firebase Console &gt; <strong>Authentication</strong> &gt; <strong>Settings</strong> &gt; <strong>Authorized domains</strong> and add:
            </p>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-xs">
              <span>your-github-username.github.io</span>
              <button
                onClick={() => copyToClipboard('your-github-username.github.io', 'domain')}
                className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline text-xs"
              >
                {copiedSection === 'domain' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                Copy domain pattern
              </button>
            </div>
          </div>

          {/* Step 3: Automated GitHub Actions Workflow */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">3</span>
                <span>GitHub Action Workflow (<code className="text-xs">.github/workflows/deploy.yml</code>)</span>
              </div>
              <button
                onClick={() => copyToClipboard(ghActionYaml, 'action')}
                className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-medium hover:underline"
              >
                {copiedSection === 'action' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Workflow YAML
              </button>
            </div>
            <div className="relative rounded-lg bg-slate-900 text-slate-200 p-3 font-mono text-xs overflow-x-auto max-h-40 border border-slate-800">
              <pre className="whitespace-pre">{ghActionYaml}</pre>
            </div>
          </div>

          {/* Step 4: Quick CLI build test */}
          <div>
            <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100 mb-1">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">4</span>
              <span>Build and Push</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <code>git add . && git commit -m "Deploy to GH pages" && git push origin main</code>
              <button
                onClick={() => copyToClipboard('git add . && git commit -m "Deploy to GH pages" && git push origin main', 'cli')}
                className="text-indigo-600 dark:text-indigo-400 ml-2"
              >
                {copiedSection === 'cli' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition"
          >
            Got it, close
          </button>
        </div>
      </div>
    </div>
  );
};
