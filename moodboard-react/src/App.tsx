import { useEffect } from 'react';
import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import InfiniteCanvas from './components/InfiniteCanvas';
import Toolbar from './components/Toolbar';
import ZoomControls from './components/ZoomControls';
import { useCanvasState } from './useCanvasState';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-red-500 bg-zinc-900 h-screen w-screen">
          <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
          <pre className="bg-black/50 p-4 rounded overflow-auto font-mono text-sm border border-red-900/50">
            {this.state.error?.toString()}
          </pre>
          <button
            className="mt-4 px-4 py-2 bg-red-600/20 border border-red-600/50 rounded hover:bg-red-600/40 transition-colors"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function AppWrapper() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

function App() {
  const canvasState = useCanvasState();
  const { state, setScale, setPanOffset, setActiveTool, addItem } = canvasState;
  const { setActiveShape } = canvasState;

  // Add Example Data
  useEffect(() => {
    // Only if empty
    if (state.items.length === 0) {
      addItem({ id: '1', type: 'image', x: 600, y: 300, width: 320, height: 213, rotation: -2, content: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000&auto=format&fit=crop' });
      addItem({ id: '2', type: 'note', x: 900, y: 250, width: 200, height: 200, rotation: 3, content: '拖拽图片进来看效果！' });
    }
  }, []);

  return (
    <div className="w-screen h-screen bg-[#0F0F11] text-white overflow-hidden select-none">

      {/* Header */}
      <div className="fixed top-6 left-8 z-50 flex items-center gap-4 pointer-events-none select-none">
        <div className="pointer-events-auto text-xl font-bold tracking-tight text-white/90">CineFlow <span className="text-[10px] px-1.5 py-0.5 rounded border border-white/20 text-white/40 font-normal">React</span></div>
        <div className="h-4 w-[1px] bg-white/10"></div>
        <div className="text-sm text-zinc-400">项目：赛博朋克短片 - 场景Moodboard</div>
        <div className="px-2 py-0.5 bg-zinc-800/50 rounded text-xs text-zinc-500 border border-zinc-700/50">已自动保存</div>
      </div>

      <InfiniteCanvas canvasState={canvasState} />

      <Toolbar
        activeTool={state.activeTool}
        onSelectTool={setActiveTool}
        activeShape={state.activeShape}
        onSelectShape={setActiveShape}
        canvasState={canvasState}
      />

      <ZoomControls
        scale={state.scale}
        setScale={setScale}
        onFitScreen={() => { setScale(1); setPanOffset({ x: 0, y: 0 }); }}
      />

    </div>
  );
}
