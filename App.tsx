import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppState, AnswerChoice } from './types';
import type { Question, Answer, PartyResult, SavedResult } from './types';
import { generateQuestions, evaluateAnswers } from './services/geminiService';
import { electionInfo } from './data/electionData';
import { parties } from './data/partyData';
import Loader from './components/Loader';
import ResultsTable from './components/ResultsTable';
import HistoryView from './components/HistoryView';

const MIN_ANSWERS_TO_EVALUATE = 30;

// Helper component defined outside App to prevent re-creation on re-renders
const StarIcon: React.FC<{ isImportant: boolean; onClick: () => void }> = ({ isImportant, onClick }) => (
    <button onClick={onClick} className="p-2 rounded-full hover:bg-yellow-400/20 transition-colors focus:outline-none" aria-label="Označit jako důležité">
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 transition-colors ${isImportant ? 'text-yellow-400 fill-current' : 'text-gray-500'}`} viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
    </button>
);

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Map<number, Answer>>(new Map());
    const [results, setResults] = useState<PartyResult[] | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<SavedResult[]>([]);
    const [viewingHistoryItem, setViewingHistoryItem] = useState<SavedResult | null>(null);

    useEffect(() => {
        try {
            const saved = localStorage.getItem('electionResultsHistory');
            if (saved) {
                setHistory(JSON.parse(saved));
            }
        } catch (e) {
            console.error("Failed to load history from localStorage", e);
        }
    }, []);

    const answeredQuestionsCount = useMemo(() => Array.from(answers.values()).filter(a => a.choice !== undefined).length, [answers]);
    const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);
    const currentAnswer = useMemo(() => answers.get(currentQuestion?.id), [answers, currentQuestion]);

    const handleStart = useCallback(() => {
        setAppState(AppState.GENERATING_QUESTIONS);
        generateQuestions()
            .then(q => {
                setQuestions(q.map((text, id) => ({ id, text })));
                setAppState(AppState.ANSWERING);
                setCurrentQuestionIndex(0);
            })
            .catch(err => {
                setError(err.message || "Došlo k neznámé chybě.");
                setAppState(AppState.ERROR);
            });
    }, []);

    const handleEvaluate = useCallback(() => {
        const answersToEvaluate = Array.from(answers.values()).filter(
            (a): a is Answer & { choice: AnswerChoice } => a.choice !== undefined
        );

        if (answersToEvaluate.length < MIN_ANSWERS_TO_EVALUATE) {
            return;
        }

        setAppState(AppState.EVALUATING);
        evaluateAnswers(answersToEvaluate)
            .then(apiResults => {
                const enrichedResults = apiResults.map(apiResult => {
                    const staticPartyData = parties.find(p => p.name === apiResult.name);
                    if (staticPartyData) {
                        return {
                            ...staticPartyData, // provides candidates, leader, etc.
                            ...apiResult // provides matchPercentage, reasoning
                        };
                    }
                    // Fallback for safety, though Gemini should return matching names.
                    // This ensures the app doesn't crash if a name mismatch occurs.
                    return {
                        name: apiResult.name,
                        matchPercentage: apiResult.matchPercentage,
                        reasoning: apiResult.reasoning,
                        leader: 'N/A',
                        ideology: 'N/A',
                        motto: 'N/A',
                        candidates: [], // Ensures .join() won't crash
                        summary: 'N/A',
                    };
                });

                setResults(enrichedResults);
                setAppState(AppState.RESULTS);

                const newSavedResult: SavedResult = {
                    date: new Date().toISOString(),
                    results: enrichedResults,
                    answers: answersToEvaluate,
                };
                try {
                    const currentHistory = JSON.parse(localStorage.getItem('electionResultsHistory') || '[]');
                    const newHistory = [newSavedResult, ...currentHistory];
                    localStorage.setItem('electionResultsHistory', JSON.stringify(newHistory));
                    setHistory(newHistory);
                } catch (e) {
                    console.error("Failed to save result to localStorage", e);
                }
            })
            .catch(err => {
                setError(err.message || "Došlo k neznámé chybě při vyhodnocování.");
                setAppState(AppState.ERROR);
            });
    }, [answers]);

    useEffect(() => {
        if (appState !== AppState.ANSWERING || !questions.length) return;
        const lastQuestionAnswered = !!answers.get(questions[questions.length - 1].id)?.choice;
        if (lastQuestionAnswered && answeredQuestionsCount >= MIN_ANSWERS_TO_EVALUATE) {
            handleEvaluate();
        }
    }, [answers, questions, appState, handleEvaluate, answeredQuestionsCount]);

    const handleAnswer = (choice: AnswerChoice) => {
        if (!currentQuestion) return;
        setAnswers(prev => {
            const newAnswers = new Map(prev);
            const existing = newAnswers.get(currentQuestion.id);
            newAnswers.set(currentQuestion.id, {
                questionId: currentQuestion.id,
                questionText: currentQuestion.text,
                isImportant: existing?.isImportant || false,
                reason: existing?.reason,
                choice: choice,
            });
            return newAnswers;
        });

        if (currentQuestionIndex < questions.length - 1) {
            goToNextQuestion();
        }
    };
    
    const handleToggleImportant = () => {
        if (!currentQuestion) return;
        setAnswers(prev => {
            const newAnswers = new Map(prev);
            const existing = newAnswers.get(currentQuestion.id);
            newAnswers.set(currentQuestion.id, {
                questionId: currentQuestion.id,
                questionText: currentQuestion.text,
                choice: existing?.choice,
                reason: existing?.reason,
                isImportant: !existing?.isImportant,
            });
            return newAnswers;
        });
    };

    const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!currentQuestion) return;
        const reason = e.target.value;
        setAnswers(prev => {
            const newAnswers = new Map(prev);
            const existing = newAnswers.get(currentQuestion.id);
            if (existing) {
                newAnswers.set(currentQuestion.id, {
                    ...existing,
                    reason: reason,
                });
            }
            return newAnswers;
        });
    };
    
    const goToNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const goToPrevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleReset = () => {
        setQuestions([]);
        setAnswers(new Map());
        setResults(null);
        setCurrentQuestionIndex(0);
        setError(null);
        setViewingHistoryItem(null);
        setAppState(AppState.WELCOME);
    };

    const renderContent = () => {
        switch (appState) {
            case AppState.WELCOME:
                return (
                    <div className="text-center p-8 bg-secondary rounded-lg shadow-lg border border-gray-700">
                        <h1 className="text-4xl font-bold text-accent mb-2">Mandátor&nbsp;v{electionInfo.year}</h1>
                        <p className="text-lg text-dark-text mb-6">{electionInfo.name}</p>
                        <p className="max-w-2xl mx-auto mb-8">
                            Odpovězte na sadu otázek a naše umělá inteligence vám ukáže, která politická strana nejlépe odpovídá vašim názorům.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                            <button onClick={handleStart} className="bg-accent text-primary font-bold text-xl py-3 px-8 rounded-lg hover:bg-blue-400 transition-colors w-full sm:w-auto">
                                Spustit kalkulačku
                            </button>
                             {history.length > 0 && (
                                <button onClick={() => setAppState(AppState.HISTORY)} className="bg-gray-600 text-light-text font-bold text-xl py-3 px-8 rounded-lg hover:bg-gray-500 transition-colors w-full sm:w-auto">
                                    Zobrazit historii
                                </button>
                            )}
                        </div>
                    </div>
                );
            case AppState.GENERATING_QUESTIONS:
                return <Loader message="Generuji relevantní otázky pro aktuální rok..." />;
            case AppState.ANSWERING:
                if (!currentQuestion) return null;
                const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
                return (
                    <div className="w-full max-w-3xl mx-auto p-4 md:p-6 bg-secondary border border-gray-700 rounded-lg shadow-lg">
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-semibold text-dark-text">Otázka {currentQuestionIndex + 1} / {questions.length}</span>
                                <span className="text-sm font-semibold text-dark-text">Odpovězeno: {answeredQuestionsCount}</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2.5">
                                <div className="bg-accent h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>

                        <div className="text-center p-8 min-h-[300px] flex flex-col justify-center">
                           <div className="flex items-start justify-center gap-3">
                                {currentAnswer?.isImportant && (
                                    <span className="flex-shrink-0 pt-1" title="Důležitá otázka">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    </span>
                                )}
                                <p className="text-2xl font-medium text-light-text">{currentQuestion.text}</p>
                            </div>
                           {currentAnswer?.isImportant && (
                                <div className="mt-6 w-full transition-all duration-300">
                                    <label htmlFor={`reason-${currentQuestion.id}`} className="block text-sm font-medium text-dark-text mb-2 text-left">
                                        Proč je pro vás tato otázka důležitá? (volitelné)
                                    </label>
                                    <textarea
                                        id={`reason-${currentQuestion.id}`}
                                        className="w-full bg-primary border border-gray-600 rounded-lg p-3 text-light-text placeholder-dark-text focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200 resize-none"
                                        placeholder="Např. 'Toto přímo ovlivňuje moji rodinu...'"
                                        value={currentAnswer?.reason || ''}
                                        onChange={handleReasonChange}
                                        rows={3}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-center space-x-4 my-6">
                            <button onClick={() => handleAnswer(AnswerChoice.YES)} className="w-32 bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-500 transition-transform transform hover:scale-105">
                                Ano
                            </button>
                            <StarIcon isImportant={!!currentAnswer?.isImportant} onClick={handleToggleImportant} />
                            <button onClick={() => handleAnswer(AnswerChoice.NO)} className="w-32 bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-500 transition-transform transform hover:scale-105">
                                Ne
                            </button>
                        </div>
                        
                        <div className="flex justify-between items-center mt-8">
                            <button onClick={goToPrevQuestion} disabled={currentQuestionIndex === 0} className="px-4 py-2 bg-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-600">Předchozí</button>
                            <button onClick={goToNextQuestion} disabled={currentQuestionIndex === questions.length - 1} className="px-4 py-2 bg-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-600">Přeskočit</button>
                            <button onClick={handleEvaluate} disabled={answeredQuestionsCount < MIN_ANSWERS_TO_EVALUATE} className="px-6 py-3 bg-accent text-primary font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-400">
                                Vyhodnotit ({answeredQuestionsCount}/{MIN_ANSWERS_TO_EVALUATE})
                            </button>
                        </div>
                    </div>
                );
            case AppState.EVALUATING:
                return <Loader message="Analyzuji vaše odpovědi a porovnávám je s politickými programy..." />;
            case AppState.RESULTS:
                return results && <ResultsTable results={results} onReset={handleReset} />;
            case AppState.HISTORY:
                if (viewingHistoryItem) {
                    return (
                        <ResultsTable
                            results={viewingHistoryItem.results}
                            onReset={() => setViewingHistoryItem(null)}
                            isHistoryView={true}
                        />
                    );
                }

                const handleViewHistoryItem = (item: SavedResult) => {
                    // Check if data is old/unenriched by looking for a property that was added later, like 'candidates'.
                    const isEnriched = item.results[0] && 'candidates' in item.results[0];
                    if (isEnriched) {
                        setViewingHistoryItem(item);
                        return;
                    }

                    // Data is from an old version, enrich it before viewing.
                    const enrichedResults = item.results.map(oldResult => {
                        const staticData = parties.find(p => p.name === oldResult.name);
                        return {
                            ...(staticData || { 
                                leader: 'N/A', ideology: 'N/A', motto: 'N/A', 
                                summary: 'N/A', candidates: [] 
                            }),
                            ...oldResult
                        };
                    });
                    
                    setViewingHistoryItem({ ...item, results: enrichedResults });
                };

                return (
                    <HistoryView
                        history={history}
                        onViewItem={handleViewHistoryItem}
                        onBack={() => setAppState(AppState.WELCOME)}
                    />
                );
            case AppState.ERROR:
                return (
                    <div className="text-center p-8 bg-red-900/50 border border-red-500 rounded-lg">
                        <h2 className="text-2xl font-bold text-red-400 mb-4">Došlo k chybě</h2>
                        <p className="text-light-text mb-6">{error}</p>
                        <button onClick={handleReset} className="bg-accent text-primary font-bold py-2 px-6 rounded-lg hover:bg-blue-400">
                            Zkusit znovu
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col p-4 bg-primary font-sans">
            <main className="flex-grow w-full flex items-center justify-center">
                {renderContent()}
            </main>
            <footer className="text-center text-dark-text text-sm py-4">
                © {new Date().getFullYear()} <a href="https://petrvurm.cz?utm_source=volebni-kalkulacka-ai&utm_medium=footer&utm_campaign=copyright" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Petr Vurm</a>
            </footer>
        </div>
    );
};

export default App;