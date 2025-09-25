import React, { useEffect } from 'react';
import type { Question, Answer } from '../types';
import { AnswerChoice } from '../types';

const StarIcon: React.FC<{ isImportant: boolean; onClick: () => void }> = ({ isImportant, onClick }) => (
    <button onClick={onClick} className="p-2 rounded-full hover:bg-yellow-400/20 transition-colors focus:outline-none" aria-label="Označit jako důležité (šipka nahoru)">
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 transition-colors ${isImportant ? 'text-yellow-400 fill-current' : 'text-gray-500'}`} viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
    </button>
);

interface AnsweringViewProps {
    currentQuestion: Question;
    currentAnswer: Answer | undefined;
    questionIndex: number;
    totalQuestions: number;
    answeredCount: number;
    minAnswers: number;
    onAnswer: (choice: AnswerChoice) => void;
    onToggleImportant: () => void;
    onReasonChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onPrev: () => void;
    onNext: () => void;
    onEvaluate: () => void;
}

const AnsweringView: React.FC<AnsweringViewProps> = ({
    currentQuestion,
    currentAnswer,
    questionIndex,
    totalQuestions,
    answeredCount,
    minAnswers,
    onAnswer,
    onToggleImportant,
    onReasonChange,
    onPrev,
    onNext,
    onEvaluate,
}) => {

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }

            switch (e.key) {
                case 'ArrowRight':
                    onAnswer(AnswerChoice.YES);
                    break;
                case 'ArrowLeft':
                    onAnswer(AnswerChoice.NO);
                    break;
                case 'ArrowUp':
                    onToggleImportant();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onAnswer, onToggleImportant]);


    const progress = ((questionIndex + 1) / totalQuestions) * 100;

    return (
        <div className="w-full max-w-3xl mx-auto p-4 md:p-6 bg-secondary border border-gray-700 rounded-lg shadow-lg">
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-dark-text">Otázka {questionIndex + 1} / {totalQuestions}</span>
                    <span className="text-sm font-semibold text-dark-text">Odpovězeno: {answeredCount}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div className="bg-accent h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
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
                            onChange={onReasonChange}
                            rows={3}
                        />
                    </div>
                )}
            </div>

            <div className="flex items-center justify-center space-x-4 my-6">
                <button title="Šipka vlevo" onClick={() => onAnswer(AnswerChoice.NO)} className="w-32 bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-500 transition-transform transform hover:scale-105">
                    Ne
                </button>
                <StarIcon isImportant={!!currentAnswer?.isImportant} onClick={onToggleImportant} />
                <button title="Šipka vpravo" onClick={() => onAnswer(AnswerChoice.YES)} className="w-32 bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-500 transition-transform transform hover:scale-105">
                    Ano
                </button>
            </div>
            
            <div className="flex justify-between items-center mt-8">
                <button onClick={onPrev} disabled={questionIndex === 0} className="px-4 py-2 bg-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-600">Předchozí</button>
                <button onClick={onNext} disabled={questionIndex === totalQuestions - 1} className="px-4 py-2 bg-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-600">Přeskočit</button>
                <button onClick={onEvaluate} disabled={answeredCount < minAnswers} className="px-6 py-3 bg-accent text-primary font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-400">
                    Vyhodnotit ({answeredCount}/{minAnswers})
                </button>
            </div>
        </div>
    );
};

export default AnsweringView;
