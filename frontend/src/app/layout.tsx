import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AgentPanel } from "@/components/AgentPanel";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SYNAPSE - Enterprise AI Recruitment",
  description: "Medical-grade AI recruitment platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex h-screen overflow-hidden bg-warm-white">
          {/* Left Sidebar - Agent Panel */}
          <aside className="w-[400px] border-r border-teal-50 flex-shrink-0 bg-warm-white flex flex-col">
            <AgentPanel />
          </aside>
          
          {/* Right Main Area - Canvas */}
          <main className="flex-1 overflow-auto bg-warm-white p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
