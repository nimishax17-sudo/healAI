import { useState, useEffect } from 'react';
import { HealthHistoryEntry, AnalysisResult, PredictionResult, VitalData } from '../types';

export function useHealthStorage() {
  const [history, setHistory] = useState<HealthHistoryEntry[]>([]);
  const [vitals, setVitals] = useState<VitalData>({
    bp: "120/80",
    pulse: "72",
    oxygen: "98",
    sleep: "7",
  });
  const [loading, setLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('healai_history');
    const savedVitals = localStorage.getItem('healai_vitals');
    
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedVitals) setVitals(JSON.parse(savedVitals));
    
    setLoading(false);
  }, []);

  const saveEntry = (type: "Report" | "Prediction", data: AnalysisResult | PredictionResult, currentVitals?: VitalData) => {
    const newEntry: HealthHistoryEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type,
      data,
      vitals: currentVitals || vitals,
    };
    
    const updatedHistory = [newEntry, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('healai_history', JSON.stringify(updatedHistory));
  };

  const updateVitals = (newVitals: VitalData) => {
    setVitals(newVitals);
    localStorage.setItem('healai_vitals', JSON.stringify(newVitals));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('healai_history');
  };

  return { history, vitals, saveEntry, updateVitals, clearHistory, loading };
}
