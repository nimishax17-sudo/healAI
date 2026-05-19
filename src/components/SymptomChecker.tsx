import React, { useState } from 'react';
import { Stethoscope, Loader2, AlertCircle, Info, Utensils, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { PredictionResult, VitalData } from '../types';

interface SymptomCheckerProps {
  vitals: VitalData;
  onPrediction: (result: PredictionResult) => void;
  onUpdateVitals: (vitals: VitalData) => void;
}

export default function SymptomChecker({ vitals, onPrediction, onUpdateVitals }: SymptomCheckerProps) {
  const [symptoms, setSymptoms] = useState("");
  const [familyHistory, setFamilyHistory] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/predict-disease', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms, vitals, familyHistory }),
      });

      if (!response.ok) throw new Error('Prediction failed');

      const data = await response.json();
      setResult(data);
      onPrediction(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-tr from-[#111827] to-[#1e1b4b] border border-slate-700/50 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-violet-400">
          <Stethoscope className="w-7 h-7" />
          Predictive Symptom Engine
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-500 mb-3 uppercase tracking-[0.2em]">
                Ingest Symptoms
              </label>
              <textarea
                className="w-full bg-[#020617]/60 border border-slate-800 rounded-2xl p-5 outline-none focus:ring-1 focus:ring-violet-500/50 transition-all min-h-[160px] text-slate-200 placeholder:text-slate-700 text-sm"
                placeholder="Declare current physiological status... (e.g. Sharp pain in lower abdomen, persistent fatigue)"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 mb-3 uppercase tracking-[0.2em]">
                Genetic/Family Context (Optional)
              </label>
              <textarea
                className="w-full bg-[#020617]/60 border border-slate-800 rounded-2xl p-4 outline-none focus:ring-1 focus:ring-violet-500/50 transition-all min-h-[100px] text-slate-200 placeholder:text-slate-700 text-xs italic"
                placeholder="Parents with history of Cardiac Strain / Metabolic disorders..."
                value={familyHistory}
                onChange={(e) => setFamilyHistory(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col justify-between">
            <div className="bg-slate-900/60 p-6 rounded-[2rem] border border-slate-800/50 backdrop-blur-sm">
              <h4 className="text-[9px] font-black text-violet-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Live Context Injected
              </h4>
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <div className="group">
                  <span className="text-[10px] text-slate-500 block mb-1 font-bold group-hover:text-cyan-400 transition-colors uppercase">BP Network</span>
                  <input 
                    type="text" 
                    value={vitals.bp} 
                    onChange={(e) => onUpdateVitals({...vitals, bp: e.target.value})}
                    className="text-xl font-black text-white tracking-tighter bg-transparent border-none outline-none p-0 w-full focus:ring-0"
                  />
                </div>
                <div className="group">
                  <span className="text-[10px] text-slate-500 block mb-1 font-bold group-hover:text-rose-400 transition-colors uppercase">HR Frequency</span>
                  <div className="flex items-center gap-1">
                    <input 
                      type="text" 
                      value={vitals.pulse} 
                      onChange={(e) => onUpdateVitals({...vitals, pulse: e.target.value})}
                      className="text-xl font-black text-white tracking-tighter bg-transparent border-none outline-none p-0 w-20 focus:ring-0"
                    />
                    <span className="text-[10px] text-slate-600 font-bold uppercase">BPM</span>
                  </div>
                </div>
                <div className="group">
                  <span className="text-[10px] text-slate-500 block mb-1 font-bold group-hover:text-emerald-400 transition-colors uppercase">SpO2 Level</span>
                  <div className="flex items-center gap-1">
                    <input 
                      type="text" 
                      value={vitals.oxygen} 
                      onChange={(e) => onUpdateVitals({...vitals, oxygen: e.target.value})}
                      className="text-xl font-black text-white tracking-tighter bg-transparent border-none outline-none p-0 w-16 focus:ring-0"
                    />
                    <span className="text-[10px] text-slate-600 font-bold uppercase">%</span>
                  </div>
                </div>
                <div className="group">
                  <span className="text-[10px] text-slate-500 block mb-1 font-bold group-hover:text-violet-400 transition-colors uppercase">Sleep Cycle</span>
                  <div className="flex items-center gap-1">
                    <input 
                      type="text" 
                      value={vitals.sleep} 
                      onChange={(e) => onUpdateVitals({...vitals, sleep: e.target.value})}
                      className="text-xl font-black text-white tracking-tighter bg-transparent border-none outline-none p-0 w-16 focus:ring-0"
                    />
                    <span className="text-[10px] text-slate-600 font-bold uppercase">HRS</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handlePredict}
              disabled={loading || !symptoms.trim()}
              className="mt-10 w-full bg-violet-600 hover:bg-violet-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white h-16 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-violet-900/20 transition-all transform active:scale-95 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Processing Probability...
                </>
              ) : (
                <>
                  Analyze Probability
                  <ShieldAlert className="w-5 h-5 text-violet-300" />
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-8 p-5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
          </div>
        )}
      </div>

      {result && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          {/* Possible Conditions */}
          <div className="lg:col-span-12 bg-[#0F172A]/40 p-10 rounded-[2.5rem] border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-300">Diagnostic Probabilities</h3>
              <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.25em] ${
                result.riskLevel === 'Emergency' ? 'bg-rose-600 text-white animate-pulse shadow-[0_0_20px_rgba(225,29,72,0.5)]' :
                result.riskLevel === 'Warning' ? 'bg-amber-500 text-slate-900' :
                'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'
              }`}>
                {result.riskLevel} Criticality
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {result.possibleConditions.map((c, i) => (
                <div key={i} className="bg-black/40 p-6 rounded-2xl border border-slate-800/50 hover:border-violet-500/30 transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-black text-lg text-white group-hover:text-violet-400 transition-colors">{c.condition}</h4>
                    <span className={`text-[9px] px-2 py-1 rounded-md font-black uppercase tracking-tighter ${
                      c.probability === 'High' ? 'text-rose-400 bg-rose-400/10' :
                      c.probability === 'Medium' ? 'text-amber-400 bg-amber-400/10' :
                      'text-emerald-400 bg-emerald-400/10'
                    }`}>
                      {c.probability} Confidence
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 italic leading-relaxed">"{c.reason}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Plan */}
          <div className="lg:col-span-5 bg-gradient-to-br from-rose-600 to-rose-900 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden border border-rose-500/30">
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <ShieldAlert className="w-32 h-32" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
              Action Protocol
            </h3>
            <p className="text-rose-100 leading-relaxed mb-10 font-bold text-lg italic">
              {result.actionPlan}
            </p>
            <div className="bg-black/20 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
              <p className="text-[9px] font-black text-rose-200 uppercase tracking-[0.3em] mb-2 text-center">AI Medical Advisory</p>
              <p className="text-xs italic text-center text-rose-100 leading-snug">"{result.doctorNote}"</p>
            </div>
          </div>

          {/* Diet & Wellness */}
          <div className="lg:col-span-7 bg-[#0F172A]/40 p-10 rounded-[2.5rem] border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-400 mb-8 flex items-center gap-3">
                <Utensils className="w-5 h-5" />
                Dietary Correction
              </h3>
              <p className="text-slate-300 leading-relaxed text-sm bg-slate-900/40 p-6 rounded-2xl border border-slate-800 italic">
                {result.dietAdvice}
              </p>
            </div>
            <div className="mt-10 pt-8 border-t border-slate-800/50 text-center">
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2">Patient Consciousness</p>
              <p className="text-xs font-bold text-slate-400 italic">
                "System Warning: Do not dismiss physiological signals. Your body is reporting an anomaly."
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
