import React, { useEffect } from 'react';
import {
    MousePointer2, Hand, StickyNote, Type, Image as ImageIcon,
    Shapes, ArrowUpRight, PenTool, Undo2, Redo2, Eraser
} from 'lucide-react';
import type { ToolType, ShapeType } from '../types';
import clsx from 'clsx';
import { useCanvasState } from '../useCanvasState';

interface ToolbarProps {
    activeTool: ToolType;
    onSelectTool: (tool: ToolType) => void;
    activeShape: ShapeType;
    onSelectShape: (shape: ShapeType) => void;
    canvasState?: ReturnType<typeof useCanvasState>;
}

const Toolbar: React.FC<ToolbarProps> = ({ activeTool, onSelectTool, activeShape, onSelectShape, canvasState }) => {

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && canvasState) {
                if (canvasState.state.selectedIds.length > 0) {
                    canvasState.deleteItems(canvasState.state.selectedIds);
                }
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                if (e.shiftKey) {
                    canvasState?.redo();
                } else {
                    canvasState?.undo();
                }
                e.preventDefault();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                canvasState?.redo();
                e.preventDefault();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [canvasState]);

    const historyTools = [
        { id: 'undo', icon: Undo2, label: 'Undo (Ctrl+Z)', action: () => canvasState?.undo(), disabled: !canvasState?.canUndo },
        { id: 'redo', icon: Redo2, label: 'Redo (Ctrl+Y)', action: () => canvasState?.redo(), disabled: !canvasState?.canRedo },
    ];

    const modeTools: { id: ToolType; icon: React.ElementType; label: string }[] = [
        { id: 'select', icon: MousePointer2, label: 'Select (V)' },
        { id: 'hand', icon: Hand, label: 'Hand (H)' },
        { id: 'pen', icon: PenTool, label: 'Pen' },
        { id: 'eraser', icon: Eraser, label: 'Eraser' },
    ];

    const createTools: { id: ToolType; icon: React.ElementType; label: string }[] = [
        { id: 'image', icon: ImageIcon, label: 'Image' },
        { id: 'note', icon: StickyNote, label: 'Sticky Note' },
        { id: 'text', icon: Type, label: 'Text' },
        { id: 'shape', icon: Shapes, label: 'Shape' },
        { id: 'arrow', icon: ArrowUpRight, label: 'Arrow' },
    ];

    const shapes: { id: ShapeType; label: string }[] = [
        { id: 'circle', label: 'Circle' },
        { id: 'square', label: 'Square' },
        { id: 'triangle', label: 'Triangle' },
    ];

    const colors = ['#E2B343', '#ef4444', '#22c55e', '#3b82f6', '#a855f7', '#000000', '#ffffff'];
    const widths = [2, 5, 10, 15];

    const renderToolBtn = (tool: { id: ToolType; icon: React.ElementType; label: string }) => (
        <div key={tool.id} className="relative group">
            <button
                onClick={() => onSelectTool(tool.id)}
                className={clsx(
                    "p-2 rounded-lg transition-all duration-200 hover:bg-zinc-800 hover:text-zinc-100",
                    activeTool === tool.id && "bg-[#E2B343] text-zinc-900 shadow-[0_0_15px_rgba(226,179,67,0.3)] hover:bg-[#E2B343] hover:text-zinc-900"
                )}
                title={tool.label}
            >
                <tool.icon size={20} strokeWidth={2.5} />
            </button>

            {/* Shape Popover */}
            {tool.id === 'shape' && activeTool === 'shape' && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 p-1 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl flex gap-1 z-50">
                    {shapes.map(shape => (
                        <button
                            key={shape.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelectShape(shape.id);
                            }}
                            className={clsx(
                                "w-8 h-8 flex items-center justify-center rounded hover:bg-zinc-800",
                                activeShape === shape.id && "bg-zinc-800 text-[#E2B343]"
                            )}
                            title={shape.label}
                        >
                            <div className={clsx(
                                "border-2 border-current",
                                shape.id === 'circle' && "w-4 h-4 rounded-full",
                                shape.id === 'square' && "w-4 h-4 rounded-sm",
                                shape.id === 'triangle' && "w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-t-0 bg-transparent border-current !border-2-0"
                            )} />
                        </button>
                    ))}
                </div>
            )}

            {/* Pen Options Popover (Color + Width) */}
            {tool.id === 'pen' && activeTool === 'pen' && canvasState && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 p-3 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl flex flex-col gap-3 z-50 w-48">
                    {/* Colors */}
                    <div className="flex flex-wrap gap-2 justify-center">
                        {colors.map(c => (
                            <button
                                key={c}
                                className={clsx(
                                    "w-6 h-6 rounded-full border border-zinc-600 hover:scale-110 transition-transform",
                                    canvasState.state.penColor === c && "ring-2 ring-white"
                                )}
                                style={{ backgroundColor: c }}
                                onClick={() => canvasState.setPenColor(c)}
                            />
                        ))}
                    </div>
                    {/* Widths */}
                    <div className="border-t border-zinc-700 pt-2 flex items-center justify-center gap-3">
                        {widths.map(w => (
                            <button
                                key={w}
                                onClick={() => canvasState.setPenWidth(w)}
                                className={clsx(
                                    "rounded-full bg-zinc-600 hover:bg-zinc-500 flex items-center justify-center w-8 h-8",
                                    canvasState.state.penWidth === w && "ring-2 ring-[#E2B343]"
                                )}
                            >
                                <div className="bg-white rounded-full" style={{ width: w, height: w }} />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center z-50 gap-2">
            <div className="bg-zinc-900/90 backdrop-blur-md border border-zinc-800 text-zinc-400 p-2 rounded-xl shadow-2xl flex items-center gap-1">
                {historyTools.map((tool) => (
                    <button
                        key={tool.id}
                        onClick={tool.action}
                        disabled={tool.disabled}
                        className={clsx(
                            "p-2 rounded-lg transition-all duration-200 hover:bg-zinc-800 hover:text-zinc-100",
                            tool.disabled && "opacity-30 cursor-not-allowed hover:bg-transparent hover:text-zinc-400"
                        )}
                        title={tool.label}
                    >
                        <tool.icon size={20} strokeWidth={2.5} />
                    </button>
                ))}

                <div className="w-[1px] h-6 bg-zinc-800 mx-1" />
                {modeTools.map(renderToolBtn)}
                <div className="w-[1px] h-6 bg-zinc-800 mx-1" />
                {createTools.map(renderToolBtn)}
            </div>

            <div className="text-[10px] text-zinc-600 px-2 select-none shadow-sm">
                Space 抓手 • Delete 删除 • Ctrl+Z 撤销
            </div>
        </div>
    );
};

export default Toolbar;
