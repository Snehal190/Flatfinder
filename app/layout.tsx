import type { Metadata, Viewport } from "next";
import { League_Spartan } from "next/font/google";
import { GlassNav } from "@/components/ui/GlassNav";
import "./globals.css";

const spartan = League_Spartan({ subsets: ["latin"], variable: "--font-spartan", display: "swap" });

export const metadata: Metadata = {
  title: "Common Ground: find a flat you can all live with",
  description: "One form each. No peeking. Three flats you can actually talk about.",
};

export const viewport: Viewport = { themeColor: "#fdf8f3", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={spartan.variable}>
      <body className="min-h-screen font-sans">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-bg">
          Skip to content
        </a>
        <GlassNav />
        <div id="main" className="pt-20">{children}</div>
      </body>
    </html>
  );
}
