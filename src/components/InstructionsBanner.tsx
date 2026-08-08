import React from 'react';
import { Upload, FileArchive, Sparkles, ArrowRight, Layers, Play } from 'lucide-react';
import { SAMPLE_PROJECTS, SampleProject, generateSampleZipFile } from '../sampleZips';

interface InstructionsBannerProps {
  onFileUpload: (file: File) => void;
  lang: 'bn' | 'en';
}

export const InstructionsBanner: React.FC<InstructionsBannerProps> = ({ onFileUpload, lang }) => {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.zip') || file.type.includes('zip') || file.type.includes('compressed')) {
        onFileUpload(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
    }
  };

  const handleSelectSample = async (sample: SampleProject) => {
    const file = await generateSampleZipFile(sample);
    onFileUpload(file);
  };

  return (
    <div className="space-y-6">
      {/* Main Upload Box */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-indigo-500/20">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider border border-indigo-500/30">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                {lang === 'bn' ? 'জিপ থেকে সরাসরি অ্যাপ আনজিপ ও ভিজুয়াল ডিজাইন' : 'Unzip & Render App Design'}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {lang === 'bn' ? 'জিপ ফাইল আনজিপ করে ডিজাইন দেখুন' : 'Unzip Projects & Inspect App Design'}
              </h2>
              <p className="text-slate-300 text-sm sm:text-base">
                {lang === 'bn'
                  ? 'আপনার প্রজেক্টের .zip ফাইল সিলেক্ট করুন অথবা নিচের ডেমো জিপ ফাইল আনজিপ করে সরাসরি ডিজাইন ও কোড দেখুন।'
                  : 'Upload your .zip archive or select a preset sample project below to immediately extract files and preview the live design.'}
              </p>
            </div>

            <label className="cursor-pointer group flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 shrink-0">
              <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>{lang === 'bn' ? 'Zip ফাইল আপলোড করুন' : 'Select ZIP File'}</span>
              <input
                type="file"
                accept=".zip,application/zip,application/x-zip-compressed"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* Drop zone box */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-indigo-400/40 hover:border-indigo-400 rounded-xl p-8 text-center bg-indigo-950/30 hover:bg-indigo-900/20 transition-all cursor-pointer group"
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <FileArchive className="w-7 h-7" />
            </div>
            <p className="text-base font-semibold text-slate-200 mb-1">
              {lang === 'bn' ? 'এখানে Zip ফাইলটি ড্রপ করুন' : 'Drag & Drop your ZIP file here'}
            </p>
            <p className="text-xs text-slate-400">
              {lang === 'bn' ? 'বা ফাইল চুজ করতে উপরে ক্লিক করুন' : 'Supports .zip archives containing React, HTML, JS, CSS, JSON'}
            </p>
          </div>
        </div>
      </div>

      {/* Preset Sample Zip Cards for 1-Click Unzip & Design View */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            {lang === 'bn' ? '১-ক্লিকে আনজিপ করুন ডেমো প্রজেক্ট' : 'Preset Sample ZIP Packages'}
          </h3>
          <span className="text-xs text-slate-400">
            {lang === 'bn' ? 'আনজিপ করে সরাসরি ডিজাইন ও কোড ইন্সপেক্ট করুন' : 'Click any package to extract and preview design'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SAMPLE_PROJECTS.map((sample) => (
            <div
              key={sample.id}
              onClick={() => handleSelectSample(sample)}
              className="bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 cursor-pointer transition-all duration-200 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider border border-indigo-500/30">
                    {sample.category}
                  </span>
                  <FileArchive className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                </div>
                <h4 className="font-bold text-white text-base group-hover:text-indigo-300 transition-colors">
                  {sample.name}
                </h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {sample.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                  {Object.keys(sample.files).length} files inside
                </span>
                <button className="px-3 py-1.5 bg-indigo-600 group-hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition">
                  <Play className="w-3 h-3 fill-white" />
                  {lang === 'bn' ? 'আনজিপ ও ডিজাইন' : 'Unzip & Preview'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
