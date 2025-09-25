import React, { useState, useEffect } from 'react';
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
    const [copied, setCopied] = useState(false);
    const [rendered, setRendered] = useState(false);
    const [isWebShareSupported, setIsWebShareSupported] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setRendered(true), 100);
        if (navigator.share) {
            setIsWebShareSupported(true);
        }
        return () => clearTimeout(timer);
    }, []);

    const generateShareUrl = () => {
        const shareableResults = results.map(({ name, matchPercentage, reasoning }) => ({
            name,
            matchPercentage,
            reasoning,
        }));
        try {
            const jsonString = JSON.stringify(shareableResults);
            const encoded = btoa(unescape(encodeURIComponent(jsonString)));
            return `${window.location.origin}${window.location.pathname}?results=${encoded}`;
        } catch (e) {
            console.error("Failed to generate share URL", e);
            return window.location.origin;
        }
    };

    const handleCopy = () => {
        const url = generateShareUrl();
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    
    const handleNativeShare = async () => {
        const url = generateShareUrl();
        const topResult = results[0];
        const text = `Moje nejvyšší shoda ve volební kalkulačce Mandátor je ${topResult.name} (${topResult.matchPercentage}%)! Zjistěte tu svou.`;
        const title = 'Výsledek mé volební kalkulačky';

        try {
            await navigator.share({
                title: title,
                text: text,
                url: url,
            });
        } catch (error) {
            console.error('Chyba při sdílení:', error);
        }
    };

    const handleShare = (platform: 'twitter' | 'facebook') => {
        const url = generateShareUrl();
        const topResult = results[0];
        const text = `Moje nejvyšší shoda ve volební kalkulačce Mandátor je ${topResult.name} (${topResult.matchPercentage}%)! Zjistěte tu svou:`;
        
        let shareUrl = '';
        if (platform === 'twitter') {
            shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        } else if (platform === 'facebook') {
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        }
        window.open(shareUrl, '_blank', 'noopener,noreferrer');
    };

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
                                        className={`${getColorForPercentage(party.matchPercentage)} h-4 rounded-full transition-all duration-1000 ease-out`} 
                                        style={{ width: rendered ? `${party.matchPercentage}%` : '0%' }}
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
             <div className="text-center mt-8 flex flex-col items-center gap-6">
                <div>
                    <h3 className="text-lg font-semibold text-light-text mb-3">Sdílet výsledek</h3>
                    <div className="flex items-center justify-center flex-wrap gap-3">
                        {isWebShareSupported && (
                             <button onClick={handleNativeShare} className="bg-accent hover:bg-blue-400 text-primary font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2" aria-label="Sdílet výsledek">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                                Sdílet
                            </button>
                        )}
                        <button onClick={handleCopy} className="relative bg-gray-700 hover:bg-gray-600 text-light-text font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2" aria-label="Kopírovat odkaz">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8 4a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zM6 4a3 3 0 013-3h2a3 3 0 013 3v1h-1V4a2 2 0 00-2-2h-2a2 2 0 00-2 2v1H6V4zm2 5a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zM4 9a1 1 0 00-1 1v7a1 1 0 001 1h8a1 1 0 001-1v-7a1 1 0 00-1-1H4z"></path></svg>
                             {copied ? 'Odkaz zkopírován!' : 'Kopírovat odkaz'}
                        </button>
                        <button onClick={() => handleShare('twitter')} className="bg-[#1DA1F2] hover:bg-[#1a91da] text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2" aria-label="Sdílet na Twitter">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-.424.727-.666 1.561-.666 2.477 0 1.61.82 3.027 2.053 3.848-.764-.024-1.482-.234-2.11-.583v.062c0 2.256 1.605 4.14 3.737 4.568-.39.106-.803.163-1.227.163-.3 0-.593-.028-.877-.082.593 1.85 2.307 3.198 4.342 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.092 7.14 2.092 8.57 0 13.255-7.098 13.255-13.254 0-.202-.005-.403-.014-.602A9.46 9.46 0 0024 4.557z"></path></svg>
                        </button>
                        <button onClick={() => handleShare('facebook')} className="bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2" aria-label="Sdílet na Facebook">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path></svg>
                        </button>
                    </div>
                </div>
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