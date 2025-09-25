import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

type Answer = { questionText: string; choice: 'yes'|'no'; isImportant?: boolean; reason?: string | null };
type Party = { name: string; ideology?: string; summary?: string };
type ElectionInfo = { name: string; year: number };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const GEMINI_KEY = process.env.GEMINI_KEY;
    if (!GEMINI_KEY) return res.status(500).json({ error: 'Missing GEMINI_KEY on server' });

    const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });

    const { answers, parties, electionInfo } = (req.body ?? {}) as {
      answers: Answer[]; parties: Party[]; electionInfo: ElectionInfo;
    };

    const partiesInfoString = JSON.stringify(
      (parties ?? []).map(p => ({ name: p.name, ideology: p.ideology, summary: p.summary })), null, 2
    );
    const answersInfoString = JSON.stringify(
      (answers ?? []).map(a => ({
        question: a.questionText,
        answer: a.choice,
        important: !!a.isImportant,
        reason: a.reason?.trim() || undefined
      })), null, 2
    );

    const prompt = `
Jste neutrální český politický analytik...
Kontext voleb: ${electionInfo?.name ?? ''} ${electionInfo?.year ?? ''}
Strany: ${partiesInfoString}
Odpovědi: ${answersInfoString}

Vrať JSON: { "results": [{ "name": string, "matchPercentage": number, "reasoning": string }] }
Seřazeno DESC podle matchPercentage.
    `.trim();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            results: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  matchPercentage: { type: Type.NUMBER },
                  reasoning: { type: Type.STRING }
                },
                required: ["name", "matchPercentage", "reasoning"]
              }
            }
          },
          required: ["results"]
        }
      }
    });

    let data: any;
    try { data = JSON.parse(response.text); }
    catch { return res.status(502).json({ error: "Invalid JSON from Gemini" }); }

    if (!Array.isArray(data.results)) return res.status(502).json({ error: "Schema mismatch" });

    return res.status(200).json({ results: data.results });
  } catch (e:any) {
    console.error(e);
    return res.status(500).json({ error: e?.message ?? 'Internal error' });
  }
}
