import React, { useState } from 'react';
import { ZipFileEntry } from '../types';
import { Monitor, Smartphone, Tablet, ExternalLink, Sparkles, Layout, Layers, Palette, Eye, CheckCircle2 } from 'lucide-react';

interface DesignPreviewProps {
  files: ZipFileEntry[];
  zipName: string;
  lang: 'bn' | 'en';
}

export const DesignPreview: React.FC<DesignPreviewProps> = ({ files, zipName, lang }) => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  // Find key design files
  const appTsx = files.find((f) => f.path.includes('App.tsx') || f.path.includes('App.jsx') || f.path.includes('index.tsx'))?.content || '';
  const htmlFile = files.find((f) => f.path.endsWith('.html'))?.content || '';
  const packageJsonStr = files.find((f) => f.path.endsWith('package.json'))?.content || '';
  
  let pkgObj: any = {};
  try {
    if (packageJsonStr) pkgObj = JSON.parse(packageJsonStr);
  } catch (e) {}

  // Determine what kind of app design to display
  const isEcommerce = zipName.toLowerCase().includes('e-commerce') || appTsx.includes('AURA STORE') || appTsx.includes('Products');
  const isKanban = zipName.toLowerCase().includes('kanban') || appTsx.includes('TaskFlow') || appTsx.includes('To Do');
  const isPortfolio = zipName.toLowerCase().includes('portfolio') || appTsx.includes('Alex Morgan') || appTsx.includes('Featured Projects');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Design Header Controls */}
      <div className="bg-slate-950 border-b border-slate-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl">
            <Layout className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {lang === 'bn' ? 'আনজিপড প্রজেক্ট এর ডিজাইন প্রিভিউ' : 'Unzipped App Design & UI Preview'}
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                Live Design Render
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {zipName} • {pkgObj.name || 'Extracted App Package'}
            </p>
          </div>
        </div>

        {/* Viewport switcher */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setDevice('desktop')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
              device === 'desktop' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
          <button
            onClick={() => setDevice('tablet')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
              device === 'tablet' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet</span>
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
              device === 'mobile' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>
        </div>
      </div>

      {/* Frame Canvas */}
      <div className="p-6 bg-slate-950 flex justify-center items-center overflow-x-auto min-h-[500px]">
        <div
          className={`transition-all duration-300 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden ${
            device === 'desktop'
              ? 'w-full max-w-5xl'
              : device === 'tablet'
              ? 'w-[720px]'
              : 'w-[375px]'
          }`}
        >
          {/* Mock Browser Header */}
          <div className="bg-slate-950 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
            </div>
            <div className="bg-slate-900 px-4 py-1 rounded-full text-[11px] text-slate-400 border border-slate-800 font-mono truncate max-w-xs">
              https://localhost:3000/{zipName.replace('.zip', '')}
            </div>
            <div className="w-12"></div>
          </div>

          {/* Rendered Design Preview Content */}
          <div className="p-6 text-slate-100 min-h-[420px] font-sans">
            {isEcommerce ? (
              <div className="space-y-6">
                <header className="flex justify-between items-center pb-4 border-b border-slate-800">
                  <h1 className="text-xl font-bold text-indigo-400 tracking-wider">AURA STORE</h1>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">Welcome, Guest</span>
                    <button className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow">
                      Cart (3)
                    </button>
                  </div>
                </header>

                <div className="bg-gradient-to-r from-indigo-900/50 via-purple-900/30 to-slate-900 p-6 rounded-2xl border border-indigo-500/20">
                  <span className="text-xs font-semibold text-indigo-300 uppercase tracking-widest">New Collection</span>
                  <h2 className="text-2xl font-bold text-white mt-1">Minimalist Tech Gear</h2>
                  <p className="text-xs text-slate-300 mt-1 max-w-md">Unzipped React components with responsive Tailwind CSS layout and shopping workflow.</p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-200 mb-4 uppercase tracking-wider">Catalog Items</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { name: 'Aura Wireless Headphones', price: '$299', img: '🎧', tag: 'Best Seller' },
                      { name: 'Mechanical RGB Keyboard', price: '$149', img: '⌨️', tag: 'New' },
                      { name: 'Smart Ambient Desk Lamp', price: '$89', img: '💡', tag: 'Featured' }
                    ].map((item, idx) => (
                      <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-indigo-500/50 transition">
                        <div className="text-4xl text-center py-6 bg-slate-900 rounded-lg mb-3">{item.img}</div>
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-semibold">{item.tag}</span>
                        <h4 className="font-bold text-white text-sm mt-1">{item.name}</h4>
                        <div className="flex justify-between items-center mt-3">
                          <span className="font-extrabold text-white text-sm">{item.price}</span>
                          <button className="px-2.5 py-1 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-500">
                            Add
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : isKanban ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                  <div>
                    <h2 className="text-xl font-bold text-white">TaskFlow Workspace</h2>
                    <p className="text-xs text-slate-400">Unzipped Kanban Project • Sprint #14</p>
                  </div>
                  <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold">
                    + New Task
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { title: 'To Do', color: 'border-amber-500', items: ['Design Landing Page', 'Setup OAuth', 'DB Schema'] },
                    { title: 'In Progress', color: 'border-blue-500', items: ['Integrate Gemini API', 'Build ZIP Extractor'] },
                    { title: 'Done', color: 'border-emerald-500', items: ['Config Vite Server', 'Setup Tailwind', 'Lint Verification'] }
                  ].map((col, idx) => (
                    <div key={idx} className={`bg-slate-950 border-t-2 ${col.color} border border-slate-800 p-4 rounded-xl`}>
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-xs text-slate-200">{col.title}</span>
                        <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-400">{col.items.length}</span>
                      </div>
                      <div className="space-y-2">
                        {col.items.map((task, i) => (
                          <div key={i} className="p-3 bg-slate-900 border border-slate-800/80 rounded-lg text-xs text-slate-300 font-medium hover:border-slate-700">
                            {task}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : isPortfolio ? (
              <div className="space-y-6 text-center max-w-xl mx-auto py-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                  AM
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-white">Alex Morgan</h2>
                  <p className="text-xs text-indigo-400 font-semibold mt-1">Full-Stack Engineer & AI Developer</p>
                  <p className="text-xs text-slate-400 mt-2">Crafting high performance React web apps with automated workflows & clean UI architecture.</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-left pt-4">
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                    <h4 className="font-bold text-xs text-indigo-300">ZIP Code Studio</h4>
                    <p className="text-[11px] text-slate-400 mt-1">Unzipped code inspector & AI reviewer.</p>
                  </div>
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                    <h4 className="font-bold text-xs text-purple-300">Gemini Nexus</h4>
                    <p className="text-[11px] text-slate-400 mt-1">Multimodal AI interface with real-time audio.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-xl flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm text-white">{lang === 'bn' ? 'প্রজেক্ট কোড সফলভাবে এক্সট্র্যাক্ট হয়েছে' : 'Project Extracted Successfully'}</h4>
                    <p className="text-xs text-slate-300">{files.length} files extracted from ZIP archive.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                    <p className="font-bold text-slate-300 mb-2 uppercase tracking-wider text-[10px]">Project Files Structure</p>
                    <ul className="space-y-1 text-slate-400 font-mono">
                      {files.slice(0, 6).map((f) => (
                        <li key={f.path} className="truncate">• {f.path}</li>
                      ))}
                      {files.length > 6 && <li className="text-indigo-400">...and {files.length - 6} more files</li>}
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                    <p className="font-bold text-slate-300 mb-2 uppercase tracking-wider text-[10px]">Package Configuration</p>
                    <pre className="text-[11px] text-slate-300 font-mono whitespace-pre-wrap">
                      {packageJsonStr ? packageJsonStr.slice(0, 200) : 'Standard Web Application'}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
