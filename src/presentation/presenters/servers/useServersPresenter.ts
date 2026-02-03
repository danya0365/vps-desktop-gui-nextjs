/**
 * useServersPresenter
 * Custom hook for servers management state
 */

'use client';

import type { CreateVpsServerData, UpdateVpsServerData } from "@/src/application/repositories/IVpsServerRepository";
import type { VpsServer } from "@/src/domain/entities/VpsServer";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ServersPresenter, ServersViewModel } from "./ServersPresenter";
import { createClientServersPresenter } from "./ServersPresenterClientFactory";

export interface ServersPresenterState {
  servers: VpsServer[];
  filteredServers: VpsServer[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  statusFilter: string;
  isAddModalOpen: boolean;
  isEditModalOpen: boolean;
  isDeleteModalOpen: boolean;
  selectedServer: VpsServer | null;
  editingServer: VpsServer | null;
  deletingServer: VpsServer | null;
}

export interface ServersPresenterActions {
  loadData: () => Promise<void>;
  setSearchTerm: (term: string) => void;
  setStatusFilter: (filter: string) => void;
  openAddModal: () => void;
  closeAddModal: () => void;
  openEditModal: (server: VpsServer) => void;
  closeEditModal: () => void;
  openDeleteModal: (server: VpsServer) => void;
  closeDeleteModal: () => void;
  openDetailModal: (server: VpsServer) => void;
  closeDetailModal: () => void;
  createServer: (data: CreateVpsServerData) => Promise<void>;
  updateServer: (id: string, data: UpdateVpsServerData) => Promise<void>;
  deleteServer: (id: string) => Promise<void>;
  refreshServer: (id: string) => Promise<void>;
}

export function useServersPresenter(
  initialViewModel?: ServersViewModel,
  presenterOverride?: ServersPresenter
): [ServersPresenterState, ServersPresenterActions] {
  const presenter = useMemo(
    () => presenterOverride ?? createClientServersPresenter(),
    [presenterOverride]
  );

  const [state, setState] = useState<ServersPresenterState>({
    servers: initialViewModel?.servers ?? [],
    filteredServers: initialViewModel?.servers ?? [],
    loading: !initialViewModel,
    error: null,
    searchTerm: "",
    statusFilter: "all",
    isAddModalOpen: false,
    isEditModalOpen: false,
    isDeleteModalOpen: false,
    selectedServer: null,
    editingServer: null,
    deletingServer: null,
  });

  const isMountedRef = useRef(true);

  // Filter logic
  useEffect(() => {
    let result = state.servers;

    if (state.searchTerm) {
      const term = state.searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.hostname.toLowerCase().includes(term) ||
          s.ipAddress.includes(term) ||
          s.tags.some((t) => t.toLowerCase().includes(term))
      );
    }

    if (state.statusFilter !== "all") {
      result = result.filter((s) => s.status === state.statusFilter);
    }

    setState(prev => ({ ...prev, filteredServers: result }));
  }, [state.searchTerm, state.statusFilter, state.servers]);

  const loadData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const viewModel = await presenter.getViewModel();
      if (isMountedRef.current) {
        setState(prev => ({ 
          ...prev, 
          servers: viewModel.servers, 
          loading: false 
        }));
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: err.message || 'Failed to load servers' 
        }));
      }
    }
  }, [presenter]);

  const createServer = useCallback(async (data: CreateVpsServerData) => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const newServer = await presenter.createServer(data);
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          servers: [newServer, ...prev.servers],
          loading: false,
          isAddModalOpen: false,
        }));
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        setState(prev => ({ ...prev, loading: false, error: err.message }));
      }
    }
  }, [presenter]);

  const updateServer = useCallback(async (id: string, data: UpdateVpsServerData) => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const updatedServer = await presenter.updateServer(id, data);
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          servers: prev.servers.map(s => s.id === id ? updatedServer : s),
          loading: false,
          isEditModalOpen: false,
          editingServer: null,
        }));
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        setState(prev => ({ ...prev, loading: false, error: err.message }));
      }
    }
  }, [presenter]);

  const deleteServer = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const success = await presenter.deleteServer(id);
      if (success && isMountedRef.current) {
        setState(prev => ({
          ...prev,
          servers: prev.servers.filter(s => s.id !== id),
          loading: false,
          isDeleteModalOpen: false,
          deletingServer: null,
        }));
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        setState(prev => ({ ...prev, loading: false, error: err.message }));
      }
    }
  }, [presenter]);

  const refreshServer = useCallback(async (id: string) => {
    try {
      const refreshed = await presenter.refreshServer(id);
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          servers: prev.servers.map(s => s.id === id ? refreshed : s)
        }));
      }
    } catch (err) {
      console.error("Error refreshing server:", err);
    }
  }, [presenter]);

  return [
    state,
    {
      loadData,
      setSearchTerm: (term) => setState(prev => ({ ...prev, searchTerm: term })),
      setStatusFilter: (filter) => setState(prev => ({ ...prev, statusFilter: filter })),
      openAddModal: () => setState(prev => ({ ...prev, isAddModalOpen: true })),
      closeAddModal: () => setState(prev => ({ ...prev, isAddModalOpen: false })),
      openEditModal: (server) => setState(prev => ({ ...prev, editingServer: server, isEditModalOpen: true })),
      closeEditModal: () => setState(prev => ({ ...prev, editingServer: null, isEditModalOpen: false })),
      openDeleteModal: (server) => setState(prev => ({ ...prev, deletingServer: server, isDeleteModalOpen: true })),
      closeDeleteModal: () => setState(prev => ({ ...prev, deletingServer: null, isDeleteModalOpen: false })),
      openDetailModal: (server) => setState(prev => ({ ...prev, selectedServer: server })),
      closeDetailModal: () => setState(prev => ({ ...prev, selectedServer: null })),
      createServer,
      updateServer,
      deleteServer,
      refreshServer,
    }
  ];
}
