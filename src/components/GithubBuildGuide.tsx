import React from 'react';
import {
  FolderGit2,
  Terminal,
  ShieldCheck,
  Smartphone,
  Download,
  CheckCircle2,
  ExternalLink,
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';

interface GithubBuildGuideProps {
  lang: 'bn' | 'en';
}

export const GithubBuildGuide: React.FC<GithubBuildGuideProps> = ({ lang }) => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-3 bg-purple-600/20 text-purple-400 rounded-2xl border border-purple-500/30">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {lang === 'bn' ? 'গিটহাব আপলোড ও গিটহাব অ্যাকশনস নির্দেশিকা' : 'GitHub Repository & Automated APK Build Guide'}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'bn' ? 'কীভাবে কোড গিটহাবে পুশ করবেন এবং এপিকে সংকলন করবেন' : 'How to push code to GitHub and build release APK artifacts'}
            </p>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* STEP 1: GitHub Push */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 font-bold text-xs text-indigo-400 uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">1</span>
              <span>{lang === 'bn' ? 'গিটহাব রেপোতে পুশ করুন' : 'Push Repository to GitHub'}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {lang === 'bn'
                ? 'প্রজেক্টটি ডাউনলোড করে আপনার গিটহাব অ্যাকাউন্টে আপলোড করুন:'
                : 'Upload the downloaded NMessages repository directly to GitHub:'}
            </p>
            <div className="bg-slate-900 p-3 rounded-xl font-mono text-[11px] text-slate-200 space-y-1">
              <div>git init</div>
              <div>git add .</div>
              <div>git commit -m "Initial commit: NMessages Default SMS App"</div>
              <div>git remote add origin https://github.com/USERNAME/NMessages.git</div>
              <div>git push -u origin main</div>
            </div>
          </div>

          {/* STEP 2: GitHub Actions Automated APK */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 font-bold text-xs text-purple-400 uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">2</span>
              <span>{lang === 'bn' ? 'গিটহাব অ্যাকশনস এপিকে বিল্ড' : 'Automated GitHub Actions Build'}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {lang === 'bn'
                ? '.github/workflows/android.yml ফাইলটি সক্রিয় আছে। প্রতিটি পুশে গিটহাব অ্যাকশনস স্বয়ংক্রিয়ভাবে APK বিল্ড তৈরি করবে।'
                : 'The included `.github/workflows/android.yml` automatically triggers on push to build release APKs.'}
            </p>
            <div className="bg-slate-900 p-3 rounded-xl text-xs text-slate-300 space-y-1.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Go to GitHub Repository -&gt; Actions tab</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Select "NMessages Android APK Build"</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Download "NMessages-Release-APK" from Artifacts</span>
              </div>
            </div>
          </div>

          {/* STEP 3: Local Command Build */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 font-bold text-xs text-emerald-400 uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-slate-950 flex items-center justify-center text-[10px]">3</span>
              <span>{lang === 'bn' ? 'লোকাল কমান্ড দিয়ে APK বিল্ড' : 'Local Terminal APK Build'}</span>
            </div>
            <p className="text-xs text-slate-300">
              {lang === 'bn' ? 'যদি আপনার পিসিতে Flutter SDK থাকে, টার্মিনালে এই কমান্ডগুলি চালান:' : 'Build directly on your workstation terminal with Flutter SDK:'}
            </p>
            <div className="bg-slate-900 p-3 rounded-xl font-mono text-[11px] text-slate-200 space-y-1">
              <div>cd n_messages</div>
              <div>flutter pub get</div>
              <div>flutter build apk --release</div>
            </div>
          </div>

          {/* STEP 4: Default SMS Setup on Phone */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 font-bold text-xs text-amber-400 uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px]">4</span>
              <span>{lang === 'bn' ? 'ফোনে ডিফল্ট এসএমএস অ্যাপ করুন' : 'Default SMS App Setup on Device'}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {lang === 'bn'
                ? 'এপিকে ফোনে ইন্সটল করার পর "Set as Default SMS App" প্রম্পটে অনুমোদন দিন।'
                : 'After installing APK on your Android phone, grant Default SMS Role when prompted.'}
            </p>
            <div className="bg-slate-900 p-3 rounded-xl text-xs text-slate-300 space-y-1">
              <div>Settings -&gt; Apps -&gt; Default Apps -&gt; SMS App -&gt; Select NMessages</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
