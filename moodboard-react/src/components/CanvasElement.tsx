import React, { useRef, useState, useEffect } from 'react';
import type { CanvasItem } from '../types';
import clsx from 'clsx';

interface CanvasElementProps {
    item: CanvasItem;
    isSelected: boolean;
    onMouseDown: (e: React.PointerEvent) => void;
    onResizeStart: (e: React.PointerEvent, handle: string) => void;
    onUpdate: (updates: Partial<CanvasItem>) => void;
}

const CanvasElement: React.FC<CanvasElementProps> = ({ item, isSelected, onMouseDown, onResizeStart, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const contentRef = useRef<HTMLElement>(null);

    const handleDoubleClick = (e: React.MouseEvent) => {
        if (item.type === 'text' || item.type === 'note') {
            e.stopPropagation();
            setIsEditing(true);
        }
    };

    const handleBlur = () => {
        setIsEditing(false);
        if (contentRef.current) {
            onUpdate({ content: contentRef.current.innerText });
        }
    };

    useEffect(() => {
        if (isEditing && contentRef.current) {
            contentRef.current.focus();
            const range = document.createRange();
            range.selectNodeContents(contentRef.current);
            const sel = window.getSelection();
            sel?.removeAllRanges();
            sel?.addRange(range);
        }
    }, [isEditing]);

    const renderContent = () => {
        switch (item.type) {
            case 'note':
                return (
                    <div className="w-full h-full p-4 bg-gradient-to-br from-yellow-100 to-yellow-400 text-yellow-900 shadow-lg font-[Comic_Sans_MS]">
                        <p
                            ref={contentRef as React.RefObject<HTMLParagraphElement>}
                            className={clsx(
                                "text-sm font-medium leading-relaxed outline-none h-full",
                                !isEditing && "pointer-events-none select-none"
                            )}
                            contentEditable={isEditing}
                            onBlur={handleBlur}
                            onKeyDown={(e) => e.stopPropagation()}
                            onPointerDown={e => isEditing && e.stopPropagation()}
                        >
                            {item.content}
                        </p>
                    </div>
                );
            case 'text':
                // For text, we use fontSize from item or calculate it.
                // Actually the user wants drag border -> resize text.
                // Standard transform resize does this automatically if we use scale(), but here we change width/height.
                // To support text scaling via box resize, we could rely on a viewbox or just CSS font-size.
                // Let's use the explicit fontSize prop if available, or map height to font size.
                // Simple heuristic: font size ~= height * 0.7 for single line?
                // Or just use item.fontSize.
                const fSize = item.fontSize || 36;

                return (
                    <div className="w-full h-full flex items-center justify-center">
                        <h1
                            ref={contentRef as React.RefObject<HTMLHeadingElement>}
                            style={{ fontSize: `${fSize}px`, lineHeight: 1.2 }}
                            className={clsx(
                                "font-light tracking-widest text-white uppercase outline-none whitespace-pre-wrap text-center",
                                !isEditing && "pointer-events-none select-none"
                            )}
                            contentEditable={isEditing}
                            onBlur={handleBlur}
                            onKeyDown={(e) => e.stopPropagation()}
                            onPointerDown={e => isEditing && e.stopPropagation()}
                        >
                            {item.content}
                        </h1>
                    </div>
                );
            case 'image':
                return (
                    <div className="w-full h-full rounded-lg overflow-hidden bg-zinc-800">
                        <img
                            src={item.content}
                            className="w-full h-full object-cover pointer-events-none select-none"
                            draggable={false}
                            alt="Moodboard Asset"
                        />
                    </div>
                );
            case 'shape':
                const shapeClasses = clsx(
                    "w-full h-full flex items-center justify-center border-2 border-zinc-500 bg-zinc-800/50",
                    item.shapeType === 'circle' && "rounded-full",
                    item.shapeType === 'square' && "rounded-lg",
                    item.shapeType === 'triangle' && "!bg-transparent !border-0"
                );

                if (item.shapeType === 'triangle') {
                    return (
                        <div className="w-full h-full relative">
                            <div className="w-0 h-0 border-l-[transparent] border-r-[transparent] border-b-zinc-500/80 absolute inset-0"
                                style={{
                                    borderLeftWidth: `${(item.width || 0) / 2}px`,
                                    borderRightWidth: `${(item.width || 0) / 2}px`,
                                    borderBottomWidth: `${item.height}px`
                                }}
                            />
                        </div>
                    );
                }

                return <div className={shapeClasses} />;

            case 'arrow':
            case 'pen':
                return null;
        }
    };

    if (item.type === 'arrow') return null;

    // Resize Handles
    const handles = ['nw', 'ne', 'sw', 'se'];

    return (
        <div
            className={clsx(
                "absolute transition-shadow duration-100 group pointer-events-auto",
                isSelected ? "z-20" : "z-10",
                isSelected ? "ring-1 ring-[#E2B343]" : "hover:ring-1 hover:ring-white/30" // Hover effect
            )}
            style={{
                transform: `translate(${item.x}px, ${item.y}px) rotate(${item.rotation || 0}deg)`,
                width: item.width,
                height: item.height,
                cursor: isEditing ? 'text' : 'grab',
                touchAction: 'none'
            }}
            onPointerDown={!isEditing ? onMouseDown : undefined}
            onDoubleClick={handleDoubleClick}
            data-id={item.id}
        >
            {renderContent()}

            {isSelected && !isEditing && (
                <>
                    {/* Corner Handles */}
                    {handles.map(h => (
                        <div
                            key={h}
                            className={clsx(
                                "absolute w-3 h-3 bg-[#E2B343] border border-white rounded-full z-30",
                                h === 'nw' && "-top-1.5 -left-1.5 cursor-nwse-resize",
                                h === 'ne' && "-top-1.5 -right-1.5 cursor-nesw-resize",
                                h === 'sw' && "-bottom-1.5 -left-1.5 cursor-nesw-resize",
                                h === 'se' && "-bottom-1.5 -right-1.5 cursor-nwse-resize"
                            )}
                            onPointerDown={(e) => {
                                e.stopPropagation();
                                onResizeStart(e, h);
                            }}
                        />
                    ))}

                    {/* Edge Handles for Images/Text (Optional, but corners usually suffice. 
                        User asked for "mouse move to image border, drag to resize". 
                        Adding invisible or visible border triggers helps.) 
                    */}
                </>
            )}
        </div>
    );
};

export default CanvasElement;
