
import React from 'react';
import { HabitCategory, RiskPrediction } from '../types';

interface HabitCardProps {
  category: HabitCategory;
  prediction: RiskPrediction | null;
  loading: boolean;
  onClick: () => void;
}

const icons: Record<HabitCategory, string> = {
  finance: "💰",
  sleep: "💤",
  screen: "📱",
  food: "🥗",
  driving: "🚗"
};

const names: Record<HabitCategory, string> = {
  finance: "المصاريف",
  sleep: "النوم",
  screen: "الشاشة",
  food: "الأكل",
  driving: "القيادة"
};

const HabitCard: React.FC<HabitCardProps> = ({ category, prediction, loading, onClick }) => {
  const riskClass = prediction?.riskLevel === 'critical' ? 'risk-high' : 
                   prediction?.riskLevel === 'warning' ? 'risk-medium' : 'risk-low';

  return (
    <button 
      onClick={onClick}
      className={`dashboard-card p-5 w-full text-right transition-all hover:scale-[1.02] active:scale-95 flex flex-col gap-3 ${riskClass}`}
    >
      <div className="flex justify-between items-center w-full">
        <span className="text-3xl">{icons[category]}</span>
        <h3 className="font-bold text-lg text-white">{names[category]}</h3>
      </div>

      {loading ? (
        <div className="animate-pulse flex flex-col gap-2">
          <div className="h-4 bg-white/10 rounded w-3/4"></div>
          <div className="h-3 bg-white/10 rounded w-1/2"></div>
        </div>
      ) : prediction ? (
        <>
          <p className="text-xs font-semibold opacity-90">{prediction.predictionText}</p>
          <div className="mt-auto pt-2 border-t border-white/5">
            <span className="text-[10px] uppercase tracking-wider opacity-60">تنبيه استباقي:</span>
            <p className="text-[11px] text-white/80 leading-tight mt-1 italic">{prediction.advice}</p>
          </div>
        </>
      ) : (
        <p className="text-xs opacity-50">لا توجد بيانات حالية</p>
      )}
    </button>
  );
};

export default HabitCard;
