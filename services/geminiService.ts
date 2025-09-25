import type { Answer, PartyResult } from '../types';
import { electionInfo } from '../data/electionData';
import { parties } from '../data/partyData';

export async function generateQuestions(): Promise<string[]> {
  const r = await fetch('/api/generate-questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ electionInfo })
  });
  if (!r.ok) throw new Error(`generateQuestions failed: ${r.status}`);
  const data = await r.json();
  return data.questions as string[];
}

export async function evaluateAnswers(answers: any[]): Promise<PartyResult[]> {
  const r = await fetch('/api/evaluate-answers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers, parties, electionInfo })
  });
  if (!r.ok) throw new Error(`evaluateAnswers failed: ${r.status}`);
  const data = await r.json();
  return data.results as PartyResult[];
}
