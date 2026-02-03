/**
 * FileContentView
 * Full-page component to display file contents with syntax highlighting (simulated)
 */

'use client';

import { IconButton } from '@/src/presentation/components/ui/IconButton';
import { animated, useSpring } from '@react-spring/web';
import Link from 'next/link';
import React from 'react';

interface FileContentViewProps {
  fileName: string;
  filePath: string;
  fileSize: number | null;
  content: string;
  serverId: string;
}

export const FileContentView: React.FC<FileContentViewProps> = ({
  fileName,
  filePath,
  fileSize,
  content,
  serverId
}) => {
  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(10px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
  });

  return (
    <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-80px)] flex flex-col space-y-4">
      <animated.div style={fadeIn} className="flex flex-col h-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div className="flex items-center gap-4">
            <Link href="/files" className="hover:scale-110 transition-transform">
              <IconButton label="Back">
                ⬅️
              </IconButton>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight truncate max-w-md">{fileName}</h1>
              <p className="text-xs text-muted font-mono">{filePath}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="text-right hidden md:block">
                <p className="text-xs text-muted uppercase tracking-widest font-semibold">Server ID</p>
                <p className="text-sm font-mono text-primary/80">{serverId}</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
               📄
             </div>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 flex flex-col bg-card border border-border rounded-3xl overflow-hidden shadow-2xl min-h-0">
          <div className="bg-muted/50 px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-xl">📄</span>
              <h3 className="font-bold text-foreground truncate max-w-[400px]">File Content: {fileName}</h3>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto bg-gray-950 p-6 md:p-8 font-mono text-sm leading-relaxed text-gray-300 custom-scrollbar">
             <pre className="whitespace-pre-wrap break-all selection:bg-primary/30">
                {content}
             </pre>
          </div>
          
          <div className="p-4 border-t border-border bg-card/50 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
            <div className="flex items-center gap-6 text-xs text-muted">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span>Read Mode Only</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Size:</span>
                <span>{fileSize ? (fileSize / 1024).toFixed(2) + ' KB' : 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Type:</span>
                <span className="capitalize">{fileName.split('.').pop() || 'Text'}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => window.print()}
                className="bg-muted hover:bg-muted/80 px-4 py-2 rounded-lg text-xs font-semibold transition-all border border-border/50"
              >
                Print Content
              </button>
              <button 
                onClick={() => {
                  const blob = new Blob([content], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = fileName;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all ring-1 ring-primary/20"
              >
                Download Locally
              </button>
            </div>
          </div>
        </div>
      </animated.div>
    </div>
  );
};
