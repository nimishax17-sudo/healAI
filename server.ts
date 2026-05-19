import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

/**
 * Helper to retry Gemini API calls on 503/UNAVAILABLE errors
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, initialDelay = 1000): Promise<T> {
  let retries = 0;
  while (true) {
    try {
      return await fn();
    } catch (error: any) {
      const isRetryable = 
        error?.status === 503 || 
        error?.code === 503 || 
        error?.message?.includes('503') || 
        error?.message?.includes('UNAVAILABLE') ||
        error?.message?.includes('high demand');

      if (isRetryable && retries < maxRetries) {
        retries++;
        const delay = initialDelay * Math.pow(2, retries - 1);
        console.warn(`Gemini API busy (503). Retrying in ${delay}ms (Attempt ${retries}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}

app.use(express.json({ limit: '10mb' }));

// API: Analyze Medical Report
app.post("/api/analyze-report", async (req, res) => {
  try {
    const { reportText } = req.body;

    if (!reportText) {
      return res.status(400).json({ error: "No report text provided" });
    }

    const prompt = `
      You are a specialized medical AI analyzer named HealAI. 
      Analyze the following medical report text and extract key information in JSON format.
      
      REPORT TEXT:
      ${reportText}
      
      The JSON response should include:
      1. patientInfo: { name, age, gender, date } (if available)
      2. values: Array of { parameter, result, unit, referenceRange, status: "Normal" | "Abnormal" | "Critical" }
      3. summary: A simple explanation of the report for a layperson.
      4. abnormalities: Array of { finding: string, meaning: string } explaining abnormal values.
      5. recommendations: Diet and wellness steps based on results.
      6. riskProfile: { level: "Low" | "Moderate" | "High", description, factors: [] }
      7. charts: { type: "bar" | "pie", data: Array of { label, value, color } } - visualizing health parameters.
      8. Note: A simple reminder to not ignore symptoms and consult a doctor.

      Keep the language easy to understand for the patient.
    `;

    const response = await withRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    }));

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Analysis Error:", error);
    const message = error?.message?.includes('high demand') 
      ? "AI model is currently under high demand. Please try again in a few moments."
      : "Failed to analyze report";
    res.status(error?.status === 503 ? 503 : 500).json({ error: message });
  }
});

// API: Predict Disease from Symptoms
app.post("/api/predict-disease", async (req, res) => {
  try {
    const { symptoms, vitals, familyHistory } = req.body;

    const prompt = `
      You are a specialized medical AI advisor named HealAI.
      Predict possible conditions based on symptoms, vitals, and family history.
      
      SYMPTOMS: ${symptoms}
      VITALS: BP: ${vitals.bp}, Heart Rate: ${vitals.pulse}, Oxygen: ${vitals.oxygen}, Sleep: ${vitals.sleep}
      FAMILY HISTORY: ${familyHistory || "None provided"}
      
      The JSON response should include:
      1. possibleConditions: Array of { condition, probability: "Low" | "Medium" | "High", reason }
      2. riskLevel: "Normal" | "Warning" | "Emergency"
      3. actionPlan: Immediate steps to take.
      4. doctorNote: A warning if it's an emergency, or a gentle reminder to consult a professional.
      5. dietAdvice: Nutritional advice related to these symptoms.
      6. emergencyAlert: Boolean, true if life-threatening.
    `;

    const response = await withRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    }));

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Prediction Error:", error);
    const message = error?.message?.includes('high demand') 
      ? "AI model is currently under high demand. Please try again in a few moments."
      : "Failed to predict disease";
    res.status(error?.status === 503 ? 503 : 500).json({ error: message });
  }
});

// Vite middleware for development
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

setupVite().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HealAI Server running on http://localhost:${PORT}`);
  });
});
