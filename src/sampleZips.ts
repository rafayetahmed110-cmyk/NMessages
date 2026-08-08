import JSZip from 'jszip';

export interface SampleProject {
  id: string;
  name: string;
  description: string;
  category: string;
  files: Record<string, string>;
}

export const SAMPLE_PROJECTS: SampleProject[] = [
  {
    id: 'ecommerce-store',
    name: 'Modern E-Commerce Storefront.zip',
    description: 'Complete React & Tailwind shopping application with product filters, cart, and checkout design.',
    category: 'E-Commerce / Shopping',
    files: {
      'package.json': JSON.stringify({
        name: 'modern-ecommerce-store',
        version: '1.0.0',
        dependencies: {
          react: '^18.2.0',
          'lucide-react': '^0.344.0',
          tailwindcss: '^3.4.0'
        }
      }, null, 2),
      'README.md': `# Modern E-Commerce Storefront\n\nA high-performance React shopping app with real-time cart, product filtering, and slick UI transitions.\n\n## Features\n- Product catalog grid\n- Interactive cart drawer\n- Category filters\n- Responsive checkout modal`,
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Aura Storefront</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 font-sans">
  <div id="root"></div>
</body>
</html>`,
      'src/App.tsx': `import React, { useState } from 'react';

export default function App() {
  const [cartCount, setCartCount] = useState(2);
  const products = [
    { id: 1, name: 'Aura Wireless Headphones', price: '$299', category: 'Audio', image: '🎧', rating: '4.9' },
    { id: 2, name: 'Minimalist Mechanical Keyboard', price: '$149', category: 'Accessories', image: '⌨️', rating: '4.8' },
    { id: 3, name: 'Ultra-wide 4K Monitor', price: '$699', category: 'Displays', image: '🖥️', rating: '5.0' },
    { id: 4, name: 'Smart Ambient Desk Lamp', price: '$89', category: 'Lighting', image: '💡', rating: '4.7' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <header className="flex justify-between items-center pb-6 border-b border-slate-800 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-indigo-400">AURA STORE</h1>
        <div className="bg-indigo-600 px-4 py-2 rounded-xl text-sm font-semibold">
          Cart ({cartCount})
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-8">
        <h2 className="text-xl font-bold mb-6">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(p => (
            <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-indigo-500/50 transition">
              <div className="text-5xl mb-4 text-center py-6 bg-slate-950 rounded-xl">{p.image}</div>
              <span className="text-xs text-indigo-400 font-semibold">{p.category}</span>
              <h3 className="font-bold text-white text-base mt-1">{p.name}</h3>
              <div className="flex justify-between items-center mt-4">
                <span className="text-lg font-extrabold text-white">{p.price}</span>
                <button onClick={() => setCartCount(c => c + 1)} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold rounded-lg transition">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}`,
      'src/components/Header.tsx': `export const Header = () => <header className="p-4 bg-slate-900">Aura Store Header</header>;`,
      'src/types.ts': `export interface Product { id: number; name: string; price: string; category: string; }`
    }
  },
  {
    id: 'kanban-board',
    name: 'SaaS Productivity & Kanban Dashboard.zip',
    description: 'Task management board with drag-and-drop cards, team stats, and activity feeds.',
    category: 'Productivity / Dashboard',
    files: {
      'package.json': JSON.stringify({
        name: 'task-flow-kanban',
        version: '2.1.0',
        dependencies: { react: '^18.2.0', 'lucide-react': '^0.344.0' }
      }, null, 2),
      'README.md': `# TaskFlow Kanban Board\n\nInteractive task management dashboard with team status and productivity analytics.`,
      'src/App.tsx': `import React from 'react';

export default function KanbanApp() {
  const columns = [
    { title: 'To Do', color: 'border-amber-500/40', count: 3, tasks: ['Design Landing Page', 'Setup OAuth Flow'] },
    { title: 'In Progress', color: 'border-blue-500/40', count: 2, tasks: ['Integrate Gemini API', 'Build ZIP extractor'] },
    { title: 'Completed', color: 'border-emerald-500/40', count: 5, tasks: ['Configure Vite Server', 'Setup Tailwind CSS'] }
  ];

  return (
    <div className="p-8 bg-slate-950 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">TaskFlow Workspace</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(col => (
          <div key={col.title} className={\`bg-slate-900 border-t-4 \${col.color} border border-slate-800 p-5 rounded-2xl\`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm text-slate-200">{col.title}</h3>
              <span className="px-2 py-0.5 bg-slate-800 text-xs rounded-full text-slate-400">{col.count}</span>
            </div>
            <div className="space-y-3">
              {col.tasks.map((task, i) => (
                <div key={i} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-slate-200 hover:border-slate-700 transition">
                  {task}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`
    }
  },
  {
    id: 'developer-portfolio',
    name: 'Developer Portfolio & Resume.zip',
    description: 'Clean personal developer portfolio with dark mode, skills matrix, and interactive project cards.',
    category: 'Portfolio / Personal',
    files: {
      'package.json': JSON.stringify({
        name: 'dev-portfolio',
        version: '1.0.0'
      }, null, 2),
      'src/App.tsx': `import React from 'react';

export default function Portfolio() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 max-w-4xl mx-auto">
      <div className="text-center py-12 border-b border-slate-800">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-3xl font-extrabold">
          JS
        </div>
        <h1 className="text-3xl font-extrabold text-white">Alex Morgan</h1>
        <p className="text-indigo-400 font-medium text-sm mt-1">Full Stack Engineer & AI Developer</p>
      </div>

      <div className="py-8">
        <h2 className="text-lg font-bold text-white mb-4">Featured Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800">
            <h3 className="font-bold text-indigo-300 text-sm">ZIP & GitHub Code Inspector</h3>
            <p className="text-xs text-slate-400 mt-2">Web app that extracts zip archives and analyzes architecture with Gemini AI.</p>
          </div>
          <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800">
            <h3 className="font-bold text-purple-300 text-sm">Real-time AI Chatbot</h3>
            <p className="text-xs text-slate-400 mt-2">Streaming conversation agent with voice and multimodal vision capabilities.</p>
          </div>
        </div>
      </div>
    </div>
  );
}`
    }
  }
];

export async function generateSampleZipFile(sample: SampleProject): Promise<File> {
  const zip = new JSZip();
  for (const [filePath, content] of Object.entries(sample.files)) {
    zip.file(filePath, content);
  }
  const blob = await zip.generateAsync({ type: 'blob' });
  return new File([blob], sample.name, { type: 'application/zip' });
}
