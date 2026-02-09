
export type HabitCategory = 'finance' | 'sleep' | 'screen' | 'food' | 'driving';

export interface CategoryMeta {
  label: string;
  icon: string;
  unit: string;
  placeholder: string;
}

export const CATEGORY_CONFIG: Record<HabitCategory, CategoryMeta> = {
  finance: { label: 'المصاريف', icon: '💰', unit: 'ريال', placeholder: 'كم صرفت؟' },
  sleep: { label: 'النوم', icon: '💤', unit: 'ساعة', placeholder: 'كم ساعة نمت؟' },
  screen: { label: 'الشاشة', icon: '📱', unit: 'دقيقة', placeholder: 'وقت الاستخدام؟' },
  food: { label: 'الأكل', icon: '🥗', unit: 'سعر', placeholder: 'كم سعرة حرارية؟' },
  driving: { label: 'القيادة', icon: '🚗', unit: 'كم', placeholder: 'كم كيلو قطعت؟' }
};

export interface LogEntry {
  id: string;
  category: HabitCategory;
  value: number;
  note: string;
  timestamp: number;
}

export interface RiskPrediction {
  category: HabitCategory;
  riskLevel: 'safe' | 'warning' | 'critical';
  predictionText: string;
  advice: string;
  projectedOutcome: string;
}
