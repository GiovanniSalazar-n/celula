import { useEffect, useMemo, useRef, useState } from 'react';
import {
  createInitialMatch,
  evaluateVictory,
  executeTurn,
  TURN_LIMIT,
  type Match,
  type MatchResult,
  type Player,
} from './engine';
import { Cell, PlayerConfig, SimulationSettings, LogEntry, GameState, FinalStats } from './types';
import { CODE_TEMPLATES } from './utils/interpreter';
import { CodeEditor } from './components/CodeEditor';
import { GameBoard } from './components/GameBoard';
import { PlayerSidebar } from './components/SidebarStats';
import { ControlBar } from './components/ControlBar';
import { LogsPanel } from './components/LogsPanel';
import { FinalResults } from './components/FinalResults';
import { Dna, ArrowLeft } from 'lucide-react';

const MAX_LOG_ENTRIES = 150;

const PLAYBACK_PROFILES = {
  1: { turnDelayMs: 500, frameBudgetMs: 4, maxTurnsPerFrame: 1 },
  2: { turnDelayMs: 200, frameBudgetMs: 6, maxTurnsPerFrame: 2 },
  5: { turnDelayMs: 60, frameBudgetMs: 9, maxTurnsPerFrame: 4 },
} satisfies Record<SimulationSettings['speed'], { turnDelayMs: number; frameBudgetMs: number; maxTurnsPerFrame: number }>;

export default function App() {
  const [screen, setScreen] = useState<'setup' | 'simulation' | 'results'>('setup');
  const [gameState, setGameState] = useState<GameState>('setup');
  const [match, setMatch] = useState<Match | null>(null);

  const [p1, setP1] = useState<PlayerConfig>({
    name: 'Anabaena-Cyan',
    color: '#22d3ee',
    code: CODE_TEMPLATES.PREDATOR,
    isValid: false,
    validationError: null,
    selectedTemplate: 'PREDATOR',
    isConfirmed: false,
  });

  const [p2, setP2] = useState<PlayerConfig>({
    name: 'Dicty-Magenta',
    color: '#f43f5e',
    code: CODE_TEMPLATES.EXPANDING_COLONY,
    isValid: false,
    validationError: null,
    selectedTemplate: 'EXPANDING_COLONY',
    isConfirmed: false,
  });

  const [settings, setSettings] = useState<SimulationSettings>({
    maxTurns: TURN_LIMIT,
    speed: 2,
    turnDelay: 250,
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [finalStats, setFinalStats] = useState<FinalStats | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);
  const accumulatedPlaybackTimeRef = useRef(0);
  const matchRef = useRef<Match | null>(null);
  const gameStateRef = useRef<GameState>('setup');
  const settingsRef = useRef<SimulationSettings>(settings);

  const cells = useMemo(() => (match ? match.board.cells.map(toUiCell) : []), [match]);
  const currentTurn = match?.currentTurn ?? 0;

  useEffect(() => {
    const delay = PLAYBACK_PROFILES[settings.speed].turnDelayMs;
    setSettings(prev => ({ ...prev, maxTurns: TURN_LIMIT, turnDelay: delay }));
  }, [settings.speed]);

  useEffect(() => {
    matchRef.current = match;
  }, [match]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const appendLogs = (newLogs: LogEntry[]) => {
    if (newLogs.length === 0) return;
    setLogs(prev => [...prev, ...newLogs].slice(-MAX_LOG_ENTRIES));
  };

  const cancelPlaybackFrame = () => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    lastFrameTimeRef.current = null;
    accumulatedPlaybackTimeRef.current = 0;
  };

  const handleStartSimulation = () => {
    const newMatch = createInitialMatch([toEnginePlayer(p1, 'player-1'), toEnginePlayer(p2, 'player-2')]);

    setMatch(newMatch);
    setLogs([
      { turn: 1, type: 'system', message: 'MVP match locked. Random initial cells placed on the fixed 100 x 200 board.' },
      { turn: 1, type: 'info', message: `${p1.name} vs ${p2.name} - fixed turn limit: ${TURN_LIMIT}` },
    ]);
    setSelectedCellId(null);
    setFinalStats(null);
    setScreen('simulation');
    setGameState('paused');
  };

  const handleSingleStep = () => {
    if (gameState === 'finished') return;

    setMatch(prevMatch => {
      if (!prevMatch || prevMatch.status === 'finished') return prevMatch;

      const executedTurn = prevMatch.currentTurn;
      const nextMatch = executeTurn({
        ...prevMatch,
        status: gameState === 'running' ? 'running' : 'paused',
      });
      const newErrors = nextMatch.errors
        .filter(error => error.turn === executedTurn)
        .map(toLogEntry);
      if (newErrors.length > 0) {
        appendLogs(newErrors);
      }

      if (nextMatch.result) {
        setGameState('finished');
        setFinalStats(toFinalStats(nextMatch.result));
        setScreen('results');
      }

      return nextMatch;
    });
  };

  useEffect(() => {
    if (gameState !== 'running') {
      cancelPlaybackFrame();
      return undefined;
    }

    let cancelled = false;

    const runFrame = (timestamp: number) => {
      if (cancelled || gameStateRef.current !== 'running') return;

      const profile = PLAYBACK_PROFILES[settingsRef.current.speed];
      const previousTimestamp = lastFrameTimeRef.current ?? timestamp;
      const elapsed = Math.min(timestamp - previousTimestamp, 1000);
      lastFrameTimeRef.current = timestamp;
      accumulatedPlaybackTimeRef.current += elapsed;

      let workingMatch = matchRef.current;
      let executedTurns = 0;
      let finishedResult: MatchResult | null = null;
      const newLogs: LogEntry[] = [];
      const frameStartedAt = performance.now();

      while (
        workingMatch &&
        workingMatch.status !== 'finished' &&
        accumulatedPlaybackTimeRef.current >= profile.turnDelayMs &&
        executedTurns < profile.maxTurnsPerFrame &&
        (executedTurns === 0 || performance.now() - frameStartedAt < profile.frameBudgetMs)
      ) {
        const executedTurn = workingMatch.currentTurn;
        workingMatch = executeTurn({
          ...workingMatch,
          status: 'running',
        });
        accumulatedPlaybackTimeRef.current -= profile.turnDelayMs;
        executedTurns += 1;

        newLogs.push(
          ...workingMatch.errors
            .filter(error => error.turn === executedTurn)
            .map(toLogEntry),
        );

        if (workingMatch.result) {
          finishedResult = workingMatch.result;
          break;
        }
      }

      if (executedTurns > 0 && workingMatch) {
        matchRef.current = workingMatch;
        setMatch(workingMatch);
        appendLogs(newLogs);

        if (finishedResult) {
          setGameState('finished');
          setFinalStats(toFinalStats(finishedResult));
          setScreen('results');
          return;
        }
      }

      animationFrameRef.current = requestAnimationFrame(runFrame);
    };

    animationFrameRef.current = requestAnimationFrame(runFrame);

    return () => {
      cancelled = true;
      cancelPlaybackFrame();
    };
  }, [gameState]);

  const handleTogglePlay = () => {
    if (gameState === 'finished') return;
    const nextState = gameState === 'running' ? 'paused' : 'running';
    setGameState(nextState);
    setMatch(prev => prev ? { ...prev, status: nextState === 'running' ? 'running' : 'paused' } : prev);
  };

  const handleResetMatch = () => {
    cancelPlaybackFrame();

    const newMatch = createInitialMatch([toEnginePlayer(p1, 'player-1'), toEnginePlayer(p2, 'player-2')]);
    setMatch(newMatch);
    setLogs([{ turn: 1, type: 'system', message: 'Simulation reloaded with newly random initial placement.' }]);
    setSelectedCellId(null);
    setFinalStats(null);
    setGameState('paused');
  };

  const handleEndSimulation = () => {
    if (!match) return;

    cancelPlaybackFrame();

    const result = evaluateVictory(match, 'manual-end');
    if (!result) return;

    setMatch({ ...match, status: 'finished', result });
    setGameState('finished');
    setFinalStats(toFinalStats(result));
    appendLogs([
      {
        turn: match.currentTurn,
        type: 'system',
        message: 'Simulation manually ended. Leader evaluated by living cells, then total health.',
      },
    ]);
    setScreen('results');
  };

  const handleBackToSetup = () => {
    cancelPlaybackFrame();
    setMatch(null);
    setGameState('setup');
    setScreen('setup');
  };

  const selectedCell = cells.find(c => c.id === selectedCellId) || null;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans select-none antialiased">
      <header className="border-b border-slate-850 px-6 py-3 bg-[#0a0f1d]/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Dna className="h-6 w-6 text-cyan-400 rotate-12" />
          <div>
            <h1 className="text-sm font-black font-sans tracking-wide text-white flex items-center gap-1.5 leading-none">
              CELL BATTLE
              <span className="text-[9px] font-mono font-bold bg-cyan-950/60 text-cyan-400 border border-cyan-800/40 px-1.5 py-0.5 rounded">
                MVP SIM DECK
              </span>
            </h1>
            <p className="text-[9px] font-mono text-slate-500 leading-none mt-1">LOCAL TWO-PLAYER CELL SIMULATION</p>
          </div>
        </div>

        {screen !== 'setup' && (
          <button
            id="back-to-setup-btn"
            onClick={handleBackToSetup}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 rounded text-xs font-mono text-slate-400 hover:text-slate-100 transition-all cursor-pointer"
          >
            <ArrowLeft className="h-3 w-3" />
            BACK TO CONFIG
          </button>
        )}
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto flex flex-col justify-center py-4">
        {screen === 'setup' && (
          <CodeEditor
            p1={p1}
            p2={p2}
            settings={settings}
            setP1={setP1}
            setP2={setP2}
            setSettings={setSettings}
            onStartSimulation={handleStartSimulation}
          />
        )}

        {screen === 'simulation' && (
          <div className="space-y-4 px-4">
            <ControlBar
              currentTurn={currentTurn}
              gameState={gameState}
              settings={settings}
              setSettings={setSettings}
              onTogglePlay={handleTogglePlay}
              onNextStep={handleSingleStep}
              onReset={handleResetMatch}
              onEndSimulation={handleEndSimulation}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              <div className="lg:col-span-3">
                <PlayerSidebar playerNum={1} name={p1.name} color={p1.color} cells={cells} />
              </div>

              <div className="lg:col-span-6 flex flex-col justify-between">
                <GameBoard
                  cells={cells}
                  p1Color={p1.color}
                  p2Color={p2.color}
                  selectedCellId={selectedCellId}
                  onSelectCell={(c) => setSelectedCellId(c ? c.id : null)}
                />
              </div>

              <div className="lg:col-span-3">
                <PlayerSidebar playerNum={2} name={p2.name} color={p2.color} cells={cells} />
              </div>
            </div>

            <LogsPanel logs={logs} p1Color={p1.color} p2Color={p2.color} p1Name={p1.name} p2Name={p2.name} />
          </div>
        )}

        {screen === 'results' && finalStats && (
          <FinalResults
            stats={finalStats}
            p1Name={p1.name}
            p2Name={p2.name}
            p1Color={p1.color}
            p2Color={p2.color}
            onRestartSimulation={handleStartSimulation}
            onBackToSetup={handleBackToSetup}
          />
        )}
      </main>

      <footer className="border-t border-slate-850 px-6 py-2 bg-slate-950/40 text-[9px] font-mono text-slate-500 text-center flex flex-col sm:flex-row justify-between gap-1 items-center">
        <span>BIOLOGICAL CELL SIMULATION HUD PROTO - PLATFORM PORT: 3000 INGRESS</span>
        <span>SYSTEM OPERATIONAL CORE STATUS: <span className="text-emerald-400">ONLINE</span></span>
      </footer>
    </div>
  );
}

function toEnginePlayer(config: PlayerConfig, id: Player['id']): Player {
  return {
    id,
    name: config.name,
    color: config.color,
    functionSource: config.code,
    isFunctionValid: config.isValid,
    validationError: config.validationError || undefined,
    isConfirmed: config.isValid,
  };
}

function toUiCell(cell: Match['board']['cells'][number]): Cell {
  return {
    id: cell.id,
    team: cell.teamId === 'player-1' ? 1 : 2,
    row: cell.position.row,
    col: cell.position.column,
    life: cell.health,
    creationTurn: cell.creationTurn,
    lastAction: cell.lastAction || 'none',
    lastActionStatus: cell.lastActionStatus || 'none',
    status: cell.isAlive ? 'alive' : 'dead',
  };
}

function toFinalStats(result: MatchResult): FinalStats {
  const p1Stats = result.teamStats.find(stat => stat.teamId === 'player-1');
  const p2Stats = result.teamStats.find(stat => stat.teamId === 'player-2');

  return {
    winner: result.isDraw ? 'draw' : result.winnerTeamId === 'player-1' ? 1 : 2,
    reason: result.isDraw && result.terminationCause !== 'both-teams-eliminated'
      ? 'draw'
      : result.terminationCause,
    finalTurn: result.finalTurn,
    p1FinalLiving: p1Stats?.livingCells ?? 0,
    p1FinalLife: p1Stats?.totalHealth ?? 0,
    p2FinalLiving: p2Stats?.livingCells ?? 0,
    p2FinalLife: p2Stats?.totalHealth ?? 0,
  };
}

function toLogEntry(error: Match['errors'][number]): LogEntry {
  return {
    turn: error.turn,
    type: 'error',
    message: error.message,
  };
}
