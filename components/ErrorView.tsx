import React from 'react';

interface ErrorViewProps {
    error: string | null;
    onReset: () => void;
}

const ErrorView: React.FC<ErrorViewProps> = ({ error, onReset }) => (
    <div className="text-center p-8 bg-red-900/50 border border-red-500 rounded-lg">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Došlo k chybě</h2>
        <p className="text-light-text mb-6">{error}</p>
        <button onClick={onReset} className="bg-accent text-primary font-bold py-2 px-6 rounded-lg hover:bg-blue-400">
            Zkusit znovu
        </button>
    </div>
);

export default ErrorView;
