/**
 * useTerminalPresenter
 * Custom hook for managing terminal state and interactions
 */

'use client';

import type { VpsServer } from "@/src/domain/entities/VpsServer";
import { useCallback, useMemo, useRef, useState } from "react";
import { TerminalPresenter, TerminalViewModel } from "./TerminalPresenter";
import { createClientTerminalPresenter } from "./TerminalPresenterClientFactory";

export interface TerminalLine {
  id: string;
  command: string;
  output: string;
  timestamp: Date;
  cwd: string; // Track the cwd at the time of execution
}

export interface TerminalState {
  onlineServers: VpsServer[];
  selectedServer: VpsServer | null;
  history: TerminalLine[];
  commandHistory: string[];
  historyIndex: number;
  currentInput: string;
  isExecuting: boolean;
  cwd: string; // Current working directory
}

export interface TerminalActions {
  setSelectedServer: (server: VpsServer | null) => void;
  setCurrentInput: (input: string) => void;
  executeCommand: (cmd: string) => Promise<void>;
  navigateHistory: (direction: 'up' | 'down') => void;
  clearHistory: () => void;
}

export function useTerminalPresenter(
  initialViewModel?: TerminalViewModel,
  presenterOverride?: TerminalPresenter
): [TerminalState, TerminalActions] {
  const presenter = useMemo(
    () => presenterOverride ?? createClientTerminalPresenter(),
    [presenterOverride]
  );

  const [state, setState] = useState<TerminalState>({
    onlineServers: initialViewModel?.onlineServers ?? [],
    selectedServer: initialViewModel?.onlineServers?.[0] ?? null,
    history: [],
    commandHistory: [],
    historyIndex: -1,
    currentInput: "",
    isExecuting: false,
    cwd: "/", // Start at root
  });

  const isMountedRef = useRef(true);

  const executeCommand = useCallback(async (cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    if (trimmedCmd.toLowerCase() === "clear") {
      setState(prev => ({ 
        ...prev, 
        history: [], 
        commandHistory: [cmd, ...prev.commandHistory],
        historyIndex: -1,
        currentInput: "" 
      }));
      return;
    }

    if (!state.selectedServer) return;

    setState(prev => ({ ...prev, isExecuting: true, currentInput: "" }));

    try {
      const result = await presenter.executeCommand(state.selectedServer.id, trimmedCmd, state.cwd);
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          history: [...prev.history, {
            id: Math.random().toString(36).substr(2, 9),
            command: cmd,
            output: result.output,
            timestamp: new Date(),
            cwd: prev.cwd, // Record the cwd at execution time
          }],
          commandHistory: [cmd, ...prev.commandHistory],
          historyIndex: -1,
          isExecuting: false,
          cwd: result.cwd, // Update to the new cwd
        }));
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          history: [...prev.history, {
            id: Math.random().toString(36).substr(2, 9),
            command: cmd,
            output: `Error: ${err.message || 'Execution failed'}`,
            timestamp: new Date(),
            cwd: prev.cwd,
          }],
          commandHistory: [cmd, ...prev.commandHistory],
          historyIndex: -1,
          isExecuting: false,
        }));
      }
    }
  }, [presenter, state.selectedServer, state.cwd]);

  const navigateHistory = useCallback((direction: 'up' | 'down') => {
    setState(prev => {
      if (direction === 'up') {
        if (prev.historyIndex < prev.commandHistory.length - 1) {
          const newIndex = prev.historyIndex + 1;
          return { ...prev, historyIndex: newIndex, currentInput: prev.commandHistory[newIndex] };
        }
      } else {
        if (prev.historyIndex > 0) {
          const newIndex = prev.historyIndex - 1;
          return { ...prev, historyIndex: newIndex, currentInput: prev.commandHistory[newIndex] };
        } else if (prev.historyIndex === 0) {
          return { ...prev, historyIndex: -1, currentInput: "" };
        }
      }
      return prev;
    });
  }, []);

  return [
    state,
    {
      setSelectedServer: (server) => setState(prev => ({ ...prev, selectedServer: server, history: [], cwd: "/" })),
      setCurrentInput: (input) => setState(prev => ({ ...prev, currentInput: input })),
      executeCommand,
      navigateHistory,
      clearHistory: () => setState(prev => ({ ...prev, history: [] })),
    }
  ];
}
