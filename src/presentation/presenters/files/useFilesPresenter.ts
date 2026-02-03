/**
 * useFilesPresenter hook
 * Manages state and actions for the File Manager UI
 */

'use client';

import { FileItem } from '@/src/domain/entities/FileItem';
import { VpsServer } from '@/src/domain/entities/VpsServer';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FilesPresenter, FilesViewModel } from './FilesPresenter';
import { createClientFilesPresenter } from './FilesPresenterClientFactory';

export interface FilesPresenterState {
  viewModel: FilesViewModel;
  loading: boolean;
  error: string | null;
  selectedFile: FileItem | null;
  viewMode: 'grid' | 'list';
}

export interface FilesPresenterActions {
  navigateTo: (path: string) => Promise<void>;
  navigateUp: () => Promise<void>;
  handleFileClick: (file: FileItem) => Promise<void>;
  setSelectedServer: (server: VpsServer) => Promise<void>;
  setViewMode: (mode: 'grid' | 'list') => void;
  setSelectedFile: (file: FileItem | null) => void;
  refresh: () => Promise<void>;
}

export function useFilesPresenter(
  initialViewModel: FilesViewModel,
  presenterOverride?: FilesPresenter
): [FilesPresenterState, FilesPresenterActions] {
  const presenter = useMemo(
    () => presenterOverride ?? createClientFilesPresenter(),
    [presenterOverride]
  );

  const [state, setState] = useState<FilesPresenterState>({
    viewModel: initialViewModel,
    loading: false,
    error: null,
    selectedFile: null,
    viewMode: 'list'
  });

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const updateViewModel = useCallback(async (serverId: string, path: string) => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const viewModel = await presenter.getViewModel(serverId, path);
      if (isMountedRef.current) {
        setState(s => ({ ...s, viewModel, loading: false }));
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        setState(s => ({ ...s, loading: false, error: err.message }));
      }
    }
  }, [presenter]);

  const navigateTo = useCallback(async (path: string) => {
    if (!state.viewModel.selectedServer) return;
    await updateViewModel(state.viewModel.selectedServer.id, path);
    setState(s => ({ ...s, selectedFile: null }));
  }, [state.viewModel.selectedServer, updateViewModel]);

  const navigateUp = useCallback(async () => {
    const currentPath = state.viewModel.currentPath;
    if (currentPath === '/') return;
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    const newPath = '/' + parts.join('/');
    await navigateTo(newPath);
  }, [state.viewModel.currentPath, navigateTo]);

  const handleFileClick = useCallback(async (file: FileItem) => {
    if (file.type === 'folder') {
      await navigateTo(file.path);
    } else {
      setState(s => ({ ...s, selectedFile: file }));
    }
  }, [navigateTo]);

  const setSelectedServer = useCallback(async (server: VpsServer) => {
    await updateViewModel(server.id, '/');
    setState(s => ({ ...s, selectedFile: null }));
  }, [updateViewModel]);

  const setViewMode = useCallback((mode: 'grid' | 'list') => {
    setState(s => ({ ...s, viewMode: mode }));
  }, []);

  const setSelectedFile = useCallback((file: FileItem | null) => {
    setState(s => ({ ...s, selectedFile: file }));
  }, []);

  const refresh = useCallback(async () => {
    if (!state.viewModel.selectedServer) return;
    await updateViewModel(state.viewModel.selectedServer.id, state.viewModel.currentPath);
  }, [state.viewModel.selectedServer, state.viewModel.currentPath, updateViewModel]);

  const actions = useMemo(() => ({
    navigateTo,
    navigateUp,
    handleFileClick,
    setSelectedServer,
    setViewMode,
    setSelectedFile,
    refresh
  }), [navigateTo, navigateUp, handleFileClick, setSelectedServer, setViewMode, setSelectedFile, refresh]);

  return [state, actions];
}
