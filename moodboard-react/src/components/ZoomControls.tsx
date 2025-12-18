import React from 'react';
import { Minus, Plus, Maximize } from 'lucide-react';

interface ZoomControlsProps {
    scale: number;
    setScale: (scale: number) => void;
    onFitScreen: () => void;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({ scale, setScale, onFitScreen }) => {
    return (
        <div className="fixed bottom-10 right-8 z-50 flex items-center gap-3">
            <div className="bg-zinc-900/65 backdrop-blur-md px-3 py-2 rounded-xl flex items-center gap-3 border border-white/10 shadow-xl">
                <button
                    onClick={() => setScale(Math.max(0.1, scale - 0.1))}
                    className="text-zinc-400 hover:text-white transition"
                >
                    <Minus className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono w-10 text-center text-zinc-300 select-none">
                    {Math.round(scale * 100)}%
                </span>
                <button
                    onClick={() => setScale(Math.min(5, scale + 0.1))}
                    className="text-zinc-400 hover:text-white transition"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            <button
                onClick={onFitScreen}
                className="bg-zinc-900/65 backdrop-blur-md w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white transition border border-white/10 shadow-xl"
                title="适配屏幕"
            >
                <Maximize className="w-4 h-4" />
            </button>
        </div>
    );
};

export default ZoomControls;
