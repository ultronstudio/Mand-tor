import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const GEMINI_KEY = process.env.GEMINI_KEY;
    if (!GEMINI_KEY) return res.status(500).json({ error: 'Missing GEMINI_KEY on server' });

    const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });

    const { electionInfo } = (req.body ?? {}) as { electionInfo?: { name: string; year: number } };
    const electionContext = electionInfo ? `${electionInfo.name} ${electionInfo.year}` : 'Volby v ČR';

    const prompt = `
Jste expert na českou politiku... (tvůj původní prompt pro otázky, klidně celý)
electionContext: "${electionContext}"
Vrať JSON { "questions": string[] }.
    `.trim();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["questions"]
        }
      }
    });

    let data: any;
    try { data = JSON.parse(response.text); }
    catch { return res.status(502).json({ error: "Invalid JSON from Gemini" }); }

    if (!Array.isArray(data.questions)) return res.status(502).json({ error: "Schema mismatch" });

    return res.status(200).json({ questions: data.questions });
  } catch (e:any) {
    console.error(e);
    return res.status(500).json({ error: e?.message ?? 'Internal error' });
  }
}
