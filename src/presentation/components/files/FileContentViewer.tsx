/**
 * FileContentViewer
 * Modal component to display file contents with syntax highlighting (simulated)
 */

'use client';

import { FileItem } from '@/src/domain/entities/FileItem';
import { animated, useSpring } from '@react-spring/web';
import React from 'react';

interface FileContentViewerProps {
  file: FileItem;
  content: string | null;
  loading: boolean;
  onClose: () => void;
}

export const FileContentViewer: React.FC<FileContentViewerProps> = ({
  file,
  content,
  loading,
  onClose
}) => {
  const overlaySpring = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
  });

  const modalSpring = useSpring({
    from: { opacity: 0, transform: 'scale(0.95)' },
    to: { opacity: 1, transform: 'scale(1)' },
  });

  return (
    <animated.div 
      style={overlaySpring}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <animated.div 
        style={modalSpring}
        className="w-full max-w-4xl h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <WindowPanel 
          title={`Viewing: ${file.name}`}
          icon="📄"
          className="flex-1 flex flex-col"
          onClose={onClose}
        >
          <div className="flex-1 overflow-auto bg-gray-950 p-6 font-mono text-sm text-gray-300 relative">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/80">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                <p className="text-muted animate-pulse font-sans">Reading remote file...</p>
              </div>
            ) : content !== null ? (
              <pre className="whitespace-pre-wrap break-all leading-relaxed">
                {content}
              </pre>
            ) : (
              <div className="flex items-center justify-center h-full text-red-500 font-sans italic">
                Failed to load file content.
              </div>
            )}
          </div>
          <div className="p-4 border-t border-border bg-card/50 flex justify-between items-center">
            <div className="text-xs text-muted flex gap-4">
              <span>Path: <code className="text-primary/70">{file.path}</code></span>
              <span>Size: <code className="text-primary/70">{file.size ? (file.size / 1024).toFixed(2) + ' KB' : 'Unknown'}</code></span>
            </div>
            <button 
              onClick={onClose}
              className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-all"
            >
              Close Viewer
            </button>
          </div>
        </WindowPanel>
      </animated.div>
    </animated.div>
  );
};

// Internal small version of WindowPanel to avoid potential circularity or missing props
const WindowPanel: React.FC<{ 
  title: string; 
  icon?: string; 
  onClose: () => void; 
  children: React.ReactNode;
  className?: string;
}> = ({ title, icon, onClose, children, className }) => (
  <div className={`bg-card border border-border rounded-3xl overflow-hidden shadow-2xl ${className}`}>
    <div className="bg-muted/50 px-6 py-4 border-b border-border flex items-center justify-between">
      <div className="flex items-center gap-3">
        {icon && <span className="text-xl">{icon}</span>}
        <h3 className="font-bold text-foreground truncate max-w-[400px]">{title}</h3>
      </div>
      <button 
        onClick={onClose}
        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all text-muted"
        title="Close"
      >
        ✕
      </button>
    </div>
    {children}
  </div>
);
