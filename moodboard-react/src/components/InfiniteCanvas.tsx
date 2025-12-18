import React, { useRef, useState } from 'react';
import { useCanvasState } from '../useCanvasState';
import type { CanvasItem } from '../types';
import CanvasElement from './CanvasElement';
import { v4 as uuidv4 } from 'uuid';
import clsx from 'clsx';

interface InfiniteCanvasProps {
    canvasState: ReturnType<typeof useCanvasState>;
}

const InfiniteCanvas: React.FC<InfiniteCanvasProps> = ({ canvasState }) => {
    const {
        state, setScale, setPanOffset, addItem, updateItem, selectItem, setActiveTool,
        deleteItems, saveHistory
    } = canvasState;
    const containerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [interaction, setInteraction] = useState<{
        mode: 'none' | 'panning' | 'dragging' | 'resizing' | 'drawing_arrow' | 'drawing_pen' | 'drawing_shape' | 'erasing' | 'arrow_handle';
        startX: number;
        startY: number;
        startPan: { x: number, y: number };
        resizeHandle?: string;
        initialItem?: CanvasItem;
        currentPath?: string;
    }>({
        mode: 'none',
        startX: 0,
        startY: 0,
        startPan: { x: 0, y: 0 }
    });

    const getCanvasPoint = (clientX: number, clientY: number) => {
        if (!containerRef.current) return { x: 0, y: 0 };
        const rect = containerRef.current.getBoundingClientRect();
        return {
            x: (clientX - rect.left - state.panOffset.x) / state.scale,
            y: (clientY - rect.top - state.panOffset.y) / state.scale
        };
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) e.preventDefault();

        const zoomSpeed = 0.001;
        const delta = -e.deltaY * zoomSpeed;
        const newScale = Math.min(Math.max(0.1, state.scale + delta), 5);

        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const newPanX = mouseX - (mouseX - state.panOffset.x) * (newScale / state.scale);
        const newPanY = mouseY - (mouseY - state.panOffset.y) * (newScale / state.scale);

        if (state.scale !== newScale) {
            setScale(newScale);
            setPanOffset({ x: newPanX, y: newPanY });
        }
    };

    // --- POINTER DOWN ---
    const handlePointerDown = (e: React.PointerEvent) => {
        if (!containerRef.current) return;

        // Panning check
        if (state.activeTool === 'hand' || e.button === 1 || e.buttons === 4) {
            containerRef.current.setPointerCapture(e.pointerId);
            setInteraction({
                mode: 'panning',
                startX: e.clientX,
                startY: e.clientY,
                startPan: { ...state.panOffset }
            });
            return;
        }

        const pt = getCanvasPoint(e.clientX, e.clientY);

        // --- Eraser ---
        if (state.activeTool === 'eraser') {
            setInteraction({
                mode: 'erasing',
                startX: e.clientX,
                startY: e.clientY,
                startPan: { x: 0, y: 0 }
            });
            handleEraser(e.clientX, e.clientY);
            return;
        }

        // --- Arrow Drawing ---
        if (state.activeTool === 'arrow') {
            const newItem: CanvasItem = {
                id: uuidv4(),
                type: 'arrow',
                x: pt.x,
                y: pt.y,
                width: 0, height: 0,
                content: '',
            };
            addItem(newItem);
            selectItem(newItem.id);
            setInteraction({
                mode: 'drawing_arrow',
                startX: e.clientX,
                startY: e.clientY,
                startPan: { x: 0, y: 0 },
                initialItem: newItem
            });
            return;
        }

        // --- Pen Drawing ---
        if (state.activeTool === 'pen') {
            const newItem: CanvasItem = {
                id: uuidv4(),
                type: 'pen',
                x: 0, y: 0,
                width: 0, height: 0,
                content: `M ${pt.x} ${pt.y}`,
                strokeColor: state.penColor,
                strokeWidth: state.penWidth ?? 5
            };
            addItem(newItem);
            selectItem(null);

            setInteraction({
                mode: 'drawing_pen',
                startX: e.clientX,
                startY: e.clientY,
                startPan: { x: 0, y: 0 },
                initialItem: newItem,
                currentPath: newItem.content
            });
            return;
        }

        // --- Shape Drag-Create ---
        if (state.activeTool === 'shape') {
            const newItem: CanvasItem = {
                id: uuidv4(),
                type: 'shape',
                shapeType: state.activeShape,
                x: pt.x,
                y: pt.y,
                width: 1, height: 1,
                content: ''
            };
            addItem(newItem);
            selectItem(newItem.id);
            setInteraction({
                mode: 'drawing_shape',
                startX: e.clientX,
                startY: e.clientY,
                startPan: { x: 0, y: 0 },
                initialItem: newItem
            });
            return;
        }

        // --- Click Create (Note, Text, Image) ---
        if (['note', 'text', 'image'].includes(state.activeTool)) {
            let newItem: CanvasItem | null = null;
            const id = uuidv4();
            switch (state.activeTool) {
                case 'note':
                    newItem = { id, type: 'note', x: pt.x - 100, y: pt.y - 100, width: 200, height: 200, content: 'New Note' };
                    break;
                case 'text':
                    newItem = { id, type: 'text', x: pt.x, y: pt.y - 30, width: 300, height: 60, fontSize: 36, content: 'Type Here' };
                    break;
                case 'image':
                    if (fileInputRef.current) {
                        fileInputRef.current.setAttribute('data-x', pt.x.toString());
                        fileInputRef.current.setAttribute('data-y', pt.y.toString());
                        fileInputRef.current.click();
                    }
                    return;
            }
            if (newItem) {
                addItem(newItem);
                saveHistory();
                selectItem(newItem.id);
                setActiveTool('select');
            }
            return;
        }

        // --- Background Click (Deselect) ---
        if (state.activeTool === 'select') {
            // We can use e.target to verify if we hit the container or our content wrapper
            // Due to z-indexing, if we hit the SVG wrapper, that counts as background.
            const target = e.target as HTMLElement;
            if (target === containerRef.current || target.id === 'canvas-content' || target.tagName === 'svg') {
                selectItem(null);
                containerRef.current.setPointerCapture(e.pointerId);
                setInteraction({
                    mode: 'panning',
                    startX: e.clientX,
                    startY: e.clientY,
                    startPan: { ...state.panOffset }
                });
            }
        }
    };

    // --- ERASER ---
    const handleEraser = (clientX: number, clientY: number) => {
        const elements = document.elementsFromPoint(clientX, clientY);
        // Find FIRST valid hit, could be SVG path or HTML element
        const hitEl = elements.find(el => el.hasAttribute('data-id'));
        const hitId = hitEl?.getAttribute('data-id');

        if (hitId) {
            deleteItems([hitId]);
            return;
        }
    };

    // --- POINTER MOVE ---
    const handlePointerMove = (e: React.PointerEvent) => {
        if (interaction.mode === 'none') return;

        const dx = e.clientX - interaction.startX;
        const dy = e.clientY - interaction.startY;

        if (interaction.mode === 'panning') {
            setPanOffset({
                x: interaction.startPan.x + dx,
                y: interaction.startPan.y + dy
            });
        }
        else if (interaction.mode === 'erasing') {
            handleEraser(e.clientX, e.clientY);
        }
        else if (interaction.mode === 'dragging' && interaction.initialItem) {
            const scaleDx = dx / state.scale;
            const scaleDy = dy / state.scale;
            updateItem(interaction.initialItem.id, {
                x: interaction.initialItem.x + scaleDx,
                y: interaction.initialItem.y + scaleDy
            });
        }
        else if (interaction.mode === 'resizing' && interaction.initialItem && interaction.resizeHandle) {
            const scaleDx = dx / state.scale;
            const scaleDy = dy / state.scale;
            const item = interaction.initialItem;
            let newW = item.width || 100;
            let newH = item.height || 100;
            let newX = item.x;
            let newY = item.y;
            if (interaction.resizeHandle.includes('e')) newW += scaleDx;
            if (interaction.resizeHandle.includes('s')) newH += scaleDy;
            if (interaction.resizeHandle.includes('w')) { newW -= scaleDx; newX += scaleDx; }
            if (interaction.resizeHandle.includes('n')) { newH -= scaleDy; newY += scaleDy; }
            const finalW = Math.max(20, newW);
            const finalH = Math.max(20, newH);
            const updates: Partial<CanvasItem> = {
                width: finalW, height: finalH, x: newX, y: newY
            };
            if (item.type === 'text') {
                updates.fontSize = finalH * 0.6;
            }
            updateItem(item.id, updates);
        }
        else if (interaction.mode === 'arrow_handle' && interaction.initialItem && interaction.resizeHandle) {
            const scaleDx = dx / state.scale;
            const scaleDy = dy / state.scale;
            const item = interaction.initialItem;

            const oldStartX = item.x;
            const oldStartY = item.y;
            const oldEndX = oldStartX + (item.width || 0);
            const oldEndY = oldStartY + (item.height || 0);

            if (interaction.resizeHandle === 'start') {
                const newStartX = oldStartX + scaleDx;
                const newStartY = oldStartY + scaleDy;
                updateItem(item.id, {
                    x: newStartX,
                    y: newStartY,
                    width: oldEndX - newStartX,
                    height: oldEndY - newStartY
                });
            } else { // end
                const newEndX = oldEndX + scaleDx;
                const newEndY = oldEndY + scaleDy;
                updateItem(item.id, {
                    width: newEndX - oldStartX,
                    height: newEndY - oldStartY
                });
            }
        }
        else if (interaction.mode === 'drawing_shape' && interaction.initialItem) {
            const pt = getCanvasPoint(e.clientX, e.clientY);
            const w = pt.x - interaction.initialItem.x;
            const h = pt.y - interaction.initialItem.y;
            updateItem(interaction.initialItem.id, {
                x: w < 0 ? pt.x : interaction.initialItem.x,
                y: h < 0 ? pt.y : interaction.initialItem.y,
                width: Math.abs(w),
                height: Math.abs(h)
            });
        }
        else if (interaction.mode === 'drawing_arrow' && interaction.initialItem) {
            const pt = getCanvasPoint(e.clientX, e.clientY);
            updateItem(interaction.initialItem.id, {
                width: pt.x - interaction.initialItem.x,
                height: pt.y - interaction.initialItem.y
            });
        }
        else if (interaction.mode === 'drawing_pen' && interaction.initialItem) {
            const pt = getCanvasPoint(e.clientX, e.clientY);
            const newPath = `${interaction.currentPath} L ${pt.x} ${pt.y}`;
            setInteraction(prev => ({ ...prev, currentPath: newPath }));
            updateItem(interaction.initialItem.id, { content: newPath });
        }
    };

    // --- POINTER UP ---
    const handlePointerUp = () => {
        if (['dragging', 'resizing', 'drawing_arrow', 'drawing_pen', 'drawing_shape', 'arrow_handle'].includes(interaction.mode)) {
            if (interaction.mode === 'drawing_shape' && interaction.initialItem) {
                const item = state.items.find(i => i.id === interaction.initialItem?.id);
                if (item && (item.width || 0) < 5 && (item.height || 0) < 5) {
                    updateItem(item.id, { width: 100, height: 100 });
                }
            }
            saveHistory();
        }

        setInteraction({ mode: 'none', startX: 0, startY: 0, startPan: { x: 0, y: 0 } });
    };

    const handleElementMouseDown = (e: React.PointerEvent, item: CanvasItem) => {
        if (state.activeTool !== 'select') return;

        e.stopPropagation();
        selectItem(item.id);

        setInteraction({
            mode: 'dragging',
            startX: e.clientX,
            startY: e.clientY,
            startPan: { x: 0, y: 0 },
            initialItem: { ...item }
        });
    };

    const handleResizeStart = (e: React.PointerEvent, handle: string) => {
        e.stopPropagation();
        if (state.selectedIds.length === 0) return;
        const id = state.selectedIds[0];
        const item = state.items.find(i => i.id === id);
        if (!item) return;

        setInteraction({
            mode: 'resizing',
            startX: e.clientX,
            startY: e.clientY,
            startPan: { x: 0, y: 0 },
            resizeHandle: handle,
            initialItem: { ...item }
        });
    };

    const handleArrowHandleDown = (e: React.PointerEvent, item: CanvasItem, handle: 'start' | 'end') => {
        e.stopPropagation();
        selectItem(item.id);
        setInteraction({
            mode: 'arrow_handle',
            startX: e.clientX,
            startY: e.clientY,
            startPan: { x: 0, y: 0 },
            resizeHandle: handle,
            initialItem: { ...item }
        });
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            const pt = getCanvasPoint(e.clientX, e.clientY);
            processFile(file, pt.x, pt.y);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && fileInputRef.current) {
            const x = parseFloat(fileInputRef.current.getAttribute('data-x') || '0');
            const y = parseFloat(fileInputRef.current.getAttribute('data-y') || '0');
            processFile(file, x, y);
            e.target.value = '';
        }
    };

    const processFile = (file: File, x: number, y: number) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                let w = img.width;
                let h = img.height;
                if (w > 400) {
                    h = (400 / w) * h;
                    w = 400;
                }
                addItem({
                    id: uuidv4(),
                    type: 'image',
                    x: x,
                    y: y,
                    width: w,
                    height: h,
                    content: ev.target?.result as string
                });
                saveHistory();
                setActiveTool('select');
            };
            img.src = ev.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const bgSize = 24 * state.scale;
    const bgPos = `${state.panOffset.x % bgSize}px ${state.panOffset.y % bgSize}px`;

    // Separate items by type but maintain global order for correct z-index
    // The previous implementation separated Pen/Arrow into an SVG layer ON TOP of HTML layer.
    // This caused Pen/Arrow to ALWAYS be on top of images/notes, regardless of creation order.
    // To respect Z-index based on creation time (array order), we must render them in a single loop.
    // HOWEVER, Pen strokes are SVG paths, while Images/Notes are HTML divs.
    // We can't nest HTML inside SVG easily (foreignObject has issues).
    // Better approach: 
    // Render ONE SVG layer for ALL paths/arrows at the bottom (if we accept they are below HTML) ? NO.
    // Render individual SVGs for each Pen/Arrow item interleaved with HTML items? YES.

    return (
        <div
            ref={containerRef}
            className={clsx(
                "infinite-canvas w-full h-full relative overflow-hidden bg-[#18181b]",
                state.activeTool === 'hand' || interaction.mode === 'panning' ? "cursor-grab active:cursor-grabbing" : "cursor-default",
                (state.activeTool === 'pen' || state.activeTool === 'arrow' || state.activeTool === 'shape' || state.activeTool === 'eraser') && "cursor-crosshair"
            )}
            style={{
                backgroundSize: `${bgSize}px ${bgSize}px`,
                backgroundPosition: bgPos,
                backgroundImage: 'radial-gradient(circle, #3f3f46 1px, transparent 1px)'
            }}
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
        >
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileInputChange}
            />

            <div
                id="canvas-content"
                style={{
                    transform: `translate(${state.panOffset.x}px, ${state.panOffset.y}px) scale(${state.scale})`,
                    transformOrigin: '0 0',
                    width: '100%', height: '100%',
                    position: 'absolute',
                }}
            >
                {state.items.map(item => {
                    // Render Pen/Arrow as individual SVGs to maintain z-order with HTML elements
                    if (item.type === 'pen') {
                        return (
                            <svg key={item.id} className="absolute top-0 left-0 w-full h-full overflow-visible pointer-events-none z-10">
                                <path
                                    data-id={item.id}
                                    d={item.content}
                                    stroke={item.strokeColor || '#E2B343'}
                                    strokeWidth={item.strokeWidth || 5}
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="pointer-events-auto cursor-crosshair"
                                    onPointerDown={(e) => handleElementMouseDown(e, item)}
                                />
                            </svg>
                        );
                    }
                    if (item.type === 'arrow') {
                        const startX = item.x;
                        const startY = item.y;
                        const endX = startX + (item.width || 0);
                        const endY = startY + (item.height || 0);
                        const isSelected = state.selectedIds.includes(item.id);
                        return (
                            <svg key={item.id} className="absolute top-0 left-0 w-full h-full overflow-visible pointer-events-none z-10">
                                <g data-id={item.id} className="pointer-events-auto">
                                    <defs>
                                        <marker id={`arrowhead-${item.id}`} markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                                            <polygon points="0 0, 10 3.5, 0 7" fill="#E2B343" />
                                        </marker>
                                    </defs>
                                    <line
                                        x1={startX} y1={startY}
                                        x2={endX} y2={endY}
                                        stroke={isSelected ? "#E2B343" : "#E2B343"}
                                        strokeWidth={isSelected ? "6" : "4"}
                                        markerEnd={`url(#arrowhead-${item.id})`}
                                    />
                                    {/* Hit Area */}
                                    <line
                                        x1={startX} y1={startY}
                                        x2={endX} y2={endY}
                                        stroke="transparent"
                                        strokeWidth="20"
                                        className="pointer-events-auto cursor-grab"
                                        onPointerDown={(e) => handleElementMouseDown(e, item)}
                                    />
                                    {isSelected && (
                                        <>
                                            <circle
                                                cx={startX} cy={startY} r="6" fill="#E2B343" stroke="white" strokeWidth="2"
                                                style={{ cursor: 'move', pointerEvents: 'auto' }}
                                                onPointerDown={(e) => handleArrowHandleDown(e, item, 'start')}
                                            />
                                            <circle
                                                cx={endX} cy={endY} r="6" fill="#E2B343" stroke="white" strokeWidth="2"
                                                style={{ cursor: 'move', pointerEvents: 'auto' }}
                                                onPointerDown={(e) => handleArrowHandleDown(e, item, 'end')}
                                            />
                                        </>
                                    )}
                                </g>
                            </svg>
                        );
                    }

                    return (
                        <CanvasElement
                            key={item.id}
                            item={item}
                            isSelected={state.selectedIds.includes(item.id)}
                            onMouseDown={(e) => handleElementMouseDown(e, item)}
                            onResizeStart={handleResizeStart}
                            onUpdate={(updates) => updateItem(item.id, updates)}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default InfiniteCanvas;
