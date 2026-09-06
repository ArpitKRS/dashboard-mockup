import type { Metadata } from "next";
import { Toaster } from "sonner";
import AppHeader from "@/components/layout/AppHeader";
import AppBreadcrumb from "@/components/layout/AppBreadcrumb";
import AppSidebar from "@/components/layout/AppSidebar";
import AppFooter from "@/components/layout/AppFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dashboard — Osmosis Learn",
  description: "Owner Statistics dashboard mock-up",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="min-h-screen flex flex-col">
          <AppHeader />
          <AppBreadcrumb />
          <div className="relative flex-1">
            <AppSidebar />
            <div className="ml-24">{children}</div>
          </div>
          <AppFooter />
        </div>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
