import { HealthHistoryEntry, PredictionResult, AnalysisResult } from '../types';
import { Clock, FileText, Stethoscope, ChevronRight, Download, Trash2, ArrowLeft, Activity, Info, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface HistoryProps {
  history: HealthHistoryEntry[];
  onClear: () => void;
}

export default function History({ history, onClear }: HistoryProps) {
  const [selectedEntry, setSelectedEntry] = useState<HealthHistoryEntry | null>(null);

  if (history.length === 0) {
    return (
      <div className="bg-[#0F172A]/40 border border-slate-800 p-24 rounded-[3rem] text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-cyan-500/5 blur-3xl" />
        <div className="bg-slate-800 p-6 rounded-3xl w-fit mx-auto mb-8 shadow-xl relative z-10">
          <Clock className="w-12 h-12 text-slate-500" />
        </div>
        <h3 className="text-2xl font-black text-white mb-3 uppercase italic tracking-tighter relative z-10">Vault is Empty</h3>
        <p className="text-slate-500 max-w-sm mx-auto text-sm font-medium relative z-10">No diagnostic telemetry or symptom inferences have been recorded by the AI engine yet.</p>
      </div>
    );
  }

  if (selectedEntry) {
    const isReport = selectedEntry.type === 'Report';
    const data = selectedEntry.data as any;

    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-8"
      >
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setSelectedEntry(null)}
            className="flex items-center gap-2 text-slate-500 hover:text-white font-black text-[10px] uppercase tracking-widest transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Return to Vault
          </button>
          <div className="flex items-center gap-3">
             <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                isReport ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
              }`}>
                {isReport ? 'Diagnostic' : 'Predictive'}
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                {format(selectedEntry.timestamp, 'MMM d, p')}
              </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-12 bg-gradient-to-br from-[#111827] to-[#020617] p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-12 opacity-5">
              {isReport ? <FileText className="w-32 h-32" /> : <Stethoscope className="w-32 h-32" />}
            </div>

            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Observed Intelligence
            </h3>

            {isReport ? (
              <div className="space-y-8">
                <p className="text-xl text-slate-200 leading-relaxed italic border-l-4 border-cyan-500/40 pl-8 py-2">
                  "{data.summary}"
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                  <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800/50">
                    <p className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3" />
                      Detected Findings
                    </p>
                    <ul className="space-y-3">
                      {data.abnormalities.map((item: any, i: number) => (
                        <li key={i} className="text-xs text-slate-400 italic">
                          <span className="text-amber-500 mr-2 font-black tracking-tighter">ERR_</span>
                          {typeof item === 'string' ? item : item.finding}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800/50">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      Wellness Directives
                    </p>
                    <ul className="space-y-3">
                      {data.recommendations.slice(0, 3).map((item: string, i: number) => (
                        <li key={i} className="text-xs text-slate-300 font-medium">
                          → {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex items-center justify-between mb-4">
                   <h4 className="text-3xl font-black text-white italic tracking-tighter">
                     {data.possibleConditions[0]?.condition}
                   </h4>
                   <span className="bg-rose-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-900/40">
                     {data.riskLevel} Criticality
                   </span>
                </div>

                <div className="bg-slate-900/60 p-8 rounded-3xl border border-slate-800/50">
                   <p className="text-sm text-slate-300 leading-relaxed italic mb-6">
                     {data.actionPlan}
                   </p>
                   <div className="bg-black/20 p-5 rounded-xl border border-white/5">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Clinical Note</p>
                      <p className="text-xs text-slate-400">"{data.doctorNote}"</p>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-4 px-2">
        <h2 className="text-2xl font-black tracking-tight text-white uppercase italic">Archive <span className="text-cyan-400 not-italic">Vault</span></h2>
        <button 
          onClick={onClear}
          className="flex items-center gap-2 text-rose-500 hover:text-rose-400 font-black text-[10px] uppercase tracking-widest transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          Purge History
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {history.map((entry) => (
          <div 
            key={entry.id}
            className="group bg-[#0F172A]/40 border border-slate-800 p-8 rounded-[2.5rem] transition-all hover:bg-slate-800/40 hover:border-slate-700 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="flex items-center gap-6">
              <div className={`p-4 rounded-2xl shadow-2xl ${entry.type === 'Report' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-violet-500/10 text-violet-400 border border-violet-500/20'}`}>
                {entry.type === 'Report' ? <FileText className="w-6 h-6" /> : <Stethoscope className="w-6 h-6" />}
              </div>
              <div>
                <h4 className="font-black text-lg text-white uppercase tracking-tight">
                  {entry.type === 'Report' ? 'Diagnostic Scan' : 'Symptom Inference'}
                </h4>
                <p className="text-[10px] text-slate-500 flex items-center gap-2 font-black uppercase tracking-widest">
                  <Clock className="w-3 h-3" />
                  {format(entry.timestamp, 'PPP p')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-8">
              {entry.vitals && (
                <div className="hidden lg:flex items-center gap-8 text-[10px] font-black text-slate-500 border-x border-slate-800/50 px-10">
                  <div>
                    <span className="block text-slate-600 uppercase mb-1">Pressure</span>
                    <span className="text-white font-mono">{entry.vitals.bp}</span>
                  </div>
                  <div>
                    <span className="block text-slate-600 uppercase mb-1">Frequency</span>
                    <span className="text-white font-mono">{entry.vitals.pulse}</span>
                  </div>
                  <div>
                    <span className="block text-slate-600 uppercase mb-1">Oxygen</span>
                    <span className="text-white font-mono">{entry.vitals.oxygen}%</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedEntry(entry)}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-700"
                >
                  Observe
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
