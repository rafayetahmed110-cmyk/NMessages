import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { ZipFileEntry, CodeReviewResult, RepoSummary } from '../types';
import { DesignPreview } from './DesignPreview';
import {
  FileText,
  Folder,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Code2,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Copy,
  Check,
  FileCode,
  Download,
  Search,
  Eye,
  RefreshCw,
  Layout
} from 'lucide-react';

interface ZipViewerProps {
  zipFile: File;
  lang: 'bn' | 'en';
  onClear: () => void;
}

export const ZipViewer: React.FC<ZipViewerProps> = ({ zipFile, lang, onClear }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [files, setFiles] = useState<ZipFileEntry[]>([]);
  const [selectedFile, setSelectedFile] = useState<ZipFileEntry | null>(null);
  const [activeTab, setActiveTab] = useState<'design' | 'code' | 'review' | 'summary'>('design');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // AI states
  const [reviewLoading, setReviewLoading] = useState<boolean>(false);
  const [reviewResult, setReviewResult] = useState<CodeReviewResult | null>(null);
  const [summaryLoading, setSummaryLoading] = useState<boolean>(false);
  const [summaryResult, setSummaryResult] = useState<RepoSummary | null>(null);
  
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const processZip = async () => {
      setLoading(true);
      try {
        const zip = new JSZip();
        const content = await zip.loadAsync(zipFile);
        const entries: ZipFileEntry[] = [];

        for (const [relativePath, zipEntry] of Object.entries(content.files)) {
          if (zipEntry.dir) {
            entries.push({
              path: relativePath,
              name: relativePath.split('/').filter(Boolean).pop() || relativePath,
              isDir: true,
              size: 0,
            });
          } else {
            let textContent: string | undefined = undefined;
            const ext = relativePath.split('.').pop()?.toLowerCase() || '';
            const isText = ['ts', 'tsx', 'js', 'jsx', 'json', 'html', 'css', 'md', 'txt', 'py', 'java', 'c', 'cpp', 'rs', 'go', 'env', 'svg', 'xml', 'yaml', 'yml'].includes(ext);

            if (isText && zipEntry.async) {
              try {
                textContent = await zipEntry.async('string');
              } catch (e) {
                console.warn('Failed to read file text', e);
              }
            }

            entries.push({
              path: relativePath,
              name: relativePath.split('/').pop() || relativePath,
              isDir: false,
              size: (zipEntry as any)._data?.uncompressedSize || 0,
              content: textContent,
            });
          }
        }

        if (isMounted) {
          setFiles(entries);
          const firstText = entries.find((e) => !e.isDir && e.content);
          if (firstText) setSelectedFile(firstText);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error reading ZIP file:', err);
        if (isMounted) setLoading(false);
      }
    };

    processZip();
    return () => {
      isMounted = false;
    };
  }, [zipFile]);

  const handleCopyCode = () => {
    if (selectedFile?.content) {
      navigator.clipboard.writeText(selectedFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const runCodeReview = async () => {
    if (!selectedFile?.content) return;
    setReviewLoading(true);
    try {
      const res = await fetch('/api/ai/review-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: selectedFile.content,
          fileName: selectedFile.name,
          language: selectedFile.name.split('.').pop(),
          lang,
        }),
      });
      const data = await res.json();
      setReviewResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setReviewLoading(false);
    }
  };

  const runProjectSummary = async () => {
    setSummaryLoading(true);
    try {
      const readme = files.find((f) => f.name.toLowerCase().startsWith('readme'))?.content || '';
      const packageJson = files.find((f) => f.name === 'package.json')?.content || '';
      
      const res = await fetch('/api/ai/summarize-repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoOwner: 'ZIP',
          repoName: zipFile.name.replace('.zip', ''),
          description: `Extracted ZIP package containing ${files.length} files. Package.json: ${packageJson.slice(0, 500)}`,
          readmeContent: readme,
          lang,
        }),
      });
      const data = await res.json();
      setSummaryResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setSummaryLoading(false);
    }
  };

  const filteredFiles = files.filter((f) =>
    f.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Extracted Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 rounded-xl">
            <FileCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">{zipFile.name}</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                {lang === 'bn' ? 'আনজিপড সম্পন্ন' : 'Extracted'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {files.filter((f) => !f.isDir).length} {lang === 'bn' ? 'টি ফাইল এক্সট্র্যাক্ট করা হয়েছে' : 'files extracted'} • {(zipFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tabs header selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('design')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === 'design'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'ডিজাইন প্রিভিউ' : 'UI Design'}</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === 'code'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'কোড ব্রাউজার' : 'Source Code'}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('summary');
                if (!summaryResult) runProjectSummary();
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === 'summary'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'AI ইনসাইট' : 'AI Summary'}</span>
            </button>
          </div>

          <button
            onClick={onClear}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
          >
            {lang === 'bn' ? 'অন্য জিপ' : 'Change ZIP'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-400" />
          <p className="font-medium text-slate-200">{lang === 'bn' ? 'জিপ ফাইল আনপ্যাক করা হচ্ছে...' : 'Extracting ZIP archive...'}</p>
        </div>
      ) : (
        <div>
          {/* TAB 1: DESIGN PREVIEW */}
          {activeTab === 'design' && (
            <DesignPreview files={files} zipName={zipFile.name} lang={lang} />
          )}

          {/* TAB 2: CODE BROWSER & REVIEW */}
          {(activeTab === 'code' || activeTab === 'review') && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[550px]">
                {/* File Tree Sidebar */}
                <div className="lg:col-span-4 border-r border-slate-800 bg-slate-950/50 flex flex-col max-h-[600px]">
                  <div className="p-3 border-b border-slate-800">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder={lang === 'bn' ? 'ফাইল খুঁজুন...' : 'Search files...'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-2 space-y-0.5 text-xs font-mono">
                    {filteredFiles.map((f) => (
                      <button
                        key={f.path}
                        onClick={() => {
                          if (!f.isDir) {
                            setSelectedFile(f);
                            setActiveTab('code');
                            setReviewResult(null);
                          }
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center gap-2 transition ${
                          selectedFile?.path === f.path
                            ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
                            : f.isDir
                            ? 'text-slate-500 cursor-default'
                            : 'text-slate-300 hover:bg-slate-800/60'
                        }`}
                      >
                        {f.isDir ? (
                          <Folder className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-indigo-400/80 shrink-0" />
                        )}
                        <span className="truncate">{f.path}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Code Display Area */}
                <div className="lg:col-span-8 flex flex-col max-h-[600px] bg-slate-900">
                  <div className="flex items-center justify-between border-b border-slate-800 px-4 bg-slate-950 py-2.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveTab('code')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                          activeTab === 'code' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Code2 className="w-3.5 h-3.5" />
                        {selectedFile ? selectedFile.name : 'Select File'}
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('review');
                          if (!reviewResult) runCodeReview();
                        }}
                        disabled={!selectedFile?.content}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                          activeTab === 'review' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white disabled:opacity-40'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {lang === 'bn' ? 'AI রিভিউ' : 'AI Review'}
                      </button>
                    </div>

                    {selectedFile?.content && (
                      <button
                        onClick={handleCopyCode}
                        className="px-2.5 py-1 text-slate-400 hover:text-white bg-slate-800/60 rounded text-xs flex items-center gap-1"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? (lang === 'bn' ? 'কপি হয়েছে' : 'Copied') : (lang === 'bn' ? 'কপি করুন' : 'Copy')}
                      </button>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-slate-200">
                    {activeTab === 'code' && (
                      selectedFile ? (
                        selectedFile.content ? (
                          <pre className="whitespace-pre-wrap leading-relaxed selection:bg-indigo-500/30 font-mono">
                            {selectedFile.content}
                          </pre>
                        ) : (
                          <div className="p-8 text-center text-slate-500">
                            <p>{lang === 'bn' ? 'বাইনারি ফাইল বা ফাইলটি খালি।' : 'Binary file or empty content.'}</p>
                          </div>
                        )
                      ) : (
                        <div className="p-8 text-center text-slate-500">
                          <p>{lang === 'bn' ? 'বামপাশ থেকে যেকোনো ফাইল সিলেক্ট করুন' : 'Select a file from the sidebar'}</p>
                        </div>
                      )
                    )}

                    {activeTab === 'review' && (
                      reviewLoading ? (
                        <div className="p-12 text-center text-slate-400">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
                          <p className="font-sans font-medium">{lang === 'bn' ? 'Gemini AI কোড বিশ্লেষণ করছে...' : 'Gemini AI reviewing code...'}</p>
                        </div>
                      ) : reviewResult ? (
                        <div className="font-sans space-y-4">
                          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                            <div>
                              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                                {lang === 'bn' ? 'কোড স্কোয়াড স্কোর' : 'Code Quality Score'}
                              </p>
                              <p className="text-2xl font-bold text-white mt-1">{reviewResult.score} / 100</p>
                            </div>
                            <div className="text-right max-w-md">
                              <p className="text-xs text-slate-300">{reviewResult.summary}</p>
                            </div>
                          </div>

                          {reviewResult.securityFindings.length > 0 && (
                            <div className="bg-red-950/20 border border-red-500/30 p-4 rounded-xl">
                              <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4" />
                                {lang === 'bn' ? 'সিকিউরিটি অ্যালার্ট' : 'Security Findings'}
                              </h4>
                              <ul className="list-disc pl-5 text-xs text-red-200 space-y-1">
                                {reviewResult.securityFindings.map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {reviewResult.cleanCodeSuggestions.length > 0 && (
                            <div className="bg-indigo-950/20 border border-indigo-500/30 p-4 rounded-xl">
                              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Zap className="w-4 h-4" />
                                {lang === 'bn' ? 'উন্নতির প্রস্তাব' : 'Clean Code Suggestions'}
                              </h4>
                              <ul className="list-disc pl-5 text-xs text-indigo-200 space-y-1">
                                {reviewResult.cleanCodeSuggestions.map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROJECT SUMMARY */}
          {activeTab === 'summary' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
              {summaryLoading ? (
                <div className="p-12 text-center text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
                  <p className="font-sans font-medium">{lang === 'bn' ? 'প্রজেক্ট আর্কিটেকচার বিশ্লেষণ করা হচ্ছে...' : 'Analyzing project structure...'}</p>
                </div>
              ) : summaryResult ? (
                <div className="font-sans space-y-4">
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                    <h4 className="text-base font-bold text-white mb-2">{lang === 'bn' ? 'প্রজেক্ট ওভারভিউ' : 'Project Overview'}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{summaryResult.overview}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                      <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">
                        {lang === 'bn' ? 'টেক স্ট্যাক' : 'Detected Tech Stack'}
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {summaryResult.techStack.map((tech, i) => (
                          <span key={i} className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded-lg font-medium border border-indigo-500/30">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                      <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">
                        {lang === 'bn' ? 'টার্গেট ও ইউসেজ' : 'Target Audience'}
                      </h4>
                      <p className="text-xs text-slate-300">
                        <span className="font-semibold text-white">{summaryResult.difficultyToUse}</span> • {summaryResult.targetAudience}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                      {lang === 'bn' ? 'প্রধান ফিচারসমূহ' : 'Key Features'}
                    </h4>
                    <ul className="list-disc pl-5 text-xs text-slate-300 space-y-1">
                      {summaryResult.keyFeatures.map((feat, i) => (
                        <li key={i}>{feat}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
