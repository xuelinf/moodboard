export type ToolType = 'select' | 'hand' | 'note' | 'text' | 'image' | 'shape' | 'arrow' | 'pen' | 'eraser';
export type ShapeType = 'circle' | 'square' | 'triangle';

export interface CanvasItem {
    id: string;
    type: ToolType;
    x: number;
    y: number;
    content: string; // Text content, Image URL, or SVG Path d
    width?: number; // for shapes, images, text container
    height?: number;
    rotation?: number;
    shapeType?: ShapeType;
    strokeColor?: string; // for pen
    fontSize?: number; // for text
    strokeWidth?: number; // for pen/arrow
}

export interface CanvasState {
    items: CanvasItem[];
    scale: number;
    panOffset: { x: number; y: number };
    activeTool: ToolType;
    selectedIds: string[];
    activeShape: ShapeType; // default shape to create
    penColor: string;
    penWidth: number;
}
