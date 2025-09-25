
import React, { useState } from 'react';
import type { PartyResult } from '../types';

interface ResultsTableProps {
    results: PartyResult[];
    onReset: () => void;
    isHistoryView?: boolean;
}

const getColorForPercentage = (percentage: number): string => {
    if (percentage > 75) return 'bg-green-500';
    if (percentage > 50) return 'bg-yellow-500';
    if (percentage > 25) return 'bg-orange-500';
    return 'bg-red-500';
};

const ResultsTable: React.FC<ResultsTableProps> = ({ results, onReset, isHistoryView = false }) => {
    const [expanded, setExpanded] = useState<string | null>(null);

    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-6 bg-secondary border border-gray-700 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-center mb-6 text-accent">Výsledky vaší volby</h2>
            <div className="space-y-4">
                {results.map((party, index) => (
                    <div key={party.name} className="border border-gray-700 rounded-lg overflow-hidden transition-all duration-300">
                        <button 
                            className="w-full p-4 flex items-center justify-between focus:outline-none bg-gray-800 hover:bg-gray-700"
                            onClick={() => setExpanded(expanded === party.name ? null : party.name)}
                            aria-expanded={expanded === party.name}
                            aria-controls={`party-details-${index}`}
                        >
                            <div className="flex items-center text-left">
                                <span className="text-2xl font-bold text-dark-text w-12">{index + 1}.</span>
                                <span className="text-xl font-semibold text-light-text">{party.name}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                               <div className="w-48 bg-gray-700 rounded-full h-4" role="progressbar" aria-valuenow={party.matchPercentage} aria-valuemin={0} aria-valuemax={100}>
                                    <div 
                                        className={`${getColorForPercentage(party.matchPercentage)} h-4 rounded-full transition-width duration-500`} 
                                        style={{ width: `${party.matchPercentage}%` }}
                                    ></div>
                                </div>
                                <span className="text-lg font-bold text-light-text w-16 text-right">{party.matchPercentage}%</span>
                                <svg 
                                    className={`w-6 h-6 text-dark-text transform transition-transform ${expanded === party.name ? 'rotate-180' : ''}`} 
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </div>
                        </button>
                        {expanded === party.name && (
                            <div id={`party-details-${index}`} className="p-6 bg-secondary border-t border-gray-700">
                                <p className="mb-4 text-light-text">
                                    <strong className="text-accent">Zdůvodnění AI:</strong> {party.reasoning}
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-dark-text">
                                    <div><strong className="text-light-text">Lídr:</strong> {party.leader}</div>
                                    <div><strong className="text-light-text">Motto:</strong> "{party.motto}"</div>
                                    <div className="md:col-span-2"><strong className="text-light-text">Ideologie:</strong> {party.ideology}</div>
                                    <div className="md:col-span-2"><strong className="text-light-text">Shrnutí:</strong> {party.summary}</div>
                                    <div><strong className="text-light-text">Kandidáti:</strong> {party.candidates.join(', ')}</div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="text-center mt-8">
                <button
                    onClick={onReset}
                    className="bg-accent text-primary font-bold py-2 px-6 rounded-lg hover:bg-blue-400 transition-colors"
                >
                    {isHistoryView ? 'Zpět do historie' : 'Zkusit znovu'}
                </button>
            </div>
        </div>
    );
};

export default ResultsTable;