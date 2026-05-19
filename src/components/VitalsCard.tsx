import { Activity, Heart, Thermometer, Moon } from 'lucide-react';
import { VitalData } from '../types';

interface VitalsCardProps {
  vitals: VitalData;
  onUpdate: (vitals: VitalData) => void;
}

export default function VitalsCard({ vitals, onUpdate }: VitalsCardProps) {
  const items = [
    { label: "Heart Rate", value: vitals.pulse, unit: "BPM", icon: Heart, key: "pulse", color: "text-rose-500", glow: "shadow-[0_0_15px_rgba(244,63,94,0.2)]", trend: "+2.4%" },
    { label: "Blood Pressure", value: vitals.bp, unit: "mmHg", icon: Activity, key: "bp", color: "text-cyan-500", glow: "shadow-[0_0_15px_rgba(6,182,212,0.2)]" },
    { label: "Oxygen SpO2", value: vitals.oxygen, unit: "%", icon: Thermometer, key: "oxygen", color: "text-emerald-500", glow: "shadow-[0_0_15px_rgba(16,185,129,0.2)]" },
    { label: "Sleep Quality", value: vitals.sleep, unit: "Hours", icon: Moon, key: "sleep", color: "text-violet-500", glow: "shadow-[0_0_15px_rgba(139,92,246,0.2)]" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {items.map((item) => (
        <div 
          key={item.key}
          className={`bg-[#0F172A]/40 border border-slate-800 p-6 rounded-2xl transition-all hover:bg-[#1e293b]/60 hover:border-slate-700 shadow-xl flex flex-col justify-between h-32 group relative overflow-hidden ${item.glow}`}
        >
          <div className="flex justify-between items-center relative z-10">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
            {item.trend && <span className="text-[10px] text-emerald-400 font-bold">{item.trend}</span>}
          </div>
          
          <div className="flex items-end gap-2 relative z-10">
            <input
              type="text"
              className="text-3xl font-bold bg-transparent border-none outline-none w-24 text-white p-0 focus:ring-0"
              value={item.value}
              onChange={(e) => onUpdate({ ...vitals, [item.key]: e.target.value })}
            />
            <span className="text-slate-500 text-xs pb-1 font-medium italic lowercase">{item.unit}</span>
          </div>

          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <item.icon className="w-24 h-24 stroke-[1px]" />
          </div>
        </div>
      ))}
    </div>
  );
}
