"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserData {
  id: string;
  kickUsername: string;
  kickAvatar: string | null;
  points: number;
  totalEarned: number;
  isSubscriber: boolean;
}

interface Redemption {
  id: string;
  status: string;
  note: string | null;
  createdAt: string;
  reward: {
    name: string;
    pointCost: number;
    imageUrl: string | null;
    category: string;
  };
}

const STATUS_LABELS: Record<string, { label: string; classes: string }> = {
  pending: { label: "Pendiente", classes: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20" },
  approved: { label: "Aprobado", classes: "bg-kick/10 text-kick border-kick/20" },
  rejected: { label: "Rechazado", classes: "bg-red-400/10 text-red-400 border-red-400/20" },
};

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/user/redemptions").then((r) => r.json()),
    ])
      .then(([userData, redemptionsData]) => {
        if (!userData.user) {
          router.push("/");
          return;
        }
        setUser(userData.user);
        setRedemptions(redemptionsData.redemptions ?? []);
      })
      .catch(() => router.push("/"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex items-center gap-3 text-noke-muted">
          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          Cargando...
        </div>
      </div>
    );
  }

  if (!user) return null;

  const pendingCount = redemptions.filter((r) => r.status === "pending").length;
  const approvedCount = redemptions.filter((r) => r.status === "approved").length;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-5">
        {user.kickAvatar && (
          <img src={user.kickAvatar} alt="" className="w-14 h-14 rounded-full ring-2 ring-kick/30" />
        )}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            {user.kickUsername}
            {user.isSubscriber && (
              <span className="text-xs bg-kick/10 text-kick border border-kick/20 px-2 py-0.5 rounded-full font-medium">
                Sub
              </span>
            )}
          </h1>
          <p className="text-noke-muted text-sm">Panel de control</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-noke-muted text-xs uppercase tracking-wide mb-1">Puntos actuales</div>
          <div className="text-3xl font-extrabold text-kick">
            {user.points.toLocaleString()}
          </div>
        </div>
        <div className="card text-center">
          <div className="text-noke-muted text-xs uppercase tracking-wide mb-1">Total ganado</div>
          <div className="text-3xl font-extrabold text-white">
            {user.totalEarned.toLocaleString()}
          </div>
        </div>
        <div className="card text-center">
          <div className="text-noke-muted text-xs uppercase tracking-wide mb-1">Canjeados</div>
          <div className="text-3xl font-extrabold text-white">
            {approvedCount}
          </div>
        </div>
        <div className="card text-center">
          <div className="text-noke-muted text-xs uppercase tracking-wide mb-1">Pendientes</div>
          <div className="text-3xl font-extrabold text-yellow-400">
            {pendingCount}
          </div>
        </div>
      </div>

      {redemptions.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-lg font-bold">Mis canjeos</h2>
            <Link href="/rewards" className="text-xs text-kick hover:underline">
              Ir a la tienda →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-noke-muted text-xs uppercase tracking-wide">
                  <th className="text-left px-6 py-3 font-medium">Premio</th>
                  <th className="text-left px-6 py-3 font-medium">Costo</th>
                  <th className="text-left px-6 py-3 font-medium">Fecha</th>
                  <th className="text-right px-6 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {redemptions.map((r) => {
                  const st = STATUS_LABELS[r.status] ?? STATUS_LABELS.pending;
                  return (
                    <tr key={r.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          {r.reward.imageUrl ? (
                            <img src={r.reward.imageUrl} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0 border border-white/5" />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-noke-card shrink-0 flex items-center justify-center text-noke-muted text-[10px] border border-white/5">
                              NP
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-white">{r.reward.name}</div>
                            <div className="text-noke-muted text-xs">{r.reward.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-noke-muted">
                        {r.reward.pointCost.toLocaleString()} pts
                      </td>
                      <td className="px-6 py-3.5 text-noke-muted">
                        {new Date(r.createdAt).toLocaleDateString("es-AR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full border ${st.classes}`}>
                          {st.label}
                        </span>
                        {r.status === "rejected" && r.note && (
                          <div className="text-xs text-noke-muted mt-0.5" title={r.note}>
                            {r.note}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {redemptions.length === 0 && (
        <div className="card text-center py-10">
          <div className="text-noke-muted text-sm mb-3">Todavía no canjeaste ningún premio.</div>
          <Link
            href="/rewards"
            className="bg-kick text-black font-bold px-5 py-2 rounded-lg text-sm hover:bg-kick-dark transition inline-flex items-center gap-2"
          >
            Ir a la tienda
          </Link>
        </div>
      )}

      <div className="card">
        <h2 className="text-lg font-bold mb-4">Cómo ganar puntos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-noke-card rounded-xl p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-kick/10 text-kick text-xs font-bold px-2 py-0.5 rounded">1</span>
              <span className="text-sm font-semibold">Extensión</span>
            </div>
            <p className="text-noke-muted text-xs leading-relaxed">
              Instalá la extensión en Chrome o Firefox. Disponible pronto.
            </p>
          </div>
          <div className="bg-noke-card rounded-xl p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-kick/10 text-kick text-xs font-bold px-2 py-0.5 rounded">2</span>
              <span className="text-sm font-semibold">Mirá el stream</span>
            </div>
            <p className="text-noke-muted text-xs leading-relaxed">
              Entrá a <span className="text-white">kick.com/soynokexd</span> en vivo.{" "}
              {user.isSubscriber ? "200 pts" : "100 pts"} cada 2 min.
            </p>
          </div>
          <div className="bg-noke-card rounded-xl p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-kick/10 text-kick text-xs font-bold px-2 py-0.5 rounded">3</span>
              <span className="text-sm font-semibold">Canjeá</span>
            </div>
            <p className="text-noke-muted text-xs leading-relaxed">
              Acumulá puntos y canjealos por premios en la{" "}
              <Link href="/rewards" className="text-kick hover:underline">tienda</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
