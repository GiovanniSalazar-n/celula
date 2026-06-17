import React, { useRef, useEffect, useMemo, useState } from 'react';
import { Cell } from '../types';
import { BOARD_COLUMNS, BOARD_ROWS } from '../engine';
import { Dna, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface GameBoardProps {
  cells: Cell[];
  p1Color: string;
  p2Color: string;
  selectedCellId: string | null;
  onSelectCell: (cell: Cell | null) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  cells,
  p1Color,
  p2Color,
  selectedCellId,
  onSelectCell,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number; cell: Cell | null } | null>(null);
  const liveCells = useMemo(() => cells.filter(cell => cell.status === 'alive'), [cells]);
  const cellByCoordinate = useMemo(() => {
    const index = new Map<string, Cell>();

    for (const cell of liveCells) {
      index.set(toCoordinateKey(cell.row, cell.col), cell);
    }

    return index;
  }, [liveCells]);
  const selectedCell = useMemo(
    () => selectedCellId ? liveCells.find(cell => cell.id === selectedCellId) : null,
    [liveCells, selectedCellId],
  );

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
    liveCells.forEach(cell => {
      const x = cell.col * cellW;
      const y = cell.row * cellH;
      const color = cell.team === 1 ? p1Color : p2Color;

      // Draw glowing cell dot
      ctx.fillStyle = color;
      ctx.shadowBlur = 4;
      ctx.shadowColor = color;
      
      // Draw nicely rounded dot or square
      ctx.fillRect(x + 0.5, y + 0.5, cellW - 0.5, cellH - 0.5);
      
      // Reset shadows
      ctx.shadowBlur = 0;
    });

    // 3. Highlight selected cell
    if (selectedCell) {
      const x = selectedCell.col * cellW;
      const y = selectedCell.row * cellH;
      const color = selectedCell.team === 1 ? p1Color : p2Color;

      // Glowing targeting reticle
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x - 2, y - 2, cellW + 4, cellH + 4);

      // Animated crosshairs
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Crosshair horizontal
      ctx.moveTo(x - 6, y + cellH/2);
      ctx.lineTo(x + cellW + 6, y + cellH/2);
      // Vertical
      ctx.moveTo(x + cellW/2, y - 6);
      ctx.lineTo(x + cellW/2, y + cellH + 6);
      ctx.stroke();
    }
  }, [liveCells, dimensions, p1Color, p2Color, selectedCell]);

  // Click handler to select cells
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cellW = dimensions.width / BOARD_COLUMNS;
    const cellH = dimensions.height / BOARD_ROWS;

    const col = Math.floor(x / cellW);
    const row = Math.floor(y / cellH);

    // Lock limits
    const boundedCol = Math.max(0, Math.min(BOARD_COLUMNS - 1, col));
    const boundedRow = Math.max(0, Math.min(BOARD_ROWS - 1, row));

    const clickedCell = cellByCoordinate.get(toCoordinateKey(boundedRow, boundedCol)) || null;

    onSelectCell(clickedCell);
  };

  // Mousemove handler for hover overlay coordinates
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cellW = dimensions.width / BOARD_COLUMNS;
    const cellH = dimensions.height / BOARD_ROWS;

    const col = Math.floor(x / cellW);
    const row = Math.floor(y / cellH);

    const boundedCol = Math.max(0, Math.min(BOARD_COLUMNS - 1, col));
    const boundedRow = Math.max(0, Math.min(BOARD_ROWS - 1, row));

    const foundCell = cellByCoordinate.get(toCoordinateKey(boundedRow, boundedCol)) || null;

    setHoveredCell({
      row: boundedRow,
      col: boundedCol,
      cell: foundCell,
    });
  };

  const handleCanvasMouseLeave = () => {
    setHoveredCell(null);
  };

  return (
    <div className="relative flex flex-col bg-slate-900 border border-slate-700/60 rounded-xl overflow-hidden p-3 shadow-xl">
      {/* Header telemetry and grid indicators */}
      <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-800 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>MATRIX RESOLUTION: 200 x 100 CYTOS-COORDS</span>
        </div>
        <div className="flex items-center gap-4">
          {hoveredCell && (
            <span className="text-cyan-400">
              HOVER: R{hoveredCell.row} C{hoveredCell.col} 
              {hoveredCell.cell && (
                <span className="ml-[6px]" style={{ color: hoveredCell.cell.team === 1 ? p1Color : p2Color }}>
                  [T{hoveredCell.cell.team} Cell - HP: {hoveredCell.cell.life}]
                </span>
              )}
            </span>
          )}
          <span className="text-slate-500">ZOOM: FIT (100%)</span>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div 
        ref={containerRef} 
        className="relative w-full aspect-[2/1] bg-[#0a0f1d] cursor-crosshair rounded-lg overflow-hidden border border-slate-800"
      >
        <canvas
          id="simulation-canvas-board"
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={handleCanvasMouseLeave}
          className="block w-full h-full"
        />

        {/* Floating instruction when board is empty */}
        {liveCells.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 text-center">
            <Dna className="h-10 w-10 text-cyan-400 animate-pulse mb-2" />
            <p className="text-sm font-semibold text-slate-200 font-sans">BIO-COLLISION FIELD CLEAN</p>
            <p className="text-xs text-slate-400 font-mono mt-1">Both colonies flatline. Click Restart to load cells.</p>
          </div>
        )}
      </div>

      {/* Footer helpers */}
      <div className="flex justify-between items-center mt-2 text-[10px] font-mono text-slate-500">
        <span>HOVER OVER MEMBRANE DOTS TO VIEW POSITION COORDINATES AND STATUS HP</span>
        <div className="flex gap-2">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-slate-800 border border-slate-700"></span> Empty Grid</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ backgroundColor: p1Color }}></span> Team 1</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ backgroundColor: p2Color }}></span> Team 2</span>
        </div>
      </div>
    </div>
  );
};

function toCoordinateKey(row: number, col: number): string {
  return `${row}:${col}`;
}
