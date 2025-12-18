import { useState, useCallback, useRef, useMemo } from 'react';
import type { CanvasItem, CanvasState, ToolType, ShapeType } from './types';

export const useCanvasState = () => {
    // Main State
    const [state, setState] = useState<CanvasState>({
        scale: 1,
        panOffset: { x: 0, y: 0 },
        activeTool: 'select',
        selectedIds: [],
        items: [],
        activeShape: 'square',
        penColor: '#E2B343', // Default gold
        penWidth: 5,
    });

    // History State
    const historyRef = useRef<CanvasItem[][]>([[]]);
    const historyIndexRef = useRef(0);
    // Force re-render when history changes (for Undo/Redo button disabled state)
    const [historyVersion, setHistoryVersion] = useState(0);

    const pushToHistory = useCallback((newItems: CanvasItem[]) => {
        const currentItems = historyRef.current[historyIndexRef.current];
        if (currentItems === newItems) return;

        const currentHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
        currentHistory.push(newItems);
        historyRef.current = currentHistory;
        historyIndexRef.current = currentHistory.length - 1;
        setHistoryVersion(v => v + 1);
    }, []);

    const setScale = useCallback((scale: number) => {
        setState(prev => ({ ...prev, scale }));
    }, []);

    const setPanOffset = useCallback((panOffset: { x: number, y: number }) => {
        setState(prev => ({ ...prev, panOffset }));
    }, []);

    const setActiveTool = useCallback((tool: ToolType) => {
        setState(prev => ({ ...prev, activeTool: tool, selectedIds: [] }));
    }, []);

    const setActiveShape = useCallback((shape: ShapeType) => {
        setState(prev => ({ ...prev, activeShape: shape }));
    }, []);

    const setPenColor = useCallback((color: string) => {
        setState(prev => ({ ...prev, penColor: color }));
    }, []);

    const setPenWidth = useCallback((width: number) => {
        setState(prev => ({ ...prev, penWidth: width }));
    }, []);

    const addItem = useCallback((item: CanvasItem) => {
        setState(prev => ({ ...prev, items: [...prev.items, item] }));
    }, []);

    const updateItem = useCallback((id: string, updates: Partial<CanvasItem>) => {
        setState(prev => {
            const newItems = prev.items.map(item => item.id === id ? { ...item, ...updates } : item);
            return { ...prev, items: newItems };
        });
    }, []);

    // Fixed: Don't use updater for side effects. Use current state.
    const saveHistory = useCallback(() => {
        // We use the ref to track items if we want to avoid 'state' dependency causing re-renders of this function?
        // Actually, since this is called on PointerUp, we can just look at state.items.
        // HOWEVER, 'state' here is a closure. If we don't include it in deps, it's stale.
        // If we include it, 'saveHistory' changes on every render.
        // InfiniteCanvas uses 'saveHistory' in 'handlePointerUp'.
        // handlePointerUp is recreated on every render if it uses saveHistory.
        // This is fine. React handles this.
        pushToHistory(state.items);
    }, [state.items, pushToHistory]);

    const deleteItems = useCallback((ids: string[]) => {
        // Calculate new items based on current state
        const newItems = state.items.filter(i => !ids.includes(i.id));
        setState(prev => ({ ...prev, items: newItems, selectedIds: [] }));
        pushToHistory(newItems);
    }, [state.items, pushToHistory]);

    const undo = useCallback(() => {
        if (historyIndexRef.current > 0) {
            historyIndexRef.current -= 1;
            const prevItems = historyRef.current[historyIndexRef.current];
            setState(prev => ({ ...prev, items: [...prevItems], selectedIds: [] }));
            setHistoryVersion(v => v + 1);
        }
    }, []);

    const redo = useCallback(() => {
        if (historyIndexRef.current < historyRef.current.length - 1) {
            historyIndexRef.current += 1;
            const nextItems = historyRef.current[historyIndexRef.current];
            setState(prev => ({ ...prev, items: [...nextItems], selectedIds: [] }));
            setHistoryVersion(v => v + 1);
        }
    }, []);

    // Memoize the return value to avoid unnecessary re-renders of consumers (Toolbar)
    const result = useMemo(() => ({
        state,
        setState,
        setScale,
        setPanOffset,
        addItem,
        updateItem,
        selectItem: (id: string | null) => setState(prev => ({ ...prev, selectedIds: id ? [id] : [] })),
        setActiveTool,
        setActiveShape,
        setPenColor,
        setPenWidth,
        deleteItems,
        undo,
        redo,
        saveHistory,
        canUndo: historyIndexRef.current > 0,
        canRedo: historyIndexRef.current < historyRef.current.length - 1
    }), [
        state, setScale, setPanOffset, addItem, updateItem,
        setActiveTool, setActiveShape, setPenColor, setPenWidth,
        deleteItems, undo, redo, saveHistory, historyVersion
    ]);

    return result;
};
