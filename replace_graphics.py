import re

with open('src/app/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

pattern1 = re.compile(r'<div className="relative h-\[250px\].*?transition-shadow">.*?{/\* Abstract UI representation \*/}.*?<div className="flex-1 rounded-xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 p-4 flex gap-4 items-end">.*?</div>\n                                    </div>\n                                </div>', re.DOTALL)

replacement1 = """<div className="relative h-[250px] w-full rounded-2xl bg-[#fafafa] dark:bg-[#0a0a0b] border border-zinc-200 dark:border-white/10 overflow-hidden shadow-sm group-hover:border-zinc-300 dark:group-hover:border-white/20 transition-colors p-6 flex flex-col">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Facture #F-2604</div>
                                        <div className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md">PAYÉE</div>
                                    </div>
                                    <div className="space-y-4 flex-1">
                                        <div className="flex justify-between items-center border-b border-zinc-100 dark:border-white/5 pb-3">
                                            <div>
                                                <div className="text-sm font-semibold text-zinc-900 dark:text-white">Révision Complète</div>
                                                <div className="text-xs text-zinc-500 font-medium">Pièces & Main d'oeuvre</div>
                                            </div>
                                            <div className="text-sm font-bold text-zinc-900 dark:text-white">245,00 €</div>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-zinc-100 dark:border-white/5 pb-3">
                                            <div>
                                                <div className="text-sm font-semibold text-zinc-900 dark:text-white">Vidange Huile 5W30</div>
                                                <div className="text-xs text-zinc-500 font-medium">Forfait standard</div>
                                            </div>
                                            <div className="text-sm font-bold text-zinc-900 dark:text-white">89,00 €</div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <div className="text-sm font-bold text-zinc-500">Total TTC</div>
                                        <div className="text-2xl font-black text-zinc-900 dark:text-white">334,00 €</div>
                                    </div>
                                </div>"""

pattern2 = re.compile(r'<div className="mt-8 relative">.*?Tapez une plaque, trouvez le véhicule et son historique en millisecondes.*?</p>.*?<div className="mt-8 relative">.*?<div className="h-16 rounded-2xl bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 flex items-center px-4 relative overflow-hidden group-hover:border-indigo-500/30 transition-colors shadow-inner">.*?<Search className="w-5 h-5 text-zinc-400 mr-3" />.*?<div className="flex gap-1 overflow-hidden relative w-full">.*?<span className="text-zinc-900 dark:text-white font-mono font-medium tracking-wider">AB-</span>.*?<div className="w-0\.5 h-5 bg-indigo-500 animate-pulse" />.*?</div>.*?</div>', re.DOTALL)

# But wait, lines 528-539 are:
#                                 <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8 flex-1">
#                                     Tapez une plaque, trouvez le véhicule et son historique en millisecondes.
#                                 </p>
# 
#                                 <div className="mt-8 relative">
#                                     <div className="h-14 rounded-xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/10 flex items-center px-4 relative z-20 shadow-sm group-hover:border-indigo-500/30 transition-colors">

pattern2 = re.compile(r'<div className="h-16 rounded-2xl bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 flex items-center px-4 relative overflow-hidden group-hover:border-indigo-500/30 transition-colors shadow-inner">\s*<Search className="w-5 h-5 text-zinc-400 mr-3" />\s*<div className="flex gap-1 overflow-hidden relative w-full">\s*<span className="text-zinc-900 dark:text-white font-mono font-medium tracking-wider">AB-</span>\s*<div className="w-0\.5 h-5 bg-indigo-500 animate-pulse" />\s*</div>\s*</div>')

replacement2 = """<div className="mt-8 relative">
                                    <div className="h-14 rounded-xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/10 flex items-center px-4 relative z-20 shadow-sm group-hover:border-indigo-500/30 transition-colors">
                                        <Search className="w-5 h-5 text-zinc-400 mr-3" />
                                        <div className="flex gap-1 items-center w-full">
                                            <span className="text-zinc-900 dark:text-white font-mono font-bold text-lg tracking-wider">AB-</span>
                                            <div className="w-[2px] h-6 bg-zinc-900 dark:bg-white animate-pulse" />
                                        </div>
                                    </div>
                                    {/* Fake Dropdown */}
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-10 opacity-50 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 transition-all duration-300">
                                        <div className="p-3 border-b border-zinc-100 dark:border-white/5 flex items-center gap-3 hover:bg-zinc-50 dark:hover:bg-white/5 cursor-pointer transition-colors">
                                            <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-black border border-zinc-200 dark:border-white/10 flex items-center justify-center font-mono text-xs font-bold text-zinc-900 dark:text-white shadow-sm">AB</div>
                                            <div>
                                                <div className="text-sm font-bold text-zinc-900 dark:text-white">AB-123-CD</div>
                                                <div className="text-xs text-zinc-500 font-medium tracking-wide">Peugeot 208 • Jean Dupont</div>
                                            </div>
                                        </div>
                                        <div className="p-3 flex items-center gap-3 hover:bg-zinc-50 dark:hover:bg-white/5 cursor-pointer transition-colors">
                                            <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-black border border-zinc-200 dark:border-white/10 flex items-center justify-center font-mono text-xs font-bold text-zinc-900 dark:text-white shadow-sm">EF</div>
                                            <div>
                                                <div className="text-sm font-bold text-zinc-900 dark:text-white">EF-456-GH</div>
                                                <div className="text-xs text-zinc-500 font-medium tracking-wide">Renault Clio • Marie Martin</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>"""

new_text, count1 = re.subn(pattern1, replacement1, text)
print(f"Replaced {count1} times for pattern 1")

new_text, count2 = re.subn(pattern2, replacement2, new_text)
print(f"Replaced {count2} times for pattern 2")

if count1 > 0 or count2 > 0:
    with open('src/app/page.tsx', 'w', encoding='utf-8') as f:
        f.write(new_text)
