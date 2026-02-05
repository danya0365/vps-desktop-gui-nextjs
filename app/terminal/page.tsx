import { TerminalView } from "@/src/presentation/components/terminal/TerminalView";
import { createServerTerminalPresenter } from "@/src/presentation/presenters/terminal/TerminalPresenterServerFactory";
import type { Metadata } from "next";
import Link from "next/link";

// Tell Next.js this is a dynamic page
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

/**
 * Generate metadata for the terminal page
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "SSH Terminal | VPS Desktop",
    description: "Access your servers directly through a secure web-based SSH terminal.",
  };
}

/**
 * Terminal page - Server Component for SSH console
 */
export default async function TerminalPage() {
  const presenter = createServerTerminalPresenter();

  try {
    // Get initial view model (list of online servers)
    const viewModel = await presenter.getViewModel();

    return (
      <TerminalView initialViewModel={viewModel} />
    );
  } catch (error) {
    console.error("Error fetching terminal data:", error);

    // Fallback UI
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 text-center">
        <div className="bg-card border border-border p-10 rounded-[40px] shadow-2xl max-w-lg">
          <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-8 animate-bounce">
            ⌨️
          </div>
          <h1 className="text-3xl font-extrabold text-foreground mb-4">
            Terminal Error
          </h1>
          <p className="text-muted mb-10 text-lg leading-relaxed">
            We couldn't initialize the SSH gateway. This might be due to a configuration issue or server unavailability.
          </p>
          <div className="flex flex-col gap-4">
            <Link
              href="/terminal"
              className="bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-95"
            >
              Retry Connection
            </Link>
            <Link
              href="/servers"
              className="px-8 py-4 rounded-2xl font-bold bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
            >
              Go to Servers
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
