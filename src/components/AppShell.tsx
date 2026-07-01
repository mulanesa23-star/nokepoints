"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import AuthNav from "@/components/AuthNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-16 border-b border-white/5 bg-noke-dark/80 backdrop-blur sticky top-0 z-30">
        <div className="flex items-center justify-between h-full px-4 lg:pl-72 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-noke-muted hover:text-white p-2 -ml-2"
              aria-label="Menú"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <Link href="/" className="flex items-center gap-2 text-xl font-bold">
              <img src="/kick-green.svg" alt="" className="w-5 h-5" />
              Noke<span className="text-kick">Points</span>
            </Link>
          </div>
          <AuthNav />
        </div>
      </header>

      <div className="flex flex-1">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 min-w-0 px-4 md:px-8 py-8 lg:pl-72 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
