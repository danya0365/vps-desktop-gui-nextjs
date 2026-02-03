/**
 * FilesView
 * UI for File Manager following the pattern
 */

'use client';

import { GlassCard } from '@/src/presentation/components/ui/GlassCard';
import { IconButton } from '@/src/presentation/components/ui/IconButton';
import { WindowPanel } from '@/src/presentation/components/ui/WindowPanel';
import { FilesViewModel } from '@/src/presentation/presenters/files/FilesPresenter';
import { useFilesPresenter } from '@/src/presentation/presenters/files/useFilesPresenter';
import { animated, useSpring } from '@react-spring/web';
import React from 'react';
import { FileContentViewer } from './FileContentViewer';

interface FilesViewProps {
  initialViewModel: FilesViewModel;
}

export const FilesView: React.FC<FilesViewProps> = ({ initialViewModel }) => {
  const [state, actions] = useFilesPresenter(initialViewModel);
  const { viewModel, loading, selectedFile, viewMode } = state;
  const { servers, selectedServer, files, currentPath } = viewModel;

  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <animated.div style={fadeIn}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">File Manager</h1>
            <p className="text-muted mt-1 italic">Securely manage and transfer files via SSH protocols</p>
          </div>

          <div className="flex items-center gap-3">
            <select
              title="Select Server"
              value={selectedServer?.id || ''}
              onChange={(e) => {
                const server = servers.find((s) => s.id === e.target.value);
                if (server) actions.setSelectedServer(server);
              }}
              className="bg-card/50 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {servers.map((server) => (
                <option key={server.id} value={server.id}>
                  {server.name} ({server.ipAddress})
                </option>
              ))}
            </select>
            <div className={`w-3 h-3 rounded-full ${selectedServer?.status === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'} animate-pulse`} />
          </div>
        </div>

        <GlassCard className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2 w-full md:w-auto overflow-hidden">
              <IconButton label="Up" onClick={() => actions.navigateUp()} disabled={currentPath === '/'}>
                ⬆️
              </IconButton>
              <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap bg-background/50 border border-border px-3 py-1.5 rounded-lg w-full md:max-w-xl no-scrollbar">
                <button 
                  onClick={() => actions.navigateTo('/')}
                  className="text-muted/60 hover:text-primary transition-colors"
                >
                  /
                </button>
                {currentPath.split('/').filter(Boolean).map((part, i, arr) => (
                  <React.Fragment key={i}>
                    <button
                      onClick={() => actions.navigateTo('/' + arr.slice(0, i + 1).join('/'))}
                      className="hover:text-primary transition-colors font-medium text-sm"
                    >
                      {part}
                    </button>
                    {i < arr.length - 1 && <span className="text-muted/40">/</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex border border-border rounded-lg overflow-hidden mr-2">
                <button
                  onClick={() => actions.setViewMode('list')}
                  className={`px-3 py-1.5 text-xs font-medium transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-lg' : 'hover:bg-muted'}`}
                >
                  List
                </button>
                <button
                  onClick={() => actions.setViewMode('grid')}
                  className={`px-3 py-1.5 text-xs font-medium transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-lg' : 'hover:bg-muted'}`}
                >
                  Grid
                </button>
              </div>
              <IconButton label="Refresh" onClick={() => actions.refresh()}>
                🔄
              </IconButton>
              <IconButton label="New Folder" onClick={() => {}}>
                ➕
              </IconButton>
              <IconButton label="Upload" onClick={() => {}}>
                📤
              </IconButton>
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* File List */}
          <div className="lg:col-span-3">
            <WindowPanel title={`${currentPath} (${files.length} items)`}>
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <p className="text-muted animate-pulse">Fetching remote file system...</p>
                </div>
              ) : files.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="text-4xl mb-2 opacity-50">📂</div>
                  <p className="text-muted italic">This folder is empty</p>
                </div>
              ) : (
                <div className={viewMode === 'list' ? 'overflow-x-auto' : 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 p-2'}>
                  {viewMode === 'list' ? (
                    <table className="w-full text-left">
                      <thead className="text-xs uppercase text-muted tracking-wider border-b border-border/50">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Name</th>
                          <th className="px-4 py-3 font-semibold">Type</th>
                          <th className="px-4 py-3 font-semibold">Size</th>
                          <th className="px-4 py-3 font-semibold">Modified</th>
                          <th className="px-4 py-3 font-semibold">Owner</th>
                        </tr>
                      </thead>
                      <tbody>
                        {files.map((file) => (
                          <tr
                            key={file.id}
                            onClick={() => actions.handleFileClick(file)}
                            className={`group border-b border-border/30 hover:bg-primary/5 cursor-pointer transition-colors ${selectedFile?.id === file.id ? 'bg-primary/10' : ''}`}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <span className="text-xl group-hover:scale-110 transition-transform">{file.type === 'folder' ? '📁' : '📄'}</span>
                                <span className="font-medium group-hover:text-primary transition-colors truncate max-w-[200px]">{file.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-muted capitalize">{file.type}</td>
                            <td className="px-4 py-3 text-sm text-muted">
                              {file.type === 'file' ? (file.size ? (file.size / 1024).toFixed(1) + ' KB' : '0 KB') : '--'}
                            </td>
                            <td className="px-4 py-3 text-sm text-muted truncate">{file.modified}</td>
                            <td className="px-4 py-3 text-sm text-muted truncate">{file.owner}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    files.map((file) => (
                      <div
                        key={file.id}
                        onClick={() => actions.handleFileClick(file)}
                        className={`group p-3 rounded-xl border border-transparent hover:border-primary/30 hover:bg-primary/5 cursor-pointer flex flex-col items-center text-center transition-all ${selectedFile?.id === file.id ? 'bg-primary/10 border-primary/40 shadow-lg' : ''}`}
                      >
                        <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
                          {file.type === 'folder' ? '📁' : '📄'}
                        </div>
                        <span className="text-sm font-medium truncate w-full px-1">{file.name}</span>
                        <span className="text-[10px] text-muted uppercase tracking-tighter mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {file.type === 'folder' ? 'DIRECTORY' : (file.size ? (file.size / 1024).toFixed(1) + ' KB' : '0 KB')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </WindowPanel>
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-1">
            <WindowPanel title="Details">
              {selectedFile ? (
                <div className="space-y-6">
                  <div className="flex flex-col items-center">
                    <div className="text-6xl mb-4 p-4 rounded-2xl bg-primary/5 ring-1 ring-primary/10">
                      {selectedFile.type === 'folder' ? '📁' : '📄'}
                    </div>
                    <h2 className="text-lg font-bold break-all text-center">{selectedFile.name}</h2>
                    <p className="text-xs text-muted uppercase tracking-widest mt-1 font-semibold">{selectedFile.type}</p>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border/50">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-muted">Size:</span>
                      <span className="font-mono text-right">{selectedFile.size ? (selectedFile.size / 1024).toFixed(2) + ' KB' : '--'}</span>
                      <span className="text-muted">Modified:</span>
                      <span className="text-right truncate ml-2" title={selectedFile.modified}>{selectedFile.modified}</span>
                      <span className="text-muted">Permissions:</span>
                      <span className="font-mono text-right bg-muted/30 px-1.5 rounded">{selectedFile.permissions}</span>
                      <span className="text-muted">Owner:</span>
                      <span className="text-right truncate ml-2">{selectedFile.owner}</span>
                    </div>

                    <div className="flex flex-col gap-2 pt-4">
                      {selectedFile.type === 'file' && (
                        <>
                          <button 
                            onClick={() => actions.viewFileContent(selectedFile)}
                            className="bg-primary text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-all shadow-md transform active:scale-95 shadow-primary/20"
                          >
                            View Content
                          </button>
                          <button className="bg-muted hover:bg-muted/80 py-2.5 rounded-lg text-sm font-semibold transition-all transform active:scale-95 border border-border/50">
                            Download File
                          </button>
                        </>
                      )}
                      <button className="bg-muted hover:bg-muted/80 py-2.5 rounded-lg text-sm font-semibold transition-all transform active:scale-95 border border-border/50">
                        Rename Item
                      </button>
                      <button className="bg-red-500/10 text-red-500 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-500 hover:text-white transition-all transform active:scale-95 ring-1 ring-red-500/20">
                        Delete Forever
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center space-y-3">
                  <div className="text-4xl opacity-30">🛡️</div>
                  <p className="text-muted text-sm px-6 italic">Select a file or folder to view its properties and manage permissions</p>
                </div>
              )}
            </WindowPanel>
          </div>
        </div>
      </animated.div>

      {state.isContentViewerOpen && selectedFile && (
        <FileContentViewer 
          file={selectedFile}
          content={state.fileContent}
          loading={loading}
          onClose={actions.closeContentViewer}
        />
      )}
    </div>
  );
};
