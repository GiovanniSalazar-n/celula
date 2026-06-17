// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { CodeEditor } from '../../components/CodeEditor';
import type { PlayerConfig, SimulationSettings } from '../../types';

const validSource = `def cell(health, nearby):
    if health < 50:
        return "d"
    return "mn"`;

function createPlayer(overrides: Partial<PlayerConfig> = {}): PlayerConfig {
  return {
    name: 'Team One',
    color: '#22d3ee',
    code: validSource,
    isValid: false,
    validationError: null,
    selectedTemplate: 'CUSTOM',
    isConfirmed: false,
    ...overrides,
  };
}

function Harness({ onStartSimulation = vi.fn() }: { onStartSimulation?: () => void }) {
  const [p1, setP1] = useState<PlayerConfig>(createPlayer());
  const [p2, setP2] = useState<PlayerConfig>(
    createPlayer({
      name: 'Team Two',
      color: '#f43f5e',
    }),
  );
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
      onStartSimulation={onStartSimulation}
    />
  );
}

describe('configuration screen Play gate', () => {
  it('blocks Play until both player functions are validated', () => {
    const onStartSimulation = vi.fn();
    render(<Harness onStartSimulation={onStartSimulation} />);

    const startButton = screen.getByRole('button', { name: /start simulation/i });
    expect(startButton).toBeDisabled();

    fireEvent.click(screen.getByTestId('p1-validate-btn'));
    fireEvent.click(screen.getByTestId('p2-validate-btn'));

    expect(startButton).toBeEnabled();
    fireEvent.click(startButton);
    expect(onStartSimulation).toHaveBeenCalledTimes(1);
  });

  it('shows a turn selector that accepts values from 1 to 10000 before Play', () => {
    render(<Harness />);

    const turnInput = screen.getByLabelText(/turn limit/i);
    expect(turnInput).toHaveValue(5000);

    fireEvent.change(turnInput, { target: { value: '10000' } });
    expect(turnInput).toHaveValue(10000);

    fireEvent.change(turnInput, { target: { value: '1' } });
    expect(turnInput).toHaveValue(1);
  });
});
