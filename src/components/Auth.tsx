import { useState, FormEvent } from 'react';
import { auth, googleProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Lock, Activity, HeartPulse, Mail, Key, UserPlus, LogIn } from 'lucide-react';

interface AuthProps {
  onSuccess?: () => void;
}

export default function Auth({ onSuccess }: AuthProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      onSuccess?.();
    } catch (err: any) {
      console.error(err);
      setError("Authorization failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        if (!displayName) throw new Error("Display Name is required for registration.");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onSuccess?.();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Authentication failed. Verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-600/5 blur-[120px] rounded-full" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full bg-[#0F172A]/40 border border-slate-800 p-8 md:p-12 rounded-[3.5rem] backdrop-blur-xl shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-6 border border-cyan-500/20">
            <HeartPulse className="w-8 h-8 text-cyan-400" />
          </div>

          <h1 className="text-4xl font-black text-white mb-2 tracking-tighter leading-none italic uppercase">
            Heal<span className="text-cyan-400">AI</span>
          </h1>
          <p className="text-slate-500 font-bold text-[9px] uppercase tracking-[0.4em]">
            Autonomous Clinical Engine
          </p>
        </div>

        <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800/50 mb-8">
          <button 
            onClick={() => setMode('signup')}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'signup' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Register Identity
          </button>
          <button 
            onClick={() => setMode('signin')}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'signin' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Access Vault
          </button>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4 mb-8">
          <AnimatePresence mode="wait">
            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                  <input 
                    type="text"
                    placeholder="FULL NAME / IDENTIFIER"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-white placeholder:text-slate-600 focus:border-cyan-500/50 outline-none transition-all"
                    required
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
            <input 
              type="email"
              placeholder="GENETIC_ID (EMAIL)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-white placeholder:text-slate-600 focus:border-cyan-500/50 outline-none transition-all"
              required
            />
          </div>

          <div className="relative group">
            <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
            <input 
              type="password"
              placeholder="ENCRYPTION KEY (PASSWORD)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-white placeholder:text-slate-600 focus:border-cyan-500/50 outline-none transition-all"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-cyan-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-cyan-400 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <Activity className="w-4 h-4 animate-spin" />
            ) : mode === 'signup' ? (
              <UserPlus className="w-4 h-4" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            {mode === 'signup' ? 'Process Registration' : 'Initialize Session'}
          </button>
        </form>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[#0b101d] px-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">or integrate bio-link</span>
          </div>
        </div>

        <button 
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-4 bg-slate-900/50 text-white border border-slate-800 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
          Neural Link with Google
        </button>

        {error && (
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-rose-500 text-[10px] font-black uppercase tracking-widest bg-rose-500/10 py-3 rounded-xl border border-rose-500/20 px-4"
          >
            {error}
          </motion.p>
        )}

        <p className="mt-8 text-[9px] text-slate-600 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
          <Shield className="w-3 h-3" />
          End-to-End Encrypted HIPAA Environment
        </p>
      </motion.div>
    </div>
  );
}
