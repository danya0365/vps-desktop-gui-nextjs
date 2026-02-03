import { ServersView } from "@/src/presentation/components/servers/ServersView";
import { createServerServersPresenter } from "@/src/presentation/presenters/servers/ServersPresenterServerFactory";
import type { Metadata } from "next";
import Link from "next/link";

// Tell Next.js this is a dynamic page
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

/**
 * Generate metadata for the servers page
 */
export async function generateMetadata(): Promise<Metadata> {
  const presenter = createServerServersPresenter();
  return presenter.generateMetadata();
}

/**
 * Servers Management page - Server Component for listing and managing VPS instances
 */
export default async function ServersPage() {
  const presenter = createServerServersPresenter();

  try {
    // Get initial view model from presenter
    const viewModel = await presenter.getViewModel();

    return (
      <ServersView initialViewModel={viewModel} />
    );
  } catch (error) {
    console.error("Error fetching servers data:", error);

    // Fallback UI
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="text-center bg-card border border-border p-10 rounded-[40px] shadow-2xl max-w-lg">
          <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-8 animate-bounce">
            🛰️
          </div>
          <h1 className="text-3xl font-extrabold text-foreground mb-4">
            Connection Lost
          </h1>
          <p className="text-muted mb-10 text-lg leading-relaxed">
            We were unable to establish a secure connection to your server repository. Please try again or contact support.
          </p>
          <div className="flex flex-col gap-4">
            <Link
              href="/servers"
              className="bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-95 text-center"
            >
              Reconnect Now
            </Link>
            <Link
              href="/"
              className="px-8 py-4 rounded-2xl font-bold bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all text-center"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
