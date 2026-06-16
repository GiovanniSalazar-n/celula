import React from 'react';
import { FinalStats } from '../types';
import { Trophy, RefreshCw, Sliders, Hourglass, Activity, ShieldCheck, Flame } from 'lucide-react';

interface FinalResultsProps {
  stats: FinalStats;
  p1Name: string;
  p2Name: string;
  p1Color: string;
  p2Color: string;
  onRestartSimulation: () => void;
  onBackToSetup: () => void;
}

export const FinalResults: React.FC<FinalResultsProps> = ({
  stats,
  p1Name,
  p2Name,
  p1Color,
  p2Color,
  onRestartSimulation,
  onBackToSetup,
}) => {
  const isDraw = stats.winner === 'draw';
  const winnerName = stats.winner === 1 ? p1Name : p2Name;
  const winnerColor = stats.winner === 1 ? p1Color : p2Color;

  const getReasonText = () => {
    switch (stats.reason) {
      case 'team-eliminated': return 'Opposing species was completely neutralized from the coordinate matrix.';
      case 'both-teams-eliminated': return 'Both species reached zero living cells during the simulation.';
      case 'turn-limit': return 'Turn 5000 completed. Winner was selected by living cells, then total health.';
      case 'manual-end': return 'Simulation was manually ended. Current leader was selected by living cells, then total health.';
      case 'draw': return 'Both species neutralized each other simultaneously, or population counts perfectly matched.';
      default: return 'Simulation completed.';
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 font-mono text-slate-100 space-y-6">
      
      {/* 1. Verdict card header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4 shadow-2xl relative overflow-hidden">
        {/* Colorful visual backdrop flare */}
        <div 
          className="absolute -top-24 -left-20 w-48 h-48 rounded-full blur-3xl opacity-20 transition-all duration-300"
          style={{ backgroundColor: isDraw ? '#fbbf24' : winnerColor }}
        ></div>

        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-950 border border-slate-800 rounded-full text-[11px] font-bold text-slate-400">
          <Hourglass className="h-3.5 w-3.5 text-cyan-400" />
          <span>SIMULATION COMPLETED AT TURN {stats.finalTurn}</span>
        </div>

        {isDraw ? (
          <div className="space-y-2">
            <div className="inline-flex p-3.5 bg-amber-950/20 border border-amber-900/30 rounded-2xl text-amber-500 mb-2">
              <Activity className="h-10 w-10 animate-pulse" />
            </div>
            <h1 className="text-3xl font-extrabold text-amber-400 tracking-tight font-sans">
              MUTUAL CLINICAL EXTINCTION
            </h1>
            <p className="text-sm font-sans text-slate-400 max-w-md mx-auto">
              {getReasonText()}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div 
              className="inline-flex p-3.5 rounded-2xl mb-2"
              style={{ backgroundColor: `${winnerColor}15`, border: `1px solid ${winnerColor}30`, color: winnerColor }}
            >
              <Trophy className="h-10 w-10 animate-bounce" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight font-sans text-white">
              <span style={{ color: winnerColor }}>{winnerName.toUpperCase()}</span> DOMINATES
            </h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest leading-none mt-1">Species Victory</p>
            <p className="text-sm font-sans text-slate-400 max-w-sm mx-auto mt-2">
              {getReasonText()}
            </p>
          </div>
        )}
      </div>

      {/* 2. Side by side Player stats breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Player 1 Stats Card */}
        <div className="bg-slate-900 border border-slate-850 rounded-xl p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1" style={{ backgroundColor: p1Color }}></div>
          <div className="flex justify-between items-center pb-3 border-b border-slate-850">
            <h3 className="font-sans font-bold text-lg text-white truncate max-w-[150px]">{p1Name}</h3>
            <span className="text-[10px] text-slate-500">PLAYER 1</span>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-cyan-400" />
                LIVING CELL NODES:
              </span>
              <span className="text-white font-extrabold">{stats.p1FinalLiving}</span>
            </div>
            
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-orange-400" />
                REMAINING HP POOL:
              </span>
              <span className="text-white font-extrabold">{stats.p1FinalLife}</span>
            </div>

            <div className="pt-2 border-t border-slate-850 flex justify-between items-center text-[10px] text-slate-500">
              <span>OUTCOME STATUS</span>
              {stats.winner === 1 ? (
                <span className="text-emerald-400 font-bold bg-emerald-950/20 px-2 py-0.5 rounded">VICTORY</span>
              ) : isDraw ? (
                <span className="text-amber-400 font-bold bg-amber-950/20 px-2 py-0.5 rounded">DRAW</span>
              ) : (
                <span className="text-rose-400 font-bold bg-rose-950/20 px-2 py-0.5 rounded">EXTINCT</span>
              )}
            </div>
          </div>
        </div>

        {/* Player 2 Stats Card */}
        <div className="bg-slate-900 border border-slate-850 rounded-xl p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1" style={{ backgroundColor: p2Color }}></div>
          <div className="flex justify-between items-center pb-3 border-b border-slate-850">
            <h3 className="font-sans font-bold text-lg text-white truncate max-w-[150px]">{p2Name}</h3>
            <span className="text-[10px] text-slate-500">PLAYER 2</span>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-cyan-400" />
                LIVING CELL NODES:
              </span>
              <span className="text-white font-extrabold">{stats.p2FinalLiving}</span>
            </div>
            
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-orange-400" />
                REMAINING HP POOL:
              </span>
              <span className="text-white font-extrabold">{stats.p2FinalLife}</span>
            </div>

            <div className="pt-2 border-t border-slate-850 flex justify-between items-center text-[10px] text-slate-500">
              <span>OUTCOME STATUS</span>
              {stats.winner === 2 ? (
                <span className="text-emerald-400 font-bold bg-emerald-950/20 px-2 py-0.5 rounded">VICTORY</span>
              ) : isDraw ? (
                <span className="text-amber-400 font-bold bg-amber-950/20 px-2 py-0.5 rounded">DRAW</span>
              ) : (
                <span className="text-rose-400 font-bold bg-rose-950/20 px-2 py-0.5 rounded">EXTINCT</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Restart and configuration Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        {/* Restart Battle */}
        <button
          id="final-restart-btn"
          onClick={onRestartSimulation}
          className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 rounded-xl font-bold font-mono text-sm shadow-md transition-all hover:brightness-110 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
        >
          <RefreshCw className="h-4.5 w-4.5" />
          RELAUNCH MATCH
        </button>

        {/* Back to Setup */}
        <button
          id="final-back-btn"
          onClick={onBackToSetup}
          className="flex-1 py-3 px-4 bg-slate-850 border border-slate-750 hover:bg-slate-800 text-slate-200 rounded-xl font-bold font-mono text-sm transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
        >
          <Sliders className="h-4.5 w-4.5" />
          REConfigure SPECIES
        </button>
      </div>

      {/* Outer diagnostic credit footer */}
      <div className="text-center text-[10px] text-slate-600 pt-6">
        <span>BIO MATRIX VERDICT CONCLUDED SUCESSFULLY • SHUTTING DOWN TACTICAL DESK CYCLES</span>
      </div>

    </div>
  );
};
