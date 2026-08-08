import React, { useState } from 'react';
import { GitHubRepoItem, RepoSummary, CodeReviewResult } from '../types';
import {
  Search,
  GitFork,
  Star,
  AlertCircle,
  FileCode2,
  Sparkles,
  ExternalLink,
  Code2,
  ShieldCheck,
  RefreshCw,
  BookOpen,
  FileText,
  Copy,
  Check
} from 'lucide-react';

interface GitHubExplorerProps {
  lang: 'bn' | 'en';
}

export const GitHubExplorer: React.FC<GitHubExplorerProps> = ({ lang }) => {
  const [query, setQuery] = useState<string>('react');
  const [loading, setLoading] = useState<boolean>(false);
  const [repos, setRepos] = useState<GitHubRepoItem[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepoItem | null>(null);
  
  // AI summary state
  const [summaryLoading, setSummaryLoading] = useState<boolean>(false);
  const [summaryResult, setSummaryResult] = useState<RepoSummary | null>(null);
  const [readmeMarkdown, setReadmeMarkdown] = useState<string>('');
  const [readmeLoading, setReadmeLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const searchRepos = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSelectedRepo(null);
    setSummaryResult(null);
    setReadmeMarkdown('');

    try {
      const res = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=10`);
      const data = await res.json();
      if (data.items) {
        setRepos(data.items);
      }
    } catch (err) {
      console.error('Failed to fetch GitHub repos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRepo = async (repo: GitHubRepoItem) => {
    setSelectedRepo(repo);
    setSummaryResult(null);
    setReadmeMarkdown('');
    setSummaryLoading(true);

    try {
      const res = await fetch('/api/ai/summarize-repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoOwner: repo.owner.login,
          repoName: repo.name,
          description: repo.description,
          lang,
        }),
      });
      const data = await res.json();
      setSummaryResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleGenerateReadme = async () => {
    if (!selectedRepo) return;
    setReadmeLoading(true);
    try {
      const res = await fetch('/api/ai/generate-readme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: selectedRepo.name,
          description: selectedRepo.description,
          techStack: selectedRepo.language || 'React, JavaScript, HTML',
          features: summaryResult?.keyFeatures.join(', ') || 'High performance, active community',
          lang,
        }),
      });
      const data = await res.json();
      setReadmeMarkdown(data.markdown || '');
    } catch (err) {
      console.error(err);
    } finally {
      setReadmeLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            {lang === 'bn' ? 'GitHub প্রজেক্ট এক্সপ্লোরার' : 'GitHub Repository Nexus'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'bn' ? 'যেকোনো পাবলিক রির্পোজিটোরি সার্চ করে AI সামারি ও কোড রিকনস্ট্রাকশন দেখুন' : 'Explore any public repository with AI intelligence'}
          </p>
        </div>

        <form onSubmit={searchRepos} className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder={lang === 'bn' ? 'রিপো নাম বা কিওয়ার্ড...' : 'Search repo name or keyword...'}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
          >
            {lang === 'bn' ? 'সার্চ' : 'Search'}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Search Results List */}
        <div className="lg:col-span-5 space-y-3 max-h-[550px] overflow-y-auto pr-1">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
              <p className="text-xs font-medium">{lang === 'bn' ? 'GitHub ডাটা লোড হচ্ছে...' : 'Fetching GitHub repos...'}</p>
            </div>
          ) : repos.length === 0 ? (
            <div className="p-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
              <p className="text-xs">{lang === 'bn' ? 'উপরে সার্চ বক্সে কিওয়ার্ড দিয়ে খুঁজুন' : 'Enter keyword to discover repositories'}</p>
            </div>
          ) : (
            repos.map((repo) => (
              <div
                key={repo.id}
                onClick={() => handleSelectRepo(repo)}
                className={`p-4 rounded-xl border transition cursor-pointer ${
                  selectedRepo?.id === repo.id
                    ? 'bg-indigo-600/15 border-indigo-500/50 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-950'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-indigo-300 truncate max-w-[200px]">
                    {repo.full_name}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-amber-400 font-medium">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {repo.stargazers_count > 1000 ? `${(repo.stargazers_count / 1000).toFixed(1)}k` : repo.stargazers_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork className="w-3 h-3" />
                      {repo.forks_count}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 mb-2">{repo.description || 'No description provided.'}</p>

                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">{repo.language || 'Code'}</span>
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-indigo-400 hover:underline"
                  >
                    GitHub <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected Repo AI Inspection */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          {selectedRepo ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h4 className="text-base font-bold text-white">{selectedRepo.full_name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedRepo.description}</p>
                </div>
                <button
                  onClick={handleGenerateReadme}
                  disabled={readmeLoading}
                  className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {readmeLoading
                    ? (lang === 'bn' ? 'তৈরি হচ্ছে...' : 'Generating...')
                    : (lang === 'bn' ? 'AI README তৈরি করুন' : 'Generate README')}
                </button>
              </div>

              {summaryLoading ? (
                <div className="p-8 text-center text-slate-400">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-400" />
                  <p className="text-xs">{lang === 'bn' ? 'Gemini AI দিয়ে প্রজেক্ট বিশ্লেষণ হচ্ছে...' : 'Analyzing with Gemini AI...'}</p>
                </div>
              ) : summaryResult ? (
                <div className="space-y-3">
                  <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800 text-xs">
                    <p className="font-semibold text-indigo-300 mb-1">{lang === 'bn' ? 'এআই সারাংশ' : 'AI Executive Summary'}</p>
                    <p className="text-slate-300 leading-relaxed">{summaryResult.overview}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                      <p className="font-semibold text-amber-400 mb-1">{lang === 'bn' ? 'টেকনোলজি স্ট্যাক' : 'Tech Stack'}</p>
                      <p className="text-slate-300">{summaryResult.techStack.join(', ')}</p>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                      <p className="font-semibold text-emerald-400 mb-1">{lang === 'bn' ? 'রেটিং' : 'AI Rating'}</p>
                      <p className="text-slate-300">{summaryResult.aiVerdict}</p>
                    </div>
                  </div>
                </div>
              ) : null}

              {readmeMarkdown && (
                <div className="mt-4 p-4 bg-slate-900 rounded-xl border border-slate-800 relative">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                      Generated README.md
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(readmeMarkdown);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copied ? (lang === 'bn' ? 'কপি হয়েছে' : 'Copied') : (lang === 'bn' ? 'কপি করুন' : 'Copy')}
                    </button>
                  </div>
                  <pre className="text-[11px] text-slate-300 overflow-x-auto font-mono max-h-48 whitespace-pre-wrap">
                    {readmeMarkdown}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <FileCode2 className="w-10 h-10 mb-3 text-slate-600" />
              <p className="text-xs font-medium">
                {lang === 'bn' ? 'বামপাশ থেকে যেকোনো রির্পোজিটোরি সিলেক্ট করে AI এনালিসিস দেখুন' : 'Select a repository from the left panel to inspect'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
