import React, { useRef, useEffect } from 'react';
import { LogEntry } from '../types';
import { Terminal, AlertTriangle } from 'lucide-react';

interface LogsPanelProps {
  logs: LogEntry[];
  p1Color: string;
  p2Color: string;
  p1Name: string;
  p2Name: string;
}

export const LogsPanel: React.FC<LogsPanelProps> = ({
  logs,
  p1Color,
  p2Color,
  p1Name,
  p2Name,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll logs when new entries arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // The MVP simulation panel shows invalid action/runtime action errors only.
  const errorLogs = logs.filter(log => log.type === 'error');

  return (
    <div className="w-full">
      {/* Terminal Console Logs */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-[280px] shadow-lg relative">
        {/* Terminal Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 font-bold tracking-wider text-slate-300">
            <Terminal className="h-4 w-4 text-rose-500 animate-pulse" />
            INVALID ACTION TELEMETRY
          </div>
          <span className="text-slate-500 text-[10px] uppercase">
            Live Stream
          </span>
        </div>

        {/* Scrollable event log list */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar font-mono text-[11px]"
        >
          {errorLogs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-550 italic gap-2 py-4">
              <span className="text-emerald-400 font-bold block text-sm">NO INVALID ACTIONS DETECTED</span>
              <span className="text-[10px] text-slate-500">MVP action rules are resolving cleanly.</span>
            </div>
          ) : (
            errorLogs.map((log, index) => {
              return (
                <div 
                  key={index} 
                  className="px-2.5 py-1.5 rounded border bg-red-950/20 border-red-900/40 flex justify-between gap-3"
                >
                  <span className="text-red-400 leading-tight flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    {log.message}
                  </span>
                  <span className="text-slate-500 text-[10px] self-start font-semibold whitespace-nowrap">
                    TURN {log.turn}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
