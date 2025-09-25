import React from 'react';
import { electionInfo } from '../data/electionData';

interface WelcomeScreenProps {
    onStart: () => void;
    onShowHistory: () => void;
    hasHistory: boolean;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, onShowHistory, hasHistory }) => (
    <div className="text-center p-8 bg-secondary rounded-lg shadow-lg border border-gray-700">
        <h1 className="text-4xl font-bold text-accent mb-2">Mandátor&nbsp;{electionInfo.year}</h1>
        <p className="text-lg text-dark-text mb-6">{electionInfo.name}</p>
        <p className="max-w-2xl mx-auto mb-8">
            Odpovězte na sadu otázek a naše umělá inteligence vám ukáže, která politická strana nejlépe odpovídá vašim názorům.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button onClick={onStart} className="bg-accent text-primary font-bold text-xl py-3 px-8 rounded-lg hover:bg-blue-400 transition-colors w-full sm:w-auto">
                Spustit kalkulačku
            </button>
            {hasHistory && (
                <button onClick={onShowHistory} className="bg-gray-600 text-light-text font-bold text-xl py-3 px-8 rounded-lg hover:bg-gray-500 transition-colors w-full sm:w-auto">
                    Zobrazit historii
                </button>
            )}
        </div>
    </div>
);

export default WelcomeScreen;
