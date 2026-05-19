import { useState, useEffect, useRef } from 'react';
import { 
  HeartPulse, 
  LayoutDashboard, 
  FileSearch, 
  Stethoscope, 
  History as HistoryIcon,
  Moon,
  Sun,
  Activity,
  User,
  ShieldAlert,
  Download,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useHealthStorage } from './hooks/useHealthStorage';
import VitalsCard from './components/VitalsCard';
import Analyzer from './components/Analyzer';
import SymptomChecker from './components/SymptomChecker';
import History from './components/History';
import Auth from './components/Auth';
import EmergencyAlert from './components/EmergencyAlert';
import { AnalysisResult, PredictionResult } from './types';
import { auth, onAuthStateChanged, FirebaseUser, signOut } from './lib/firebase';
import { format } from 'date-fns';
import jsPDF from 'jspdf';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analyzer' | 'symptoms' | 'history'>('dashboard');
  const [isDark, setIsDark] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const { history, vitals, saveEntry, updateVitals, clearHistory, loading: syncLoading } = useHealthStorage(user?.uid || null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleAnalysisResult = (result: AnalysisResult) => {
    saveEntry('Report', result, vitals);
    if (result.riskProfile.level === 'High') {
      setAlertMessage("Critical findings detected in your medical report. Please consult a doctor immediately.");
      setShowAlert(true);
    }
  };

  const handlePredictionResult = (result: PredictionResult) => {
    saveEntry('Prediction', result, vitals);
    if (result.emergencyAlert) {
      setAlertMessage(result.actionPlan);
      setShowAlert(true);
    }
  };

  const downloadHealthSummary = async () => {
    if (history.length === 0) {
      alert("No medical history available. Please perform a diagnostic scan or symptom check first.");
      return;
    }
    
    setIsDownloading(true);
    const latest = history[0];
    const data = latest.data as any;
    const isReport = latest.type === 'Report';

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Header Background
      doc.setFillColor(11, 15, 26);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("HealAI", 20, 25);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("RECOVERY ENGINE • DIAGNOSTIC SUMMARY", pageWidth - 100, 25);
      
      // User Info
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`Patient: Nimisha`, 20, 55);
      doc.text(`Identifier: HEAL-X92`, 20, 60);
      doc.setFont("helvetica", "normal");
      doc.text(`Log Sequence: ${format(latest.timestamp, 'PPP p')}`, pageWidth - 90, 55);
      
      doc.setDrawColor(226, 232, 240);
      doc.line(20, 65, pageWidth - 20, 65);

      // Stats Banner
      doc.setFillColor(248, 250, 252);
      doc.rect(20, 70, pageWidth - 40, 15, 'F');
      doc.setTextColor(11, 15, 26);
      doc.setFont("helvetica", "bold");
      doc.text(`BP: ${latest.vitals.bp} | HR: ${latest.vitals.pulse} BPM | O2: ${latest.vitals.oxygen}% | SLEEP: ${latest.vitals.sleep}H`, 30, 79);

      let y = 100;

      if (isReport) {
        doc.setTextColor(11, 15, 26);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("DIAGNOSTIC ANALYSIS", 20, y);
        y += 10;
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        const summaryLines = doc.splitTextToSize(`"${data.summary}"`, pageWidth - 40);
        doc.text(summaryLines, 20, y);
        y += (summaryLines.length * 5) + 15;

        doc.setFont("helvetica", "bold");
        doc.text("CRITICAL FINDINGS", 20, y);
        y += 8;
        doc.setFont("helvetica", "normal");
        data.abnormalities.forEach((item: any) => {
          const finding = typeof item === 'string' ? item : item.finding;
          const meaning = typeof item === 'string' ? '' : ` - ${item.meaning}`;
          const text = `• ${finding}${meaning}`;
          const lines = doc.splitTextToSize(text, pageWidth - 40);
          doc.text(lines, 20, y);
          y += (lines.length * 5) + 2;
        });
        
        y += 10;
        doc.setFont("helvetica", "bold");
        doc.text("RISK EVALUATION:", 20, y);
        doc.setFont("helvetica", "bold");
        const riskColor = data.riskProfile.level === 'High' ? [225, 29, 72] : [16, 185, 129];
        doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
        doc.text(`${data.riskProfile.level} LEVEL`, 65, y);
      } else {
        doc.setTextColor(11, 15, 26);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("PREDICTIVE INFERENCE", 20, y);
        y += 10;
        
        doc.setFontSize(14);
        doc.text(data.possibleConditions[0]?.condition || "Condition Analysis", 20, y);
        y += 10;
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("ACTION PROTOCOL", 20, y);
        y += 8;
        doc.setFont("helvetica", "normal");
        const actionLines = doc.splitTextToSize(data.actionPlan, pageWidth - 40);
        doc.text(actionLines, 20, y);
        y += (actionLines.length * 5) + 15;

        doc.setFont("helvetica", "italic");
        doc.setTextColor(100, 116, 139);
        const noteLines = doc.splitTextToSize(`AI Advisory: "${data.doctorNote}"`, pageWidth - 40);
        doc.text(noteLines, 20, y);
      }

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("Generated by the HealAI Autonomous Diagnostic Engine.", 20, 285);
      doc.text("NOT A SUBSTITUTE FOR PROFESSIONAL MEDICAL ADVICE.", pageWidth - 100, 285);

      doc.save(`HealAI_Summary_${format(latest.timestamp, 'yyyyMMdd_HHmm')}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Encryption or rendering error occurred during PDF generation.");
    } finally {
      setIsDownloading(false);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analyzer', label: 'Report AI', icon: FileSearch },
    { id: 'symptoms', label: 'Symptoms', icon: Stethoscope },
    { id: 'history', label: 'History', icon: HistoryIcon },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 transition-colors duration-300 font-sans selection:bg-cyan-500/30">
      <EmergencyAlert 
        isVisible={showAlert} 
        onClose={() => setShowAlert(false)} 
        message={alertMessage} 
      />

      {authLoading ? (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center">
          <Activity className="w-10 h-10 text-cyan-500 animate-pulse" />
        </div>
      ) : !user ? (
        <Auth />
      ) : (
        <>
          {/* Sidebar Navigation */}
          <nav className="fixed bottom-0 left-0 right-0 lg:left-0 lg:top-0 lg:bottom-0 lg:w-72 bg-[#0B0F1A] border-t lg:border-t-0 lg:border-r border-slate-800 z-40 transition-all">
        <div className="p-8 hidden lg:flex items-center gap-3">
          <div className="bg-cyan-500 p-2.5 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <HeartPulse className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white italic">Heal<span className="text-cyan-400 not-italic">AI</span></h1>
        </div>

        <div className="flex lg:flex-col lg:px-4 py-2 lg:gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 lg:flex-none flex flex-col lg:flex-row items-center gap-3 px-4 py-3 lg:py-3.5 rounded-xl transition-all relative group ${
                activeTab === tab.id 
                ? 'bg-slate-800/50 text-cyan-400 border-l-2 border-cyan-400 shadow-[inset_0_0_20px_rgba(30,41,59,0.5)]' 
                : 'text-slate-500 hover:bg-slate-800/30 hover:text-slate-300'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'stroke-[2px]' : 'stroke-[1.5px]'}`} />
              <span className="text-[10px] lg:text-sm uppercase tracking-widest lg:capitalize lg:tracking-normal font-bold lg:font-medium">
                {tab.label}
              </span>
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyan-400 rounded-l-full hidden lg:block"
                />
              )}
            </button>
          ))}
        </div>

        {/* User Status / Logout */}
        <div className="absolute bottom-10 left-6 right-6 hidden lg:block">
          <div className="p-6 bg-slate-900/40 rounded-[2rem] border border-slate-800/60 backdrop-blur-md shadow-xl group/logout">
             <div className="flex items-center gap-3 mb-5 px-1">
               <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 border-2 border-slate-700 shadow-inner">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-cyan-500/10">
                      <User className="w-5 h-5 text-cyan-400" />
                    </div>
                  )}
               </div>
               <div className="overflow-hidden">
                 <p className="text-xs text-white font-black uppercase truncate tracking-tight">{user?.displayName || 'User'}</p>
                 <p className="text-[9px] text-slate-500 font-bold truncate tracking-[0.1em]">{user?.email}</p>
               </div>
             </div>
             <button 
               onClick={() => signOut(auth)}
               className="w-full py-3 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/50 hover:border-rose-500/30 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group"
             >
               <LogOut className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
               Log Out
             </button>
          </div>
        </div>

      </nav>

      {/* Main Content Area */}
      <main className="lg:ml-72 p-6 pb-32 lg:pb-12 max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between h-20 border-b border-slate-800/50 mb-10 sticky top-0 bg-[#020617]/80 backdrop-blur-md z-30 px-2 lg:-mx-6 lg:px-8">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-3">
              {user?.displayName || 'Authorized User'} <span className="text-slate-500 text-xs font-normal italic ml-2">UID: {user?.uid.slice(0, 6)}...</span>
            </h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              Core Vitals Stable • {syncLoading ? 'Syncing...' : 'Encrypted Link Active'}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={downloadHealthSummary}
              disabled={isDownloading}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg text-xs font-bold hover:bg-cyan-500/20 transition-all disabled:opacity-50"
            >
              {isDownloading ? (
                <Activity className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isDownloading ? 'Generating...' : 'Download PDF Summary'}
            </button>
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
               {user?.photoURL ? (
                 <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                 <User className="w-6 h-6 text-slate-400" />
               )}
            </div>
          </div>
        </header>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            ref={contentRef}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <section>
                  <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Live Telemetry</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-cyan-400 animate-ping" />
                      <span className="text-[10px] text-cyan-400 font-bold uppercase">Real-time</span>
                    </div>
                  </div>
                  <VitalsCard vitals={vitals} onUpdate={updateVitals} />
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Quick Actions / Diagnostic */}
                  <div className="lg:col-span-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <section className="bg-gradient-to-br from-[#111827] to-[#020617] p-8 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden group">
                        <div className="flex items-center justify-between mb-8">
                          <h3 className="text-sm font-bold uppercase tracking-widest text-cyan-400">Diagnosis Engine</h3>
                          <Stethoscope className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                        </div>
                        <div className="space-y-4">
                          <div className="p-5 bg-slate-900/60 rounded-2xl border-l-4 border-rose-500/50 hover:bg-slate-900/80 transition-all cursor-pointer" onClick={() => setActiveTab('analyzer')}>
                            <div className="flex justify-between items-center mb-2">
                              <p className="font-bold text-white text-sm">Medical AI Analyzer</p>
                              <span className="text-[10px] text-rose-400 font-mono">PDF Ready &rarr;</span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed italic">Upload medical reports to extract values and detect potential criticalities instantly.</p>
                          </div>
                          
                          <div className="p-5 bg-slate-900/60 rounded-2xl border-l-4 border-violet-500/50 hover:bg-slate-900/80 transition-all cursor-pointer" onClick={() => setActiveTab('symptoms')}>
                            <div className="flex justify-between items-center mb-2">
                              <p className="font-bold text-white text-sm">Symptom Probability</p>
                              <span className="text-[10px] text-violet-400 font-mono">Check &rarr;</span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">Predict possibilities based on current symptoms and your clinical history.</p>
                          </div>
                        </div>
                      </section>

                      {/* Wellness Stats */}
                      <section className="bg-[#0F172A]/40 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between shadow-xl">
                        <div>
                          <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-400 mb-8 flex items-center justify-between">
                            AI Wellness Index
                            <span className="text-[10px] text-slate-600 font-normal">Updated 2m ago</span>
                          </h3>
                          
                          <div className="space-y-6">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-400">Cardiovascular Risk</span>
                              <div className="flex-1 mx-6 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }} 
                                  animate={{ width: "24%" }} 
                                  className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                                />
                              </div>
                              <span className="text-xs font-bold text-slate-300">LOW</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-400">Biological Load</span>
                              <div className="flex-1 mx-6 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }} 
                                  animate={{ width: "62%" }} 
                                  className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                                />
                              </div>
                              <span className="text-xs font-bold text-slate-300">MODERATE</span>
                            </div>

                            <div className="mt-8 p-4 bg-slate-900/40 rounded-2xl border border-slate-800/50">
                                <p className="text-[10px] font-bold text-slate-600 uppercase mb-2">Automated Insight</p>
                                <p className="text-xs text-slate-300 italic leading-relaxed">"Based on your 8.2h sleep trend and stable BP, your systemic recovery is currently optimal. Maintain active hydration."</p>
                            </div>
                          </div>
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analyzer' && (
              <Analyzer onResult={handleAnalysisResult} />
            )}

            {activeTab === 'symptoms' && (
              <SymptomChecker 
                vitals={vitals} 
                onPrediction={handlePredictionResult}
                onUpdateVitals={updateVitals}
              />
            )}

            {activeTab === 'history' && (
              <History history={history} onClear={clearHistory} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global Status Note */}
      <div className="fixed bottom-6 right-8 bg-[#0B0F1A]/90 backdrop-blur border border-slate-800 px-5 py-2.5 rounded-full hidden md:flex items-center gap-3 shadow-2xl z-50">
        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
        <span className="text-[10px] text-slate-400 tracking-tight font-bold uppercase tracking-widest">Diagnostic Engine Online</span>
      </div>
        </>
      )}
    </div>
  );
}
