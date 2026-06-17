import React, { useRef, useEffect, useState } from 'react';
import { BOARD_COLUMNS, BOARD_ROWS, type Cell } from '../engine';
import { Dna } from 'lucide-react';

interface GameBoardProps {
  cells: Cell[];
  p1Color: string;
  p2Color: string;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  cells,
  p1Color,
  p2Color,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  // Set up ResizeObserver to scale the canvas automatically
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width } = entries[0].contentRect;
      // Keep proper 2:1 ratio for the 100x200 grid
      const height = Math.floor(width / 2);
      setDimensions({ width, height });
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Redraw board on dimension, cell list, or color change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear background
    ctx.fillStyle = '#0a0f1d'; // dark navy background
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    const cellW = dimensions.width / BOARD_COLUMNS;
    const cellH = dimensions.height / BOARD_ROWS;

    // 1. Draw subtle grid gridlines
    ctx.strokeStyle = '#152033';
    ctx.lineWidth = 0.5;
    
    // Draw columns (every 10 for performance & visual order)
    for (let c = 0; c <= BOARD_COLUMNS; c += 10) {
      const x = c * cellW;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, dimensions.height);
      ctx.stroke();
    }
    // Draw rows (every 10)
    for (let r = 0; r <= BOARD_ROWS; r += 10) {
      const y = r * cellH;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(dimensions.width, y);
      ctx.stroke();
    }

    // Draw central dividing barrier line
    ctx.strokeStyle = 'rgba(21, 128, 253, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(dimensions.width / 2, 0);
    ctx.lineTo(dimensions.width / 2, dimensions.height);
    ctx.stroke();

    // 2. Draw all cells
    cells.forEach(cell => {
      if (!cell.isAlive) return;

      const x = cell.position.column * cellW;
      const y = cell.position.row * cellH;

      ctx.fillStyle = cell.color;
      ctx.fillRect(x + 0.5, y + 0.5, cellW - 0.5, cellH - 0.5);
    });
  }, [cells, dimensions]);

  return (
    <div className="relative flex flex-col bg-slate-900 border border-slate-700/60 rounded-xl overflow-hidden p-3 shadow-xl">
      {/* Header telemetry and grid indicators */}
      <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-800 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>MATRIX RESOLUTION: 200 x 100 CYTOS-COORDS</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-500">ZOOM: FIT (100%)</span>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div 
        ref={containerRef} 
        className="relative w-full aspect-[2/1] bg-[#0a0f1d] rounded-lg overflow-hidden border border-slate-800"
      >
        <canvas
          id="simulation-canvas-board"
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="block w-full h-full"
        />

        {/* Floating instruction when board is empty */}
        {cells.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 text-center">
            <Dna className="h-10 w-10 text-cyan-400 animate-pulse mb-2" />
            <p className="text-sm font-semibold text-slate-200 font-sans">BIO-COLLISION FIELD CLEAN</p>
            <p className="text-xs text-slate-400 font-mono mt-1">Both colonies flatline. Click Restart to load cells.</p>
          </div>
        )}
      </div>

      {/* Footer helpers */}
      <div className="flex justify-between items-center mt-2 text-[10px] font-mono text-slate-500">
        <span>LOCAL TWO-PLAYER CELL FIELD RENDER</span>
        <div className="flex gap-2">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-slate-800 border border-slate-700"></span> Empty Grid</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ backgroundColor: p1Color }}></span> Team 1</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ backgroundColor: p2Color }}></span> Team 2</span>
        </div>
      </div>
    </div>
  );
};
