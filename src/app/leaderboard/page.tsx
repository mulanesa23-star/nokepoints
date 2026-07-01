"use client";

import { useEffect, useState } from "react";

interface LeaderboardUser {
  kickUsername: string;
  kickAvatar: string | null;
  totalEarned: number;
  points: number;
}

export default function Leaderboard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard?limit=100")
      .then((r) => r.json())
      .then((data) => setUsers(data.users ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getRankStyle = (i: number) => {
    if (i === 0) return "text-yellow-400";
    if (i === 1) return "text-gray-300";
    if (i === 2) return "text-amber-600";
    return "text-noke-muted";
  };

  return (
    <>
      <h1 className="text-3xl font-extrabold mb-2">Leaderboard</h1>
      <p className="text-noke-muted mb-8">
        Los que más puntos ganaron viendo el stream.
      </p>

      {loading ? (
        <div className="text-noke-muted">Cargando...</div>
      ) : users.length === 0 ? (
        <div className="card text-center text-noke-muted py-12">
          <div className="text-5xl mb-4">🏆</div>
          <p className="text-lg">Sin actividad todavía</p>
          <p className="text-sm mt-2">
            Instalá la extensión y mirá el stream para ser el primero.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((u, i) => (
            <div
              key={u.kickUsername}
              className="card flex items-center gap-4 py-3"
            >
              <div
                className={`w-8 text-center font-bold text-lg ${getRankStyle(i)}`}
              >
                #{i + 1}
              </div>
              {u.kickAvatar ? (
                <img
                  src={u.kickAvatar}
                  alt=""
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-noke-muted/20" />
              )}
              <div className="flex-1 font-semibold">{u.kickUsername}</div>
              <div className="text-right">
                <div className="font-bold text-kick">
                  {u.totalEarned.toLocaleString()}
                </div>
                <div className="text-xs text-noke-muted">puntos ganados</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
