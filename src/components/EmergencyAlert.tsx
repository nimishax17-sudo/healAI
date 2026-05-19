import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

interface EmergencyAlertProps {
  isVisible: boolean;
  onClose: () => void;
  message?: string;
}

export default function EmergencyAlert({ isVisible, onClose, message }: EmergencyAlertProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-6 left-6 right-6 lg:left-80 lg:right-10 z-[100] flex items-center justify-between bg-rose-600 text-white p-6 rounded-2xl shadow-[0_0_50px_rgba(225,29,72,0.6)] border border-rose-400/50 backdrop-blur-xl"
        >
          <div className="flex items-center gap-5">
            <div className="bg-white/20 p-3 rounded-xl animate-pulse">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <p className="font-black text-xl uppercase tracking-tighter">Emergency Protocol Engaged</p>
              <p className="text-xs font-bold text-rose-100 uppercase tracking-widest mt-1 opacity-80">{message || "High risk factors detected. Clinical intervention required."}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-white/20"
          >
            <X className="w-6 h-6" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
