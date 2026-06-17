import React from 'react';
import { PlayerConfig, SimulationSettings } from '../types';
import { CODE_TEMPLATES } from '../utils/interpreter';
import {
  MAX_TURN_LIMIT,
  MIN_TURN_LIMIT,
  validateUserFunction,
  validatePlayerConfigs,
  validateTurnLimit,
  type Player,
} from '../engine';
import { Play, Check, AlertTriangle, Code2, BookOpen, Settings2, Sparkles } from 'lucide-react';

interface CodeEditorProps {
  p1: PlayerConfig;
  p2: PlayerConfig;
  settings: SimulationSettings;
  setP1: React.Dispatch<React.SetStateAction<PlayerConfig>>;
  setP2: React.Dispatch<React.SetStateAction<PlayerConfig>>;
  setSettings: React.Dispatch<React.SetStateAction<SimulationSettings>>;
  onStartSimulation: () => void;
}

const NEON_COLORS = [
  { name: 'Cyan Glow', hex: '#22d3ee' },
  { name: 'Lime Bio', hex: '#4ade80' },
  { name: 'Amber Heat', hex: '#fbbf24' },
  { name: 'Magenta Pulse', hex: '#f43f5e' },
  { name: 'Purple Vortex', hex: '#bc5bf5' },
  { name: 'Orange Flare', hex: '#fb923c' },
];

interface LineNumberedEditorProps {
  id: string;
  lineNumbersTestId: string;
  value: string;
  onChange: (value: string) => void;
}

const LineNumberedEditor: React.FC<LineNumberedEditorProps> = ({
  id,
  lineNumbersTestId,
  value,
  onChange,
}) => {
  const lineCount = Math.max(1, value.split(/\r?\n/).length);

  return (
    <div className="flex h-80 bg-[#070b13] border border-slate-850 rounded overflow-hidden focus-within:ring-1 focus-within:ring-cyan-500">
      <div
        data-testid={lineNumbersTestId}
        className="w-10 shrink-0 bg-slate-950/70 border-r border-slate-850 py-3.5 text-right pr-2 font-mono text-xs leading-relaxed text-slate-600 select-none"
        aria-hidden="true"
      >
        {Array.from({ length: lineCount }, (_, index) => (
          <div key={index}>{index + 1}</div>
        ))}
      </div>
      <textarea
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        spellCheck={false}
        className="w-full h-full bg-transparent font-mono text-xs p-3.5 text-teal-400 focus:outline-none leading-relaxed resize-none overflow-y-auto"
      />
    </div>
  );
};

export const CodeEditor: React.FC<CodeEditorProps> = ({
  p1,
  p2,
  settings,
  setP1,
  setP2,
  setSettings,
  onStartSimulation,
}) => {

  const handleValidate = (playerNum: 1 | 2) => {
    const config = playerNum === 1 ? p1 : p2;
    const setConfig = playerNum === 1 ? setP1 : setP2;
    
    const result = validateUserFunction(config.code);
    
    setConfig(prev => ({
      ...prev,
      isValid: result.isValid,
      validationError: result.error,
      isConfirmed: result.isValid,
    }));
  };

  const handleTemplateChange = (playerNum: 1 | 2, templateName: string) => {
    const setConfig = playerNum === 1 ? setP1 : setP2;
    let code = '';
    
    switch (templateName) {
      case 'PREDATOR':
        code = CODE_TEMPLATES.PREDATOR;
        break;
      case 'EXPANDING_COLONY':
        code = CODE_TEMPLATES.EXPANDING_COLONY;
        break;
      case 'SENTINEL':
        code = CODE_TEMPLATES.SENTINEL;
        break;
      case 'RANDOM_EXPLORER':
        code = CODE_TEMPLATES.RANDOM_EXPLORER;
        break;
      default:
        code = CODE_TEMPLATES.PREDATOR;
    }

    setConfig(prev => ({
      ...prev,
      selectedTemplate: templateName,
      code,
      isValid: false,
      validationError: null,
      isConfirmed: false,
    }));
  };

  const toEnginePlayer = (config: PlayerConfig, id: 'player-1' | 'player-2'): Player => ({
    id,
    name: config.name,
    color: config.color,
    functionSource: config.code,
    isFunctionValid: config.isValid,
    validationError: config.validationError || undefined,
    isConfirmed: config.isConfirmed,
  });

  const playValidation = validatePlayerConfigs(
    [
      toEnginePlayer(p1, 'player-1'),
      toEnginePlayer(p2, 'player-2'),
    ],
    { requireConfirmed: false },
  );
  const turnLimitValidation = validateTurnLimit(settings.maxTurns);
  const canStart = playValidation.isValid && turnLimitValidation.isValid;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-4 font-sans text-slate-100">
      
      {/* Title Header Branding */}
      <div className="text-center space-y-2 py-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-950/40 border border-cyan-800/50 rounded-full text-xs font-mono text-cyan-400">
          <Sparkles className="h-3 w-3" />
          <span>CYTOTOXIC COLONY AUTOMATA - DECK v1.0</span>
        </div>
        <h1 id="main-app-title" className="text-4xl md:text-5xl font-extrabold tracking-tight text-white font-sans bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500">
          CELL BATTLE
        </h1>
        <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto font-sans">
          Develop Python behavior functions below, validate action returns, and run the locked local simulation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* PLAYER 1 MATRICES EDITOR */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-850 rounded-xl p-5 shadow-2xl relative">
          <div className="absolute top-0 right-0 left-0 h-1 rounded-t-xl" style={{ backgroundColor: p1.color }}></div>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p1.color }}></span>
                Player 1 Setup
              </h2>
              <span className="text-xs font-mono text-slate-500">MATRIX 01</span>
            </div>

            {/* Config Name input & color */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">SPECIES IDENTIFIER</label>
                <input
                  id="p1-name-input"
                  type="text"
                  value={p1.name}
                  onChange={e => setP1(prev => ({ ...prev, name: e.target.value, isConfirmed: false }))}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 font-sans"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">LOAD ALGORITHMS</label>
                <select
                  id="p1-preset-select"
                  value={p1.selectedTemplate}
                  onChange={e => handleTemplateChange(1, e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 font-sans cursor-pointer"
                >
                  <option value="PREDATOR">Hunter-Predator (Aggressive)</option>
                  <option value="EXPANDING_COLONY">Colony Expansion (Multiplier)</option>
                  <option value="SENTINEL">Cautious Sentinel (Defensive)</option>
                  <option value="RANDOM_EXPLORER">Random Explorer (Wanderer)</option>
                </select>
              </div>
            </div>

            {/* Color Palette Selector */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">ORGANISM GLOW TINT</label>
              <div className="flex flex-wrap gap-2">
                {NEON_COLORS.map(color => (
                  <button
                    id={`p1-color-${color.name.toLowerCase().replace(' ', '-')}`}
                    key={color.hex}
                    type="button"
                    onClick={() => setP1(prev => ({ ...prev, color: color.hex, isConfirmed: false }))}
                    className={`px-2.5 py-1 rounded text-xs font-mono transition-all flex items-center gap-1.5 border ${
                      p1.color === color.hex
                        ? 'border-white/60 bg-white/10 font-bold'
                        : 'border-slate-850 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color.hex }}></span>
                    {color.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Python IDE Code Area */}
            <div>
              <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-1">
                <span className="flex items-center gap-1"><Code2 className="h-3 w-3" /> code_matrix.py</span>
                <span>cell(health, nearby)</span>
              </div>
              <LineNumberedEditor
                id="p1-code-editor"
                lineNumbersTestId="p1-line-numbers"
                value={p1.code}
                onChange={code => setP1(prev => ({ ...prev, code, isValid: false, validationError: null, isConfirmed: false }))}
              />
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="min-h-5 text-[11px] font-mono">
                  {p1.validationError ? (
                    <span className="text-rose-400 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{p1.validationError}</span>
                  ) : p1.isValid ? (
                    <span className="text-cyan-400 flex items-center gap-1"><Check className="h-3 w-3" />Validated</span>
                  ) : (
                    <span className="text-slate-500">Validation required</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button data-testid="p1-validate-btn" type="button" onClick={() => handleValidate(1)} className="px-3 py-1 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 hover:border-cyan-700">VALIDATE</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PLAYER 2 MATRICES EDITOR */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-850 rounded-xl p-5 shadow-2xl relative">
          <div className="absolute top-0 right-0 left-0 h-1 rounded-t-xl" style={{ backgroundColor: p2.color }}></div>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p2.color }}></span>
                Player 2 Setup
              </h2>
              <span className="text-xs font-mono text-slate-500">MATRIX 02</span>
            </div>

            {/* Config Name input & color */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">SPECIES IDENTIFIER</label>
                <input
                  id="p2-name-input"
                  type="text"
                  value={p2.name}
                  onChange={e => setP2(prev => ({ ...prev, name: e.target.value, isConfirmed: false }))}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 font-sans"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">LOAD ALGORITHMS</label>
                <select
                  id="p2-preset-select"
                  value={p2.selectedTemplate}
                  onChange={e => handleTemplateChange(2, e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 font-sans cursor-pointer"
                >
                  <option value="PREDATOR">Hunter-Predator (Aggressive)</option>
                  <option value="EXPANDING_COLONY">Colony Expansion (Multiplier)</option>
                  <option value="SENTINEL">Cautious Sentinel (Defensive)</option>
                  <option value="RANDOM_EXPLORER">Random Explorer (Wanderer)</option>
                </select>
              </div>
            </div>

            {/* Color Palette Selector */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">ORGANISM GLOW TINT</label>
              <div className="flex flex-wrap gap-2">
                {NEON_COLORS.map(color => (
                  <button
                    id={`p2-color-${color.name.toLowerCase().replace(' ', '-')}`}
                    key={color.hex}
                    type="button"
                    onClick={() => setP2(prev => ({ ...prev, color: color.hex, isConfirmed: false }))}
                    className={`px-2.5 py-1 rounded text-xs font-mono transition-all flex items-center gap-1.5 border ${
                      p2.color === color.hex
                        ? 'border-white/60 bg-white/10 font-bold'
                        : 'border-slate-850 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color.hex }}></span>
                    {color.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Python IDE Code Area */}
            <div>
              <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-1">
                <span className="flex items-center gap-1"><Code2 className="h-3 w-3" /> code_matrix.py</span>
                <span>cell(health, nearby)</span>
              </div>
              <LineNumberedEditor
                id="p2-code-editor"
                lineNumbersTestId="p2-line-numbers"
                value={p2.code}
                onChange={code => setP2(prev => ({ ...prev, code, isValid: false, validationError: null, isConfirmed: false }))}
              />
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="min-h-5 text-[11px] font-mono">
                  {p2.validationError ? (
                    <span className="text-rose-400 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{p2.validationError}</span>
                  ) : p2.isValid ? (
                    <span className="text-cyan-400 flex items-center gap-1"><Check className="h-3 w-3" />Validated</span>
                  ) : (
                    <span className="text-slate-500">Validation required</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button data-testid="p2-validate-btn" type="button" onClick={() => handleValidate(2)} className="px-3 py-1 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 hover:border-cyan-700">VALIDATE</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* HELP PANELS & GLOBAL PREPARATION CONTROLS */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Rules / Return cheat sheet */}
          <div className="bg-slate-900 border border-slate-850 rounded-xl p-4 shadow-xl">
            <h3 className="text-xs font-extrabold font-mono tracking-wider text-slate-200 border-b border-slate-850 pb-2 mb-3 flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-cyan-400" />
              MATRIX REGEXES
            </h3>
            
            <div className="space-y-3 font-mono text-[11px] leading-relaxed">
              <div>
                <p className="text-cyan-400 font-bold">"m[dir]" Move</p>
                <p className="text-slate-400 text-[10px]">Moves one square if target is empty.</p>
                <p className="text-slate-500 font-bold">e.g. "mn", "mse"</p>
              </div>
              <div className="border-t border-slate-850 pt-2">
                <p className="text-cyan-400 font-bold">"a[dir]" Eat</p>
                <p className="text-slate-400 text-[10px]">Deals 5 damage to adjacent enemy.</p>
                <p className="text-slate-500 font-bold">e.g. "aw", "ane"</p>
              </div>
              <div className="border-t border-slate-850 pt-2">
                <p className="text-cyan-400 font-bold">"r[dir]" Reproduce</p>
                <p className="text-slate-400 text-[10px]">Splits health into empty neighbor.</p>
                <p className="text-slate-500 font-bold">e.g. "rsw", "rse"</p>
              </div>
              <div className="border-t border-slate-850 pt-2">
                <p className="text-cyan-400 font-bold">"d" Rest</p>
                <p className="text-slate-400 text-[10px]">Heals +3 health. Max caps 100.</p>
              </div>
            </div>
          </div>

          {/* Core Match settings */}
          <div className="bg-slate-900 border border-slate-850 rounded-xl p-4 shadow-xl">
            <h3 className="text-xs font-extrabold font-mono tracking-wider text-slate-200 border-b border-slate-850 pb-2 mb-3 flex items-center gap-1.5">
              <Settings2 className="h-4 w-4 text-cyan-400" />
              SIMULATION SETTINGS
            </h3>

            <div className="space-y-4 font-mono text-[11px]">
              <div>
                <label className="block text-slate-400 mb-1">CYCLE TIMING (SPEED)</label>
                <div className="grid grid-cols-3 gap-1">
                  {[1, 2, 5].map(v => (
                    <button
                      id={`speed-btn-${v}`}
                      key={v}
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, speed: v as 1|2|5 }))}
                      className={`py-1 text-center font-bold font-mono rounded ${
                        settings.speed === v
                          ? 'bg-cyan-500 text-slate-950'
                          : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {v}x
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="turn-limit-input" className="block text-slate-400 mb-1">TURN LIMIT</label>
                <input
                  id="turn-limit-input"
                  type="number"
                  min={MIN_TURN_LIMIT}
                  max={MAX_TURN_LIMIT}
                  step={1}
                  value={settings.maxTurns}
                  onChange={event => {
                    const nextValue = Number(event.target.value);
                    setSettings(prev => ({
                      ...prev,
                      maxTurns: Number.isFinite(nextValue) ? nextValue : prev.maxTurns,
                    }));
                  }}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <p className="mt-1 text-[10px] text-slate-500">1-10,000. Locks after Play.</p>
                {!turnLimitValidation.isValid && (
                  <p className="mt-1 text-[10px] text-rose-400">{turnLimitValidation.error}</p>
                )}
              </div>
            </div>
          </div>

          {/* Trigger Combat Simulation */}
          <div className="pt-2">
            <button
              id="start-simulation-btn"
              onClick={onStartSimulation}
              disabled={!canStart}
              className="w-full py-4 rounded-xl font-bold font-mono text-sm tracking-wider shadow-lg transition-transform flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 hover:scale-[1.03] hover:brightness-110 active:scale-[0.98] disabled:from-slate-800 disabled:via-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              <Play className="h-4.5 w-4.5 fill-current w-4 h-4" />
              START SIMULATION
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
