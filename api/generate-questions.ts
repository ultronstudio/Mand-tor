import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const API_KEY = process.env.API_KEY;
    if (!API_KEY) return res.status(500).json({ error: 'Missing API_KEY on server' });

    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const { electionInfo } = (req.body ?? {}) as { electionInfo?: { name: string; year: number } };
    const electionContext = electionInfo ? `${electionInfo.name} ${electionInfo.year}` : 'Volby v ČR';

    const prompt = `
Jste expert na českou politiku a tvůrce volebních kalkulaček. Vaším úkolem je vygenerovat 50 klíčových a aktuálních otázek pro volební kalkulačku k volbám v České republice.

Kontext voleb: "${electionContext}"

Pravidla pro generování otázek:
1.  **Počet:** Vygenerujte přesně 50 unikátních otázek.
2.  **Formát:** Otázky musí být formulovány jako jednoduché, jasné a neutrální otázky, na které lze odpovědět "Ano" nebo "Ne". Vyhněte se sugestivním nebo složitým souvětím.
3.  **Témata:** Pokryjte široké spektrum relevantních témat pro české voliče, včetně, ale nejen:
    - Ekonomika (daně, inflace, státní rozpočet, euro)
    - Sociální politika (důchody, sociální dávky, zdravotnictví, školství)
    - Zahraniční politika (EU, NATO, vztahy s Ruskem a Čínou, válka na Ukrajině)
    - Vnitřní bezpečnost (policie, justice, migrace)
    - Životní prostředí (energetika, Green Deal, ochrana přírody)
    - Doprava a infrastruktura
    - Digitalizace a technologie
    - Lidská práva a svobody
4.  **Aktuálnost:** Otázky by měly odrážet současnou politickou a společenskou debatu v České republice pro daný rok voleb.
5.  **Jazyk:** Použijte češtinu.

Výstup musí být POUZE JSON objekt ve formátu:
{
  "questions": [
    "Mělo by Česko přijmout euro?",
    "Souhlasíte se zvýšením věku pro odchod do důchodu?",
    "Měla by vláda zavést školné na vysokých školách?",
    // ... a tak dále až do 50 otázek
  ]
}
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

    let data: { questions?: string[] };
    try { 
      data = JSON.parse(response.text); 
    } catch { 
      return res.status(502).json({ error: "Invalid JSON from Gemini" }); 
    }

    if (!data || !Array.isArray(data.questions)) return res.status(502).json({ error: "Schema mismatch from Gemini, expected { questions: string[] }" });

    return res.status(200).json({ questions: data.questions });
  } catch (e:any) {
    console.error(e);
    return res.status(500).json({ error: e?.message ?? 'Internal error' });
  }
}
