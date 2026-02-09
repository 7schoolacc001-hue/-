
import React, { useState, useEffect, useCallback } from 'react';
import { HabitCategory, LogEntry, RiskPrediction, CATEGORY_CONFIG } from './types';
import { predictOutcome } from './services/geminiService';
import HabitCard from './components/HabitCard';

const categories: HabitCategory[] = ['finance', 'sleep', 'screen', 'food', 'driving'];

const App: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const saved = localStorage.getItem('prewarn_logs');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [predictions, setPredictions] = useState<Record<HabitCategory, RiskPrediction | null>>({
    finance: null, sleep: null, screen: null, food: null, driving: null
  });
  
  const [loadingCategory, setLoadingCategory] = useState<HabitCategory | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [inputNote, setInputNote] = useState('');

  useEffect(() => {
    localStorage.setItem('prewarn_logs', JSON.stringify(logs));
  }, [logs]);

  // Initial predictions for categories with data
  useEffect(() => {
    categories.forEach(cat => {
      const catLogs = logs.filter(l => l.category === cat);
      if (catLogs.length > 0 && !predictions[cat]) {
        triggerPrediction(cat, logs);
      }
    });
  }, []);

  const triggerPrediction = useCallback(async (cat: HabitCategory, currentLogs: LogEntry[]) => {
    setLoadingCategory(cat);
    const result = await predictOutcome(cat, currentLogs);
    setPredictions(prev => ({ ...prev, [cat]: result }));
    setLoadingCategory(null);
  }, []);

  const addLog = async () => {
    if (!selectedCategory || !inputValue) return;
    
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      category: selectedCategory,
      value: Number(inputValue),
      note: inputNote,
      timestamp: Date.now()
    };

    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    setInputValue('');
    setInputNote('');
    
    await triggerPrediction(selectedCategory, updatedLogs);
    setSelectedCategory(null);
  };

  const deleteLog = (id: string) => {
    setLogs(prev => prev.filter(l => l.id !== id));
  };

  // Explicitly cast and filter predictions to avoid "unknown" type errors in iteration
  const activePredictions = (Object.values(predictions) as (RiskPrediction | null)[])
    .filter((p): p is RiskPrediction => p !== null && p.riskLevel !== 'safe');

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto flex flex-col gap-6 pb-32">
      {/* Background Ambience */}
      <div className="fixed top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>

      <header className="flex flex-col gap-1 mt-6">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 glow-effect shadow-[0_0_15px_rgba(239,68,68,0.6)]"></div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Prewarn Dashboard</h1>
        </div>
        <p className="text-slate-400 text-xs">نظام استباقي لمنع الأخطاء قبل وقوعها.</p>
      </header>

      {/* Grid of Habit Cards */}
      <section className="grid grid-cols-2 gap-4">
        {categories.map(cat => (
          <HabitCard 
            key={cat} 
            category={cat} 
            prediction={predictions[cat]}
            loading={loadingCategory === cat}
            onClick={() => setSelectedCategory(cat)}
          />
        ))}
      </section>

      {/* Active Predictive Alerts */}
      <section className="flex flex-col gap-4">
        <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] border-b border-white/5 pb-2">توقعات الذكاء الاصطناعي</h2>
        {activePredictions.length === 0 ? (
          <div className="dashboard-card p-8 text-center text-slate-500 border-dashed border-2 border-white/5">
            <p className="text-sm">لا توجد بوادر خطر حالية. عاداتك تبدو مستقرة.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activePredictions.map(p => (
              <div key={p.category} className={`p-4 rounded-2xl border-r-4 backdrop-blur-md animate-in slide-in-from-left-4 ${p.riskLevel === 'critical' ? 'bg-red-500/5 border-red-500' : 'bg-amber-500/5 border-amber-500'}`}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{CATEGORY_CONFIG[p.category].icon}</span>
                    <span className="font-bold text-sm text-white">{CATEGORY_CONFIG[p.category].label}</span>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${p.riskLevel === 'critical' ? 'bg-red-500 text-white' : 'bg-amber-500 text-black'}`}>
                    {p.riskLevel === 'critical' ? 'حرج' : 'تحذير'}
                  </span>
                </div>
                <p className="text-sm text-slate-200 mb-3">{p.predictionText}</p>
                <div className="bg-black/20 p-3 rounded-xl border border-white/5 space-y-2">
                  <div className="text-[11px]"><span className="opacity-50">النصيحة: </span><span className="text-emerald-400 font-medium">{p.advice}</span></div>
                  <div className="text-[11px]"><span className="opacity-50">النتيجة المحتملة: </span><span className="text-red-400/80 italic">{p.projectedOutcome}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Log History */}
      <section className="flex flex-col gap-3">
        <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">آخر النشاطات</h2>
        <div className="space-y-2">
          {logs.slice(0, 5).map(log => (
            <div key={log.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors group">
              <div className="flex items-center gap-3">
                <span className="text-lg">{CATEGORY_CONFIG[log.category].icon}</span>
                <div>
                  <div className="text-xs font-bold text-white">{log.value} {CATEGORY_CONFIG[log.category].unit}</div>
                  <div className="text-[10px] text-slate-500">{log.note || 'سجل نشاط'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[9px] text-slate-600">{new Date(log.timestamp).toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'})}</span>
                <button onClick={() => deleteLog(log.id)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-500 transition-all">✕</button>
              </div>
            </div>
          ))}
          {logs.length === 0 && <p className="text-center text-[10px] text-slate-600 py-4 italic">ابدأ بتسجيل أول نشاط لك لتحليل عاداتك.</p>}
        </div>
      </section>

      {/* Input Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-4">
          <div className="dashboard-card w-full max-w-md p-8 animate-in slide-in-from-bottom-10 border-white/20">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{CATEGORY_CONFIG[selectedCategory].icon}</span>
                <h3 className="text-xl font-bold text-white">{CATEGORY_CONFIG[selectedCategory].label}</h3>
              </div>
              <button onClick={() => setSelectedCategory(null)} className="p-2 hover:bg-white/5 rounded-full text-slate-400">✕</button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">{CATEGORY_CONFIG[selectedCategory].placeholder}</label>
                <div className="relative">
                  <input 
                    type="number"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    autoFocus
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-2xl font-bold text-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    placeholder="0.0"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">{CATEGORY_CONFIG[selectedCategory].unit}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">إضافة ملاحظة (اختياري)</label>
                <input 
                  type="text"
                  value={inputNote}
                  onChange={e => setInputNote(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-indigo-500 transition-all text-sm"
                  placeholder="ما الذي حدث؟"
                />
              </div>
              <button 
                onClick={addLog}
                disabled={!inputValue}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 disabled:hover:bg-indigo-600 py-5 rounded-2xl font-bold text-white shadow-2xl shadow-indigo-500/30 transition-all active:scale-[0.98] mt-4"
              >
                تحليل المنحنى الآن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
