const fs = require('fs');

const path = 'src/pages/Admin.tsx';
let text = fs.readFileSync(path, 'utf8');

// Cards
text = text.replaceAll('bg-white p-6 rounded-2xl shadow-sm border border-gray-100', 'bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60');

// Table headers
text = text.replaceAll('border-b border-gray-100 text-gray-500 text-sm', 'border-b border-gray-100 text-gray-400 text-sm');
text = text.replaceAll('<th className="pb-3 font-medium">', '<th className="pb-4 font-medium px-2">');

// Table rows
text = text.replaceAll('className="border-b border-gray-50"', 'className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors group"');
text = text.replaceAll('<td className="py-4">', '<td className="py-4 px-2">');
text = text.replaceAll('<td className="py-4 text-sm">', '<td className="py-4 px-2 text-sm">');
text = text.replaceAll('<td className="py-4 text-sm" dir="ltr">', '<td className="py-4 px-2 text-sm" dir="ltr">');

// Inputs and Selects
text = text.replaceAll('w-full p-3 bg-gray-50 border border-gray-200 rounded-xl', 'w-full p-3.5 bg-slate-50/50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all');

// Primary Buttons
text = text.replaceAll('w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700', 'w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all outline-none border border-transparent');

// Section Labels
text = text.replaceAll('className="text-xl font-bold mb-6 flex', 'className="text-xl font-bold mb-8 flex');
text = text.replaceAll('className="text-xl font-bold mb-6"', 'className="text-xl font-bold mb-8"');

// Price text
text = text.replaceAll('<td className="py-4 font-mono font-bold">', '<td className="py-4 px-2 font-mono font-bold text-indigo-600">');
text = text.replaceAll('<td className="py-4 font-mono text-xs text-gray-500">', '<td className="py-4 px-2 font-mono text-xs text-gray-400 font-medium">');

fs.writeFileSync(path, text, 'utf8');
console.log('Styles updated in Admin.tsx');
