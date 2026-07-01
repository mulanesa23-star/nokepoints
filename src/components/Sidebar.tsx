"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/extension", label: "Extensión" },
  { href: "/rewards", label: "Tienda" },
  { href: "/dashboard", label: "Dashboard", auth: true },
  { href: "/leaderboard", label: "Leaderboard" },
];

interface User {
  kickUsername: string;
  kickAvatar: string | null;
}

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setUser(data.user ?? null))
      .catch(() => setUser(null));
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((data) => setIsAdmin(data.admin))
      .catch(() => setIsAdmin(false));
  }, [open]);

  const nav = (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {links.map((link) => {
        if (link.auth && !user) return null;
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
              active
                ? "bg-kick/10 text-kick"
                : "text-noke-muted hover:text-white hover:bg-white/5"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
            {link.label}
          </Link>
        );
      })}
      {isAdmin && (
        <Link
          href="/admin"
          onClick={onClose}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
            pathname.startsWith("/admin")
              ? "bg-kick/10 text-kick"
              : "text-noke-muted hover:text-white hover:bg-white/5"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
          Admin
        </Link>
      )}
    </nav>
  );

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] w-64 bg-noke-dark/95 backdrop-blur border-r border-white/5 flex flex-col transform transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:z-auto`}
      >
        <div className="shrink-0 px-3 pt-4 pb-2">
          <Link href="/" className="flex items-center gap-2.5 px-3" onClick={onClose}>
            <img src="/kick-green.svg" alt="Kick" className="w-5 h-5" />
            <span className="text-lg font-bold">
              Noke<span className="text-kick">Points</span>
            </span>
          </Link>
          <div className="mt-4 h-px bg-white/5 mx-3" />
        </div>

        {nav}

        {user && (
          <div className="shrink-0 p-3 border-t border-white/5">
            <Link
              href="/dashboard"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-noke-muted hover:text-white hover:bg-white/5 transition"
            >
              {user.kickAvatar && (
                <img
                  src={user.kickAvatar}
                  alt=""
                  className="w-7 h-7 rounded-full shrink-0"
                />
              )}
              <span className="truncate">{user.kickUsername}</span>
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
