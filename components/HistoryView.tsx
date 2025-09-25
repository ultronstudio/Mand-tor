import React from 'react';
import type { SavedResult } from '../types';

interface HistoryViewProps {
    history: SavedResult[];
    onViewItem: (item: SavedResult) => void;
    onBack: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onViewItem, onBack }) => {
    return (
        <div className="w-full max-w-2xl mx-auto p-4 md:p-6 bg-secondary border border-gray-700 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-center mb-6 text-accent">Historie výsledků</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {history.length > 0 ? (
                    history.map((item, index) => {
                        const reasons = item.answers
                            ?.filter(a => a.isImportant && a.reason?.trim())
                            .map(a => a.reason!.trim());
                        
                        const hasReasons = reasons && reasons.length > 0;

                        return (
                            <div key={index} className="relative group">
                                <button
                                    onClick={() => onViewItem(item)}
                                    className="w-full p-4 text-left bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
                                >
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-light-text">Výsledek z: {new Date(item.date).toLocaleString('cs-CZ')}</p>
                                        {hasReasons && (
                                             <span title="Tento výsledek obsahuje poznámky">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                </svg>
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-dark-text mt-1">Nejvyšší shoda: {item.results[0].name} ({item.results[0].matchPercentage}%)</p>
                                </button>
                                
                                {hasReasons && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-primary border border-gray-600 rounded-lg shadow-lg text-sm text-light-text opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 z-10 pointer-events-none">
                                        <h4 className="font-bold mb-2 text-accent">Vaše poznámky:</h4>
                                        <ul className="list-disc list-inside space-y-1">
                                            {reasons.slice(0, 3).map((reason, i) => (
                                                <li key={i} className="truncate">{reason}</li>
                                            ))}
                                        </ul>
                                        {reasons.length > 3 && <p className="text-xs text-dark-text mt-2">... a další.</p>}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-600"></div>
                                    </div>
                                )}
                            </div>
                        )
                    })
                ) : (
                    <p className="text-center text-dark-text">Zatím nemáte žádné uložené výsledky.</p>
                )}
            </div>
            <div className="text-center mt-8">
                <button
                    onClick={onBack}
                    className="bg-gray-600 text-light-text font-bold py-2 px-6 rounded-lg hover:bg-gray-500 transition-colors"
                >
                    Zpět na úvod
                </button>
            </div>
        </div>
    );
};

export default HistoryView;