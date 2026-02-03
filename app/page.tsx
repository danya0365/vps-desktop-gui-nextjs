import { DashboardView } from "@/src/presentation/components/dashboard/DashboardView";
import { createServerDashboardPresenter } from "@/src/presentation/presenters/dashboard/DashboardPresenterServerFactory";
import type { Metadata } from "next";
import Link from "next/link";

// Tell Next.js this is a dynamic page
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

/**
 * Generate metadata for the home page
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Dashboard | VPS Desktop",
    description: "Manage your virtual private servers with ease.",
  };
}

/**
 * Dashboard page - Server Component for dashboard overview
 */
export default async function HomePage() {
  const presenter = createServerDashboardPresenter();

  try {
    // Get initial view model from presenter
    const viewModel = await presenter.getViewModel();

    return (
      <DashboardView initialViewModel={viewModel} />
    );
  } catch (error) {
    console.error("Error fetching dashboard data:", error);

    // Fallback UI
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center bg-card border border-border p-8 rounded-3xl shadow-xl max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
            ⚠️
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">
            Something went wrong
          </h1>
          <p className="text-muted mb-8 leading-relaxed">
            We couldn't load your dashboard data. This might be a temporary connection issue.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
            >
              Try to Refresh
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
