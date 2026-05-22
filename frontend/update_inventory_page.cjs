const fs = require('fs');

const file = 'src/pages/inventory/InventoryPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Replace <aside>
const asideRegex = new RegExp('<aside[\\s\\S]*?<\\/aside>', 'g');
content = content.replace(asideRegex, '<Sidebar />');

// Add import if missing
if (!content.includes('import Sidebar')) {
  const importRegex = new RegExp('^import', 'm');
  content = content.replace(importRegex, "import Sidebar from './Sidebar';\nimport");
}

// 2. Color replacements
const replacements = [
  { search: 'bg-blue-600', replacement: 'bg-primary' },
  { search: 'bg-[#0052cc]', replacement: 'bg-primary' },
  { search: 'bg-blue-700', replacement: 'bg-primary' },
  { search: 'text-blue-700', replacement: 'text-primary' },
  { search: 'text-blue-600', replacement: 'text-primary' },
  { search: 'text-[#0052cc]', replacement: 'text-primary' },
  { search: 'bg-blue-50/30', replacement: 'bg-secondary-container/30' },
  { search: 'bg-blue-50/50', replacement: 'bg-secondary-container/50' },
  { search: 'bg-blue-50', replacement: 'bg-secondary-container' },
  { search: 'bg-blue-100', replacement: 'bg-secondary-container' },
  { search: 'text-blue-800', replacement: 'text-on-secondary-container' },
  { search: 'border-blue-600', replacement: 'border-primary' },
  { search: 'border-[#0052cc]', replacement: 'border-primary' },
  { search: 'hover:bg-blue-700', replacement: 'hover:opacity-90' },
  { search: 'hover:bg-blue-800', replacement: 'hover:opacity-90' },
  { search: 'ring-blue-500', replacement: 'ring-primary' },
  { search: 'ring-[#0052cc]', replacement: 'ring-primary' },
  
  // Slate mappings
  { search: 'bg-slate-50', replacement: 'bg-background' },
  { search: 'bg-white', replacement: 'bg-surface-container-lowest' },
  { search: 'border-slate-200', replacement: 'border-outline-variant' },
  { search: 'border-slate-100', replacement: 'border-outline-variant/50' },
  { search: 'border-slate-300', replacement: 'border-outline' },
  
  { search: 'text-slate-900', replacement: 'text-on-surface' },
  { search: 'text-slate-800', replacement: 'text-on-surface' },
  { search: 'text-slate-700', replacement: 'text-on-surface-variant' },
  { search: 'text-slate-600', replacement: 'text-on-surface-variant' },
  { search: 'text-slate-500', replacement: 'text-outline' },
  { search: 'text-slate-400', replacement: 'text-outline-variant' },
  
  // Hover slates
  { search: 'hover:bg-slate-50', replacement: 'hover:bg-surface-container-low' },
  { search: 'hover:bg-slate-100', replacement: 'hover:bg-surface-container' },
  { search: 'hover:border-slate-300', replacement: 'hover:border-outline-variant' },
  { search: 'hover:border-blue-300', replacement: 'hover:border-primary-fixed' },
  { search: 'hover:text-blue-600', replacement: 'hover:text-primary' },
  { search: 'hover:text-blue-700', replacement: 'hover:text-primary' },
  { search: 'hover:text-slate-600', replacement: 'hover:text-on-surface-variant' },
  { search: 'hover:text-slate-700', replacement: 'hover:text-on-surface-variant' },
  { search: 'hover:text-slate-800', replacement: 'hover:text-on-surface' },
  { search: 'hover:text-slate-900', replacement: 'hover:text-on-surface' },
  
  // Missing chart color fixes
  { search: `<div className="w-full bg-blue-200 rounded-t-sm" style={{ height: '50%' }}></div>`, replacement: `<div className="w-full bg-primary/30 rounded-t-sm" style={{ height: '50%' }}></div>` },
  { search: `<div className="w-full bg-blue-300 rounded-t-sm" style={{ height: '70%' }}></div>`, replacement: `<div className="w-full bg-primary/50 rounded-t-sm" style={{ height: '70%' }}></div>` },
  { search: `<div className="w-full bg-blue-200 rounded-t-sm" style={{ height: '40%' }}></div>`, replacement: `<div className="w-full bg-primary/40 rounded-t-sm" style={{ height: '40%' }}></div>` },
  { search: `<div className="w-full bg-blue-400 rounded-t-sm" style={{ height: '90%' }}></div>`, replacement: `<div className="w-full bg-primary/80 rounded-t-sm" style={{ height: '90%' }}></div>` },
  { search: `<div className="w-full bg-blue-200 rounded-t-sm" style={{ height: '60%' }}></div>`, replacement: `<div className="w-full bg-primary/30 rounded-t-sm" style={{ height: '60%' }}></div>` },
  { search: `<div className="w-full bg-blue-300 rounded-t-sm" style={{ height: '75%' }}></div>`, replacement: `<div className="w-full bg-primary/50 rounded-t-sm" style={{ height: '75%' }}></div>` },
  { search: `<div className="w-full bg-blue-500 rounded-t-sm" style={{ height: '45%' }}></div>`, replacement: `<div className="w-full bg-primary/40 rounded-t-sm" style={{ height: '45%' }}></div>` },
  
  { search: 'border-t-blue-600', replacement: 'border-t-primary' },
  { search: 'border-r-blue-600', replacement: 'border-r-primary' },
];

replacements.forEach(r => {
  content = content.replaceAll(r.search, r.replacement);
});

// also fix the specific add button to ensure it's removed if it's there
content = content.replace(/\s*<button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary transition-colors shadow-sm">[\s\S]*?<\/button>/, '');
content = content.replace(/\s*<button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">[\s\S]*?<\/button>/, '');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed InventoryPage.tsx');
