import React from 'react';
import { Cell } from '../types';
import { Shield, Sparkles, Heart, Clock, Activity, Target } from 'lucide-react';

interface SidebarStatsProps {
  playerNum: 1 | 2;
  name: string;
  color: string;
  cells: Cell[];
}

export const PlayerSidebar: React.FC<SidebarStatsProps> = ({
  playerNum,
  name,
  color,
  cells,
}) => {
  const teamCells = cells.filter(c => c.status === 'alive' && c.team === playerNum);
  const livingCount = teamCells.length;
  const totalLife = teamCells.reduce((acc, c) => acc + c.life, 0);
  const averageLife = livingCount > 0 ? Math.round(totalLife / livingCount) : 0;
  
  const firstCreatedCell = teamCells.reduce((earliest: Cell | null, current: Cell) => {
    if (!earliest) return current;
    return current.creationTurn < earliest.creationTurn ? current : earliest;
  }, null as Cell | null);

  // Group actions to show summary distribution
  const actionCounts: Record<string, number> = {};
  teamCells.forEach(c => {
    const act = (c.lastAction || 'none').split(' ')[0];
    actionCounts[act] = (actionCounts[act] || 0) + 1;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-4 text-slate-200 shadow-lg relative h-full">
      {/* Team Ribbon */}
      <div className="absolute top-0 right-0 left-0 h-1 rounded-t-xl" style={{ backgroundColor: color }}></div>

      {/* Header telemetry name */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-1">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">PLAYER 0{playerNum}</span>
          <h3 className="text-lg font-bold truncate text-white max-w-[150px]">{name}</h3>
        </div>
        <span 
          className="text-xs px-2 py-0.5 rounded-full font-mono uppercase font-bold"
          style={{ backgroundColor: `${color}15`, color: color }}
        >
          Species
        </span>
      </div>

      {/* Main Stats Bento-grid */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono font-bold">
        {/* Cell Count */}
        <div className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg flex flex-col gap-1">
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <Activity className="h-3 w-3 text-cyan-400" />
            LIVING NODES
          </span>
          <span className="text-xl font-extrabold text-white">{livingCount}</span>
        </div>

        {/* Total Life Pool */}
        <div className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg flex flex-col gap-1">
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <Heart className="h-3 w-3 text-rose-500" />
            LIFE TOTAL
          </span>
          <span className="text-xl font-extrabold text-white">{totalLife}</span>
        </div>

        {/* Avg HP */}
        <div className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg flex flex-col gap-1 col-span-2">
          <span className="text-[10px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-emerald-400" />
              AVERAGE VITALITY
            </span>
            <span>{averageLife}%</span>
          </span>
          <div className="w-full bg-slate-900 rounded-full h-1.5 mt-1 overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-300" 
              style={{ width: `${averageLife}%`, backgroundColor: color }}
            ></div>
          </div>
        </div>

        {/* First created living cell */}
        <div className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg flex flex-col gap-1 col-span-2">
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <Clock className="h-3 w-3 text-indigo-400" />
            FIRST CREATED NODE
          </span>
          {firstCreatedCell ? (
            <div className="flex justify-between items-center text-white">
              <span>#{firstCreatedCell.id.split('-').pop() || '01'}</span>
              <span>TURN {firstCreatedCell.creationTurn}</span>
            </div>
          ) : (
            <span className="text-slate-600 italic">None registered</span>
          )}
        </div>
      </div>

      {/* Action Distributions */}
      <div className="border-t border-slate-850 pt-3 flex-1 flex flex-col justify-between">
        <h4 className="text-[10px] font-mono tracking-wider text-slate-500 flex items-center gap-1 uppercase mb-2">
          <Target className="h-3.5 w-3.5 text-cyan-500" />
          ACTIVE DUTY DEPLOYMENTS
        </h4>

        {livingCount > 0 ? (
          <div className="space-y-1.5 text-xs font-mono">
            {Object.entries(actionCounts).map(([action, count]) => {
              const pct = Math.round((count / livingCount) * 100);
              return (
                <div key={action} className="flex items-center justify-between text-slate-300">
                  <span className="uppercase text-slate-400">{action}:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-slate-950 h-2 rounded overflow-hidden">
                      <div className="h-full" style={{ width: `${pct}%`, backgroundColor: color }}></div>
                    </div>
                    <span className="w-8 text-right font-bold">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 border border-dashed border-slate-800 rounded bg-slate-950/20 text-slate-500 text-xs italic">
            Colony flattened. No coordinates in sight.
          </div>
        )}
        
        {/* Decorative Grid Specs */}
        <div className="mt-4 pt-2 border-t border-slate-850 text-[9px] font-mono text-slate-600 flex justify-between">
          <span>ALGO_MATRIX_STABLE: OK</span>
          <span>TURN_SYNC: 100%</span>
        </div>
      </div>
    </div>
  );
};
