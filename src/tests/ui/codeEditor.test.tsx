// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { CodeEditor } from '../../components/CodeEditor';
import type { PlayerConfig, SimulationSettings } from '../../types';

const source = `def cell(health, nearby):
    if health < 50:
        return "d"`;

function Harness() {
  const [p1, setP1] = useState<PlayerConfig>({
    name: 'Team One',
    color: '#22d3ee',
    code: source,
    isValid: false,
    validationError: null,
    selectedTemplate: 'CUSTOM',
    isConfirmed: false,
  });
  const [p2, setP2] = useState<PlayerConfig>({
    name: 'Team Two',
    color: '#f43f5e',
    code: source,
    isValid: false,
    validationError: null,
    selectedTemplate: 'CUSTOM',
    isConfirmed: false,
  });
  const [settings, setSettings] = useState<SimulationSettings>({
    maxTurns: 5000,
    speed: 2,
    turnDelay: 250,
  });

  return (
    <CodeEditor
      p1={p1}
      p2={p2}
      settings={settings}
      setP1={setP1}
      setP2={setP2}
      setSettings={setSettings}
      onStartSimulation={vi.fn()}
    />
  );
}

describe('CodeEditor row numbers', () => {
  it('renders row numbers beside each player function editor', () => {
    render(<Harness />);

    const p1Rows = within(screen.getByTestId('p1-line-numbers'));
    const p2Rows = within(screen.getByTestId('p2-line-numbers'));

    expect(p1Rows.getByText('1')).toBeInTheDocument();
    expect(p1Rows.getByText('2')).toBeInTheDocument();
    expect(p1Rows.getByText('3')).toBeInTheDocument();
    expect(p2Rows.getByText('1')).toBeInTheDocument();
    expect(p2Rows.getByText('2')).toBeInTheDocument();
    expect(p2Rows.getByText('3')).toBeInTheDocument();
  });
});
