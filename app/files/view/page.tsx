/**
 * FileViewPage
 * Server Component for viewing file content on a dedicated page
 */

import { FileContentView } from '@/src/presentation/components/files/FileContentView';
import { createServerFilesPresenter } from '@/src/presentation/presenters/files/FilesPresenterServerFactory';
import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ path?: string }> }): Promise<Metadata> {
  const { path } = await searchParams;
  const fileName = path?.split('/').pop() || 'File';
  return {
    title: `Viewing: ${fileName} | VPS File Manager`,
  };
}

interface PageProps {
  searchParams: Promise<{
    serverId?: string;
    path?: string;
  }>;
}

export default async function FileViewPage({ searchParams }: PageProps) {
  const { serverId, path } = await searchParams;

  if (!serverId || !path) {
    redirect('/files');
  }

  const presenter = createServerFilesPresenter();

  try {
    const content = await presenter.getFileContent(serverId, path);
    const fileName = path.split('/').pop() || 'Unknown';

    return (
      <FileContentView 
        fileName={fileName}
        filePath={path}
        fileSize={null} // Ideally we'd get this from FileItem metadata, but for now null is fine
        content={content}
        serverId={serverId}
      />
    );
  } catch (error) {
    console.error('Error viewing file:', error);
    
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-6">
        <div className="text-center glass p-8 rounded-3xl border border-border/50 max-w-sm">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-foreground mb-3">
            Unable to Read File
          </h1>
          <p className="text-muted mb-6">
            The file might be too large, encrypted, or inaccessible. Binary files cannot be viewed in this mode.
          </p>
          <Link
            href="/files"
            className="inline-block bg-primary text-white px-8 py-3 rounded-xl hover:bg-primary-dark transition-all shadow-lg active:scale-95"
          >
            Back to File Manager
          </Link>
        </div>
      </div>
    );
  }
}
