import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppState, AnswerChoice } from './types';
import type { Question, Answer, PartyResult, SavedResult, PartyAPIResult } from './types';
import { generateQuestions, evaluateAnswers } from './services/geminiService';
import { parties } from './data/partyData';
import Loader from './components/Loader';
import ResultsTable from './components/ResultsTable';
import HistoryView from './components/HistoryView';
import WelcomeScreen from './components/WelcomeScreen';
import AnsweringView from './components/AnsweringView';
import ErrorView from './components/ErrorView';

const MIN_ANSWERS_TO_EVALUATE = 30;

const enrichResultsData = (apiResults: PartyAPIResult[]): PartyResult[] => {
    return apiResults.map(apiResult => {
        const staticPartyData = parties.find(p => p.name === apiResult.name);
        return {
            ...(staticPartyData || {
                leader: 'N/A',
                ideology: 'N/A',
                motto: 'N/A',
                candidates: [],
                summary: 'N/A',
            }),
            ...apiResult,
        };
    });
};

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

        try {
            const params = new URLSearchParams(window.location.search);
            const sharedResultsData = params.get('results');

            if (sharedResultsData) {
                const jsonString = decodeURIComponent(escape(atob(sharedResultsData)));
                const parsedResults: PartyAPIResult[] = JSON.parse(jsonString);

                if (Array.isArray(parsedResults) && parsedResults.length > 0) {
                    const enriched = enrichResultsData(parsedResults);
                    setResults(enriched);
                    setAppState(AppState.RESULTS);
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            }
        } catch (e) {
            console.error("Failed to load shared results from URL", e);
            window.history.replaceState({}, document.title, window.location.pathname);
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
                const enrichedResults = enrichResultsData(apiResults);
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
                   <WelcomeScreen
                        onStart={handleStart}
                        onShowHistory={() => setAppState(AppState.HISTORY)}
                        hasHistory={history.length > 0}
                    />
                );
            case AppState.GENERATING_QUESTIONS:
                return <Loader message="Generuji relevantní otázky pro aktuální rok..." />;
            case AppState.ANSWERING:
                 if (!currentQuestion) return null;
                return (
                    <AnsweringView
                        currentQuestion={currentQuestion}
                        currentAnswer={currentAnswer}
                        questionIndex={currentQuestionIndex}
                        totalQuestions={questions.length}
                        answeredCount={answeredQuestionsCount}
                        minAnswers={MIN_ANSWERS_TO_EVALUATE}
                        onAnswer={handleAnswer}
                        onToggleImportant={handleToggleImportant}
                        onReasonChange={handleReasonChange}
                        onPrev={goToPrevQuestion}
                        onNext={goToNextQuestion}
                        onEvaluate={handleEvaluate}
                    />
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
                    const isEnriched = item.results[0] && 'candidates' in item.results[0];
                    if (isEnriched) {
                        setViewingHistoryItem(item);
                        return;
                    }

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
                return <ErrorView error={error} onReset={handleReset} />;
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