import { GoogleGenAI, Type } from "@google/genai";
import type { Answer, Party, PartyResult } from '../types';
import { electionInfo } from '../data/electionData';
import { parties } from '../data/partyData';

const GEMINI_KEY = process.env.NEXT_PUBLIC_GEMINI_KEY;

if (!GEMINI_KEY) {
    throw new Error("GEMINI_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });

export async function generateQuestions(): Promise<string[]> {
    const electionContext = `${electionInfo.name} ${electionInfo.year}`;
    const prompt = `
        Jste expert na českou politiku a aktuální dění. Vaším úkolem je vygenerovat seznam 50 různorodých a relevantních otázek pro volební kalkulačku pro nadcházející "${electionContext}".

        Otázky by měly pokrývat širokou škálu témat, včetně, ale nikoli výhradně:
        - Ekonomika (daně, dluh, inflace, přijetí Eura)
        - Sociální otázky (práva LGBTQ+, imigrace, sociální dávky)
        - Zahraniční politika (EU, NATO, vztahy s Ruskem a Čínou)
        - Životní prostředí (změna klimatu, zelená energie, jaderná energetika)
        - Zdravotnictví a školství
        - Řízení státu a spravedlnost

        Pravidla pro otázky:
        - Každá otázka musí být jasné, stručné tvrzení, na které lze odpovědět "Ano" (souhlasím) nebo "Ne" (nesouhlasím).
        - Otázky musí být neutrální a nesmí být návodné.
        - Otázky musí být v českém jazyce.

        Vraťte odpověď jako JSON objekt, který striktně dodržuje poskytnuté schéma a obsahuje pole 50 unikátních řetězců s otázkami.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    questions: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    }
                }
            }
        }
    });

    try {
        const jsonResponse = JSON.parse(response.text);
        if (jsonResponse && Array.isArray(jsonResponse.questions)) {
            return jsonResponse.questions;
        }
        throw new Error("Invalid format for questions response.");
    } catch (e) {
        console.error("Failed to parse questions from Gemini:", e);
        throw new Error("Nepodařilo se vygenerovat otázky. Zkuste to prosím znovu.");
    }
}

export async function evaluateAnswers(answers: Answer[]): Promise<PartyResult[]> {
    const electionContext = `${electionInfo.name} ${electionInfo.year}`;
    const partiesInfoString = JSON.stringify(parties.map(p => ({ name: p.name, ideology: p.ideology, summary: p.summary })), null, 2);
    const answersInfoString = JSON.stringify(answers.map(a => ({ 
        question: a.questionText, 
        answer: a.choice, 
        important: a.isImportant,
        reason: a.reason ? a.reason.trim() : undefined
    })), null, 2);

    const prompt = `
        Jste vysoce pokročilý, neutrální a objektivní český politický analytik. Vaším úkolem je provést hloubkovou analýzu odpovědí uživatele na politické otázky a precizně je porovnat s programy a ideologiemi hlavních českých politických stran.

        Kontext aktuálních voleb:
        ${electionContext}

        Politické strany:
        Zde je seznam stran a jejich obecné charakteristiky:
        ${partiesInfoString}

        Odpovědi uživatele:
        Uživatel poskytl následující odpovědi. Vaše analýza se musí řídit těmito pravidly:
        - **Nejvyšší priorita:** Otázky označené jako 'important: true' jsou pro uživatele klíčové. Jejich shoda či neshoda s postojem strany musí mít dramaticky největší dopad na výsledné procento shody.
        - **Klíčový kontext (reason):** Pokud je u důležité otázky vyplněn i 'reason', nejedná se o pouhou poznámku. Je to **zásadní vysvětlení**, které odhaluje motivaci a nuance postoje uživatele. Musíte tento text analyzovat a použít ho jako primární vodítko pro pochopení, proč je pro uživatele dané téma tak důležité. Ve svém zdůvodnění ('reasoning') pro každou stranu se **musíte** snažit reflektovat, jak postoj strany rezonuje (nebo je v konfliktu) s těmito konkrétními, uživatelem popsanými důvody.
        ${answersInfoString}

        Váš úkol:
        Na základě odpovědí uživatele vyhodnoťte jeho shodu s každou politickou stranou. Pro každou stranu musíte poskytnout:
        1. "matchPercentage": Číselné skóre od 0 do 100 udávající míru shody. 100 je dokonalá shoda, 0 je naprostý nesoulad.
        2. "reasoning": Stručné, neutrální a **personalizované** vysvětlení (2-3 věty), proč se uživatel shoduje nebo neshoduje se stranou. Toto zdůvodnění musí odrážet váhu důležitých otázek a pokud možno i kontext z poskytnutých 'reasons'.

        Vraťte odpověď jako JSON objekt, který striktně dodržuje poskytnuté schéma. Výstupem by mělo být pole objektů, jeden pro každou stranu, seřazené sestupně podle matchPercentage.
    `;

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
                }
            }
        }
    });

    try {
        const jsonResponse = JSON.parse(response.text);
        if (jsonResponse && Array.isArray(jsonResponse.results)) {
            // Join AI results with local party data
            const fullResults: PartyResult[] = jsonResponse.results.map((result: any) => {
                const partyData = parties.find(p => p.name === result.name);
                return {
                    ...partyData,
                    ...result,
                } as PartyResult;
            }).filter((r: PartyResult | undefined): r is PartyResult => r !== undefined);

            // Sort again just in case AI didn't
            fullResults.sort((a, b) => b.matchPercentage - a.matchPercentage);

            return fullResults;
        }
        throw new Error("Invalid format for evaluation response.");
    } catch (e) {
        console.error("Failed to parse evaluation from Gemini:", e);
        throw new Error("Nepodařilo se vyhodnotit odpovědi. Zkuste to prosím znovu.");
    }
}