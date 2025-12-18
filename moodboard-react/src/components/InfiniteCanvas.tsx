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
                    const url = prompt("Image URL");
                    if (url) newItem = { id, type: 'image', x: pt.x, y: pt.y, width: 300, height: 200, content: url };
                    break;
            }
            if (newItem) {
                addItem(newItem);
                saveHistory(); // Auto save for click creates
                selectItem(newItem.id);
                setActiveTool('select');
            }
            return;
        }

        // --- Background Click (Deselect) ---
        // Only if we are in select mode and didn't hit a STOP propagation event from a child.
        if (state.activeTool === 'select') {
            // We can check e.target to see if it's the container or content wrapper.
            if (e.target === containerRef.current || (e.target as HTMLElement).id === 'canvas-content' || (e.target as HTMLElement).tagName === 'svg') {
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
        const hitId = elements.find(el => el.hasAttribute('data-id'))?.getAttribute('data-id');
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
            // Arrow Handle logic
            // start: x,y. end: x+w, y+h.
            // If resizing start: x moves, y moves. But End (x+w, y+h) must remain constant.
            // If resizing end: w moves, h moves.

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
                // End must stay at oldEndX, oldEndY
                // newW = oldEndX - newStartX
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
        // Only save history if valid mode
        if (['dragging', 'resizing', 'drawing_arrow', 'drawing_pen', 'drawing_shape', 'arrow_handle'].includes(interaction.mode)) {
            // Check for valid Shape
            if (interaction.mode === 'drawing_shape' && interaction.initialItem) {
                const item = state.items.find(i => i.id === interaction.initialItem?.id);
                if (item && (item.width || 0) < 5 && (item.height || 0) < 5) {
                    // Too small -> Default size
                    updateItem(item.id, { width: 100, height: 100 });
                }
            }
            saveHistory();
        }

        setInteraction({ mode: 'none', startX: 0, startY: 0, startPan: { x: 0, y: 0 } });

        // Auto-switch disabled for continuous creation
        // if (['arrow', 'shape'].includes(state.activeTool)) {
        //    setActiveTool('select');
        // }
    };

    // Explicit Drag Handler
    const handleElementMouseDown = (e: React.PointerEvent, item: CanvasItem) => {
        if (state.activeTool !== 'select') {
            // If Arrow Tool is active, we might want to interact with arrow handles? 
            // But usually creating a new one.
            return;
        }

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
            const reader = new FileReader();
            reader.onload = (ev) => {
                const pt = getCanvasPoint(e.clientX, e.clientY);
                addItem({
                    id: uuidv4(),
                    type: 'image',
                    x: pt.x,
                    y: pt.y,
                    width: 300,
                    height: 200,
                    content: ev.target?.result as string
                });
                saveHistory();
            };
            reader.readAsDataURL(file);
        }
    };

    const bgSize = 24 * state.scale;
    const bgPos = `${state.panOffset.x % bgSize}px ${state.panOffset.y % bgSize}px`;

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
            <div
                id="canvas-content"
                style={{
                    transform: `translate(${state.panOffset.x}px, ${state.panOffset.y}px) scale(${state.scale})`,
                    transformOrigin: '0 0',
                    width: '100%', height: '100%',
                    position: 'absolute',
                    pointerEvents: 'none'
                }}
            >
                {/* SVG Layer for Pen/Arrow */}
                <svg className="absolute top-0 left-0 w-full h-full overflow-visible pointer-events-none">
                    {/* pointer-events-none on wrapper, auto on children to allow hitting paths but passing through empty space */}
                    {state.items.filter(i => i.type === 'pen').map(item => (
                        <path
                            key={item.id}
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
                    ))}
                    {state.items.filter(i => i.type === 'arrow').map(item => {
                        const startX = item.x;
                        const startY = item.y;
                        const endX = startX + (item.width || 0);
                        const endY = startY + (item.height || 0);
                        const isSelected = state.selectedIds.includes(item.id);
                        return (
                            <g key={item.id} data-id={item.id} className="pointer-events-auto">
                                <defs>
                                    <marker id={`arrowhead-${item.id}`} markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                                        <polygon points="0 0, 10 3.5, 0 7" fill="#E2B343" />
                                    </marker>
                                </defs>
                                <line
                                    x1={startX} y1={startY}
                                    x2={endX} y2={endY}
                                    stroke={isSelected ? "#E2B343" : "#E2B343"} // Highlight if selected?
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

                                {/* Control Points */}
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
                        );
                    })}
                </svg>

                {state.items.filter(i => i.type !== 'pen' && i.type !== 'arrow').map(item => (
                    <CanvasElement
                        key={item.id}
                        item={item}
                        isSelected={state.selectedIds.includes(item.id)}
                        onMouseDown={(e) => handleElementMouseDown(e, item)}
                        onResizeStart={handleResizeStart}
                        onUpdate={(updates) => updateItem(item.id, updates)}
                    />
                ))}
            </div>
        </div>
    );
};

export default InfiniteCanvas;
