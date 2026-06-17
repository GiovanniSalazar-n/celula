// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { CodeEditor } from '../../components/CodeEditor';
import type { PlayerConfig, SimulationSettings } from '../../types';

const source = `def cell(health, nearby):
    if health < 50:
        return "d"
    return "mn"`;

const invalidSource = `def cell(life, nearby):
    return "d"`;

const forbiddenSource = `def cell(health, nearby):
    while True:
        return "d"`;

function Harness({ p1Code = source }: { p1Code?: string } = {}) {
  const [p1, setP1] = useState<PlayerConfig>({
    name: 'Team One',
    color: '#22d3ee',
    code: p1Code,
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

describe('CodeEditor validation feedback', () => {
  it('shows validated feedback after the current validator accepts a player function', () => {
    render(<Harness />);

    fireEvent.click(screen.getByTestId('p1-validate-btn'));

    expect(screen.getByText('Validated')).toBeInTheDocument();
  });

  it('shows the current validator error next to the editor when validation fails', () => {
    render(<Harness p1Code={invalidSource} />);

    fireEvent.click(screen.getByTestId('p1-validate-btn'));

    expect(screen.getByText('Function must receive exactly health and nearby arguments.')).toBeInTheDocument();
  });

  it('shows forbidden syntax errors from the v2 validator', () => {
    render(<Harness p1Code={forbiddenSource} />);

    fireEvent.click(screen.getByTestId('p1-validate-btn'));

    expect(screen.getByText('while loops are not allowed.')).toBeInTheDocument();
  });

  it('loads and validates the helper-based colony template', () => {
    render(<Harness />);

    fireEvent.change(screen.getAllByLabelText('LOAD ALGORITHMS')[0], {
      target: { value: 'EXPANDING_COLONY' },
    });
    fireEvent.click(screen.getByTestId('p1-validate-btn'));

    expect(screen.getByDisplayValue(/for direction in emptyDirections\(\):/)).toBeInTheDocument();
    expect(screen.getByText('Validated')).toBeInTheDocument();
  });

  it('shows v2 loop and helper guidance in the existing help panel', () => {
    render(<Harness />);

    expect(screen.getByText('v2 helpers')).toBeInTheDocument();
    expect(screen.getByText(/for direction in emptyDirections/)).toBeInTheDocument();
    expect(screen.getByText(/No while, import, fetch, timers, or browser globals/)).toBeInTheDocument();
  });
});
