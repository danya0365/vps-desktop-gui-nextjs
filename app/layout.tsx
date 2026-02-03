import "@/public/styles/index.css";
import { MainLayout } from "@/src/presentation/layouts/MainLayout";
import { ThemeProvider } from "@/src/presentation/providers/ThemeProvider";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VPS Desktop GUI",
  description: "Web-based Desktop GUI for VPS Management",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <MainLayout title="VPS Desktop">
            {children}
          </MainLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
