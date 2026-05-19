import React, { useState } from 'react';
import { FileUp, Loader2, CheckCircle, AlertCircle, Download, FileText, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { extractTextFromPDF } from '../lib/pdf-utils';
import { AnalysisResult } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface AnalyzerProps {
  onResult: (result: AnalysisResult) => void;
}

export default function Analyzer({ onResult }: AnalyzerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const text = await extractTextFromPDF(file);
      const response = await fetch('/api/analyze-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportText: text }),
      });

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();
      setResult(data);
      onResult(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const content = document.getElementById('report-result');
    if (!content) return;

    const canvas = await html2canvas(content, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    doc.save(`HealAI_Summary_${Date.now()}.pdf`);
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-[#111827] to-[#020617] border border-slate-800 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
        
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 relative z-10 text-white">
          <FileText className="w-6 h-6 text-cyan-400" />
          Medical Report Intelligence
        </h2>

        {!result ? (
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl p-16 transition-all hover:border-cyan-500/40 hover:bg-slate-900/40 relative z-10">
            <input
              type="file"
              id="pdf-upload"
              className="hidden"
              accept=".pdf"
              onChange={handleFileChange}
            />
            <label 
              htmlFor="pdf-upload"
              className="flex flex-col items-center cursor-pointer group"
            >
              <div className="bg-slate-800 p-5 rounded-2xl mb-6 shadow-xl group-hover:scale-110 transition-transform">
                <FileUp className="w-10 h-10 text-cyan-400" />
              </div>
              <p className="font-bold text-xl text-white">
                {file ? file.name : "Deploy Report (PDF)"}
              </p>
              <p className="text-xs text-slate-500 mt-2 text-center uppercase tracking-[0.2em] font-medium">
                Deep Analysis Engine Ready
              </p>
            </label>

            {file && !loading && (
              <button
                onClick={handleAnalyze}
                className="mt-10 bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-10 py-3.5 rounded-xl font-black uppercase tracking-widest text-xs transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              >
                Execute AI Scan
              </button>
            )}

            {loading && (
              <div className="mt-10 flex flex-col items-center gap-4 text-cyan-400">
                <Loader2 className="w-10 h-10 animate-spin" />
                <p className="text-xs font-bold uppercase tracking-[0.3em]">Decoding Patient Data...</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-between items-center mb-8 relative z-10">
            <button 
              onClick={() => setResult(null)}
              className="text-slate-500 hover:text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2 group transition-colors"
            >
              <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Reset Scanner
            </button>
            <button 
              onClick={downloadPDF}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-700"
            >
              <Download className="w-4 h-4" />
              Export Summary
            </button>
          </div>
        )}

        {error && (
          <div className="mt-6 p-5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl flex items-center gap-3 relative z-10">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-xs font-bold uppercase tracking-wider">{error}</p>
          </div>
        )}
      </div>

      {result && (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          id="report-result"
          className="space-y-8"
        >
          {/* Header Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-[#0F172A]/40 p-8 rounded-[2rem] border border-slate-800 shadow-xl md:col-span-2">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Latest Narrative
              </h3>
              <p className="text-slate-300 leading-relaxed italic text-lg border-l-4 border-cyan-500/40 pl-6 py-2">
                "{result.summary}"
              </p>
            </div>

            <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 p-8 rounded-[2rem] text-white shadow-2xl flex flex-col justify-between border border-indigo-500/30 relative overflow-hidden">
               <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div>
                <p className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Risk Evaluation</p>
                <h4 className="text-4xl font-black italic tracking-tighter">{result.riskProfile.level}</h4>
              </div>
              <p className="text-xs text-indigo-100/80 mt-8 leading-relaxed font-medium">
                {result.riskProfile.description}
              </p>
            </div>
          </div>

          {/* Tables & Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Parameters Table */}
            <div className="lg:col-span-7 bg-[#0F172A]/40 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl overflow-hidden">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400 mb-6">Telemetry Values</h3>
              <div className="overflow-x-auto -mx-2 px-2">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left border-b border-slate-800/50 text-slate-500 uppercase tracking-widest font-black text-[9px]">
                      <th className="pb-4 px-2">Metric</th>
                      <th className="pb-4 px-2">Result</th>
                      <th className="pb-4 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.values.map((v, i) => (
                      <tr key={i} className="border-b border-slate-800/30 hover:bg-slate-800/40 transition-colors group">
                        <td className="py-4 px-2 font-bold text-slate-200 group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{v.parameter}</td>
                        <td className="py-4 px-2 text-slate-400">
                          <span className="font-mono text-white text-sm font-bold">{v.result}</span> {v.unit}
                        </td>
                        <td className="py-4 px-2">
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                            v.status === 'Normal' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 
                            v.status === 'Abnormal' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 
                            'bg-rose-500/10 border-rose-500/20 text-rose-400'
                          }`}>
                            {v.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Viz Chart */}
            <div className="lg:col-span-5 bg-[#0F172A]/40 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400 mb-8">Visualization Index</h3>
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={result.charts.data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis 
                      dataKey="label" 
                      fontSize={10} 
                      tick={{ fill: '#64748b' }} 
                      axisLine={false} 
                      tickLine={false}
                    />
                    <YAxis fontSize={10} tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}
                      cursor={{ fill: '#1e293b' }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={32}>
                      {result.charts.data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || '#06b6d4'} className="drop-shadow-[0_0_10px_rgba(6,182,212,0.2)]" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#0F172A]/40 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-400 mb-6 flex items-center gap-3">
                <AlertCircle className="w-4 h-4" />
                Critical Context
              </h3>
              <ul className="space-y-4">
                {result.abnormalities.map((item, i) => (
                  <li key={i} className="flex flex-col gap-1 text-xs font-medium bg-slate-900/40 p-4 rounded-xl border border-slate-800/50 italic">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-amber-500 font-black tracking-tighter shrink-0">ERR_</span>
                      <span className="text-slate-200 font-bold uppercase tracking-tight">
                        {typeof item === 'string' ? item : item.finding}
                      </span>
                    </div>
                    {typeof item !== 'string' && (
                      <p className="text-slate-500 pl-10 not-italic leading-relaxed">
                        {item.meaning}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#0F172A]/40 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400 mb-6 flex items-center gap-3">
                <Activity className="w-4 h-4" />
                Clinical Workflow
              </h3>
              <ul className="space-y-4">
                {result.recommendations.map((item, i) => (
                  <li key={i} className="flex gap-4 text-xs font-bold text-slate-200 bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10">
                    <span className="text-emerald-500">→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-slate-900/80 p-5 rounded-2xl text-center border-l-8 border-rose-600 backdrop-blur-sm">
            <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase mb-1">Warning: Deep GenAI Inference</p>
            <p className="text-sm font-medium text-slate-200 italic">
               "{result.note}"
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
