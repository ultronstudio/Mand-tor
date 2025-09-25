import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

type Answer = { questionText: string; choice: 'yes'|'no'; isImportant?: boolean; reason?: string | null };
type Party = { name: string; ideology?: string; summary?: string };
type ElectionInfo = { name: string; year: number };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const API_KEY = process.env.API_KEY;
    if (!API_KEY) return res.status(500).json({ error: 'Missing API_KEY on server' });

    const ai = new GoogleGenAI({ apiKey: API_KEY });

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
Jste vysoce pokročilý, nestranný a objektivní český politický analytik. Vaším úkolem je analyzovat odpovědi uživatele a co nejpřesněji vyhodnotit jeho procentuální shodu s politickými stranami kandidujícími ve volbách.

Kontext voleb: ${electionInfo?.name ?? ''} ${electionInfo?.year ?? ''}

Seznam stran a jejich základní charakteristika:
${partiesInfoString}

Odpovědi uživatele:
${answersInfoString}

Pokyny pro vyhodnocení:
1.  **Analýza odpovědí:** Pečlivě projděte každou odpověď uživatele.
2.  **Váha otázek:** Otázkám označeným jako \`important: true\` přikládejte **výrazně vyšší váhu** při výpočtu celkové shody. Tyto otázky jsou pro uživatele klíčové.
3.  **Důvody uživatele:** Pokud je u důležité otázky uveden \`reason\`, použijte ho k hlubšímu pochopení postoje uživatele. Tento kontext vám pomůže přesněji určit shodu se stranou, která může mít na dané téma komplexnější názor.
4.  **Výpočet shody (\`matchPercentage\`):** Pro každou stranu vypočítejte shodu v procentech od 0 do 100. Shoda musí být založena na porovnání programů a známých postojů stran s odpověďmi uživatele, s přihlédnutím k váze důležitých otázek.
5.  **Zdůvodnění (\`reasoning\`):** Pro každou stranu napište stručné (1-2 věty), neutrální a výstižné zdůvodnění výsledné shody. Zmiňte klíčové oblasti shody nebo neshody.
6.  **Seřazení:** Výsledky seřaďte sestupně podle \`matchPercentage\`.

Výstup musí být POUZE JSON objekt, který striktně dodržuje následující schéma. Neuvádějte žádný text před ani za JSON objektem.
{
  "results": [
    {
      "name": "Jméno strany",
      "matchPercentage": 95,
      "reasoning": "Vysoká shoda v ekonomických otázkách a v postoji k EU. Menší rozdíly panují v oblasti sociální politiky."
    }
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