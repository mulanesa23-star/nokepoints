"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminDashboard() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [stats, setStats] = useState<any>(null);

  const [username, setUsername] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.admin) { router.push("/"); return; }
        setIsAdmin(true);
      })
      .catch(() => router.push("/"));
  }, [router]);

  useEffect(() => {
    if (isAdmin) {
      fetch("/api/admin/config")
        .then((r) => r.json())
        .then((data) => setStats(data.config))
        .catch(() => {});
    }
  }, [isAdmin]);

  const adjustPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    const num = parseInt(amount, 10);
    if (!username.trim() || isNaN(num) || num === 0) return;

    setSending(true);
    try {
      const res = await fetch("/api/admin/points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kickUsername: username.trim(), amount: num, note: note.trim() || undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({
          ok: true,
          msg: `${num > 0 ? "Regalados" : "Sacados"} ${Math.abs(num)} pts a ${data.user.kickUsername} (${data.user.previousPoints} → ${data.user.currentPoints})`,
        });
        setUsername("");
        setAmount("");
        setNote("");
      } else {
        setResult({ ok: false, msg: data.error });
      }
    } catch {
      setResult({ ok: false, msg: "Error de conexión" });
    } finally {
      setSending(false);
    }
  };

  if (isAdmin === null) return <div className="text-noke-muted py-24 text-center">Verificando...</div>;
  if (!isAdmin) return null;

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-2">Panel Admin</h1>
      <p className="text-noke-muted mb-8">Gestioná los premios, la configuración y los canjeos.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Link href="/admin/rewards" className="card hover:border-kick/30 transition">
          <h2 className="text-lg font-bold mb-1">🏆 Premios</h2>
          <p className="text-noke-muted text-sm">Creá, editá y desactivá premios canjeables.</p>
        </Link>
        <Link href="/admin/config" className="card hover:border-kick/30 transition">
          <h2 className="text-lg font-bold mb-1">⚙️ Configuración</h2>
          <p className="text-noke-muted text-sm">Ajustá puntos por tick, bonus de chat, límites.</p>
        </Link>
        <Link href="/admin/redemptions" className="card hover:border-kick/30 transition">
          <h2 className="text-lg font-bold mb-1">📦 Canjeos</h2>
          <p className="text-noke-muted text-sm">Aprobá o rechazá solicitudes de canje.</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        <div className="card">
          <h2 className="text-lg font-bold mb-4">🎁 Ajustar puntos</h2>
          <form onSubmit={adjustPoints} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Username de Kick</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-noke-card border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-kick/50 focus:outline-none"
                placeholder="soynokexd"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Cantidad{" "}
                <span className="text-noke-muted font-normal">
                  (positivo = regalar, negativo = sacar)
                </span>
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-noke-card border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-kick/50 focus:outline-none"
                placeholder="1000"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Motivo{" "}
                <span className="text-noke-muted font-normal">(opcional)</span>
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-noke-card border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-kick/50 focus:outline-none"
                placeholder="Ej: Premio especial, penalización..."
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="bg-kick text-black font-bold px-5 py-2 rounded-lg text-sm hover:bg-kick-dark transition disabled:opacity-50"
            >
              {sending ? "Aplicando..." : "Aplicar"}
            </button>
            {result && (
              <p className={`text-sm ${result.ok ? "text-kick" : "text-red-400"}`}>
                {result.ok ? "✅ " : "❌ "}{result.msg}
              </p>
            )}
          </form>
        </div>

        {stats && (
          <div className="card">
            <h2 className="text-lg font-bold mb-4">Config actual</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-noke-muted text-xs">Puntos por tick</div>
                <div className="text-white font-bold">{stats.POINTS_PER_TICK}</div>
              </div>
              <div>
                <div className="text-noke-muted text-xs">Multiplicador sub</div>
                <div className="text-white font-bold">x{stats.SUBSCRIBER_MULTIPLIER}</div>
              </div>
              <div>
                <div className="text-noke-muted text-xs">Bonus por mensaje</div>
                <div className="text-white font-bold">{stats.CHAT_BONUS_PER_MSG}</div>
              </div>
              <div>
                <div className="text-noke-muted text-xs">Límite diario chat</div>
                <div className="text-white font-bold">{stats.DAILY_CHAT_BONUS_LIMIT}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
