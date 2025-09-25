export enum AnswerChoice {
    YES = 'YES',
    NO = 'NO',
}

export interface Question {
    id: number;
    text: string;
}

export interface Answer {
    questionId: number;
    questionText: string;
    choice?: AnswerChoice;
    isImportant: boolean;
    reason?: string;
}

export interface Party {
    name: string;
    leader: string;
    ideology: string;
    motto: string;
    candidates: string[];
    summary: string;
}

export interface PartyAPIResult {
    name: string;
    matchPercentage: number;
    reasoning: string;
}

export interface PartyResult extends Party {
    matchPercentage: number;
    reasoning: string;
}

export interface SavedResult {
    date: string;
    results: PartyResult[];
    answers?: Answer[];
}

export enum AppState {
    WELCOME,
    GENERATING_QUESTIONS,
    ANSWERING,
    EVALUATING,
    RESULTS,
    HISTORY,
    ERROR,
}