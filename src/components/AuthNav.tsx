"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface User {
  kickUsername: string;
  kickAvatar: string | null;
  points: number;
}

export default function AuthNav() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setUser(data.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="w-24 h-9 bg-noke-card animate-pulse rounded-lg" />
    );
  }

  if (user) {
    return (
      <Link
        href="/dashboard"
        className="flex items-center gap-3 bg-noke-card border border-white/5 rounded-lg px-4 py-1.5 hover:bg-white/5 transition"
      >
        {user.kickAvatar && (
          <img
            src={user.kickAvatar}
            alt=""
            className="w-7 h-7 rounded-full"
          />
        )}
        <span className="text-sm font-medium">{user.kickUsername}</span>
        <span className="text-sm font-bold text-kick">
          {user.points.toLocaleString()}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href="/api/auth/kick-start"
      className="bg-kick text-black font-semibold px-5 py-2 rounded-lg text-sm hover:bg-kick-dark transition"
    >
      Conectar con Kick
    </Link>
  );
}
