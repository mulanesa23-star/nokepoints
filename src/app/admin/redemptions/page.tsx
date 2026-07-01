"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Redemption {
  id: string;
  status: string;
  note: string | null;
  createdAt: string;
  user: { kickUsername: string; kickAvatar: string | null };
  reward: { name: string; pointCost: number };
}

export default function AdminRedemptions() {
  const router = useRouter();
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((data) => { if (!data.admin) router.push("/"); });
    load();
  }, [router]);

  const load = async () => {
    const res = await fetch("/api/admin/redemptions");
    const data = await res.json();
    setRedemptions(data.redemptions);
  };

  const process = async (id: string, status: string) => {
    const note = status === "rejected" ? prompt("Motivo del rechazo:") : null;
    await fetch(`/api/admin/redemptions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, note }),
    });
    load();
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin" className="text-noke-muted hover:text-white text-sm">← Admin</Link>
        <h1 className="text-2xl font-bold">Canjeos</h1>
      </div>

      <div className="space-y-3">
        {redemptions.length === 0 && (
          <p className="text-noke-muted text-sm">No hay canjeos todavía.</p>
        )}
        {redemptions.map((r) => (
          <div key={r.id} className="card">
            <div className="flex items-center gap-3 mb-2">
              {r.user.kickAvatar && (
                <img src={r.user.kickAvatar} alt="" className="w-8 h-8 rounded-full" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{r.user.kickUsername}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    r.status === "pending" ? "bg-yellow-400/10 text-yellow-400" :
                    r.status === "approved" ? "bg-kick/10 text-kick" :
                    "bg-red-400/10 text-red-400"
                  }`}>
                    {r.status === "pending" ? "Pendiente" : r.status === "approved" ? "Aprobado" : "Rechazado"}
                  </span>
                </div>
                <p className="text-sm">{r.reward.name} &mdash; {r.reward.pointCost.toLocaleString()} pts</p>
                <p className="text-noke-muted text-xs">{new Date(r.createdAt).toLocaleString()}</p>
              </div>
              {r.status === "pending" && (
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => process(r.id, "approved")}
                    className="bg-kick text-black font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-kick-dark transition"
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => process(r.id, "rejected")}
                    className="bg-red-400/10 text-red-400 px-3 py-1.5 rounded-lg text-xs hover:bg-red-400/20 transition"
                  >
                    Rechazar
                  </button>
                </div>
              )}
              {r.note && <p className="text-xs text-noke-muted mt-1">Nota: {r.note}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
