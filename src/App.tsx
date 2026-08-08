import React, { useState } from 'react';
import { NMessagesSimulator } from './components/NMessagesSimulator';
import { SourceCodeExplorer } from './components/SourceCodeExplorer';
import { GithubBuildGuide } from './components/GithubBuildGuide';
import {
  MessageSquare,
  Smartphone,
  Code2,
  FolderGit2,
  Globe,
  Download,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Layers,
  Terminal
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'code' | 'guide'>('simulator');
  const [lang, setLang] = useState<'bn' | 'en'>('en');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg tracking-tight text-white flex items-center gap-2">
                NMessages <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-normal border border-indigo-500/30">Android Default SMS Client</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-medium text-slate-300 transition"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>{lang === 'bn' ? 'বাংলা (BN)' : 'English (EN)'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        
        {/* Navigation Tab Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition ${
                activeTab === 'simulator'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>{lang === 'bn' ? 'লাইভ অ্যান্ড্রয়েড অ্যাপ সিমুলেটর' : 'Live Android App Simulator'}</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition ${
                activeTab === 'code'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>{lang === 'bn' ? 'সোর্স কোড ও জিপ প্যাকেজ' : 'Source Code & ZIP Package'}</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition ${
                activeTab === 'guide'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <FolderGit2 className="w-4 h-4" />
              <span>{lang === 'bn' ? 'গিটহাব অ্যাকশনস ও APK গাইড' : 'GitHub Actions & APK Guide'}</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{lang === 'bn' ? 'জিরো ফায়ারবেস • ১০০% লোকাল এসএমএস' : 'Zero Firebase • 100% Local SMS'}</span>
          </div>
        </div>

        {/* Tab Views */}
        {activeTab === 'simulator' && (
          <NMessagesSimulator lang={lang} onLangChange={setLang} />
        )}

        {activeTab === 'code' && (
          <SourceCodeExplorer lang={lang} />
        )}

        {activeTab === 'guide' && (
          <GithubBuildGuide lang={lang} />
        )}
      </main>
    </div>
  );
}
