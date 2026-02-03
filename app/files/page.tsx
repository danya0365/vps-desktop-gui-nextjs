/**
 * FilesPage
 * Server Component for the File Manager
 */

import { FilesView } from '@/src/presentation/components/files/FilesView';
import { createServerFilesPresenter } from '@/src/presentation/presenters/files/FilesPresenterServerFactory';
import type { Metadata } from 'next';
import Link from 'next/link';

// Tell Next.js this is a dynamic page
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function generateMetadata(): Promise<Metadata> {
  const presenter = createServerFilesPresenter();
  return presenter.generateMetadata();
}

export default async function FilesPage() {
  const presenter = createServerFilesPresenter();

  try {
    // Get initial view model for the page
    const viewModel = await presenter.getViewModel();

    return (
      <FilesView initialViewModel={viewModel} />
    );
  } catch (error) {
    console.error('Error fetching Files data:', error);

    // Fallback UI
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-6">
        <div className="text-center glass p-8 rounded-3xl border border-border/50 max-w-sm">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-foreground mb-3">
            Service Interruption
          </h1>
          <p className="text-muted mb-6">
            Unable to connect to the file system repository. Please verify your SSH configuration or try again later.
          </p>
          <Link
            href="/"
            className="inline-block bg-primary text-white px-8 py-3 rounded-xl hover:bg-primary-dark transition-all shadow-lg active:scale-95"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }
}
