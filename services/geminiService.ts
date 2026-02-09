
import { GoogleGenAI, Type } from "@google/genai";
import { HabitCategory, LogEntry, RiskPrediction, CATEGORY_CONFIG } from "../types";

// Always use process.env.API_KEY directly for initialization
const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const predictOutcome = async (category: HabitCategory, logs: LogEntry[]): Promise<RiskPrediction> => {
  const ai = getAiClient();
  const config = CATEGORY_CONFIG[category];
  
  const recentLogsText = logs
    .filter(l => l.category === category)
    .slice(-7)
    .map(l => `- القيمة: ${l.value} ${config.unit}, ملاحظة: ${l.note || 'لا يوجد'}`)
    .join('\n');

  const systemInstruction = `أنت نظام ذكي للتنبؤ بالسلوك البشري. 
  مهمتك ليست إخبار المستخدم بأنه أخطأ، بل تنبيهه بذكاء قبل أن يقع في الخطأ بناءً على اتجاه بياناته (Trends).
  كن استباقياً، مشجعاً، ومنبهاً. إذا كانت البيانات جيدة، طمئنه. 
  إذا كانت البيانات تشير لمنحنى خطر (مثلاً زيادة تدريجية في الصرف أو نقص في النوم)، نبهه للنتيجة المتوقعة بعد أسبوع.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `بيانات ${config.label} الأخيرة:\n${recentLogsText}\n
      توقع المسار القادم بناءً على هذا النمط.`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskLevel: { type: Type.STRING, enum: ['safe', 'warning', 'critical'] },
            predictionText: { type: Type.STRING, description: "توصيف ذكي للمسار الحالي (مثلاً: أنت تتجه لتجاوز ميزانيتك)" },
            advice: { type: Type.STRING, description: "نصيحة عملية لتغيير المسار قبل فوات الأوان" },
            projectedOutcome: { type: Type.STRING, description: "ماذا سيحدث لو استمر المستخدم على هذا المنوال؟" }
          },
          required: ["riskLevel", "predictionText", "advice", "projectedOutcome"]
        }
      }
    });

    // Access the .text property directly to get the generated content
    const result = JSON.parse(response.text || '{}');
    return { ...result, category };
  } catch (error) {
    console.error("AI Prediction Error:", error);
    return {
      category,
      riskLevel: 'safe',
      predictionText: "البيانات الحالية تشير لاستقرار نسبي.",
      advice: "استمر في مراقبة عاداتك.",
      projectedOutcome: "استقرار عام"
    };
  }
};
