/**
 * useDashboardPresenter
 * Custom hook for dashboard state management
 */

'use client';

import { useCallback, useMemo, useRef, useState } from "react";
import { DashboardPresenter, DashboardViewModel } from "./DashboardPresenter";
import { createClientDashboardPresenter } from "./DashboardPresenterClientFactory";

export interface DashboardPresenterState {
  viewModel: DashboardViewModel | null;
  loading: boolean;
  error: string | null;
}

export interface DashboardPresenterActions {
  loadData: () => Promise<void>;
  refreshServers: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

export function useDashboardPresenter(
  initialViewModel?: DashboardViewModel,
  presenterOverride?: DashboardPresenter
): [DashboardPresenterState, DashboardPresenterActions] {
  const presenter = useMemo(
    () => presenterOverride ?? createClientDashboardPresenter(),
    [presenterOverride]
  );

  const [state, setState] = useState<DashboardPresenterState>({
    viewModel: initialViewModel ?? null,
    loading: !initialViewModel,
    error: null,
  });

  const isMountedRef = useRef(true);

  const loadData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const viewModel = await presenter.getViewModel();
      if (isMountedRef.current) {
        setState({ viewModel, loading: false, error: null });
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        setState(prev => ({ ...prev, loading: false, error: err.message || 'Failed to load dashboard data' }));
      }
    }
  }, [presenter]);

  const refreshServers = useCallback(async () => {
    try {
      const servers = await presenter.getServers();
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          viewModel: prev.viewModel ? { ...prev.viewModel, servers } : { servers, stats: null }
        }));
      }
    } catch (err: any) {
      console.error("Error refreshing servers:", err);
    }
  }, [presenter]);

  const refreshStats = useCallback(async () => {
    try {
      const stats = await presenter.getStats();
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          viewModel: prev.viewModel ? { ...prev.viewModel, stats } : { servers: [], stats }
        }));
      }
    } catch (err: any) {
      console.error("Error refreshing stats:", err);
    }
  }, [presenter]);

  return [state, { loadData, refreshServers, refreshStats }];
}
