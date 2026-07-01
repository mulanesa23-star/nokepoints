"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

interface Reward {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  category: string;
  pointCost: number;
  stock: number;
}

type SortKey = "cheapest" | "costliest" | "newest" | "az";

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [msg, setMsg] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("cheapest");
  const [affordableOnly, setAffordableOnly] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user ?? null));
    fetch("/api/rewards")
      .then((r) => r.json())
      .then((d) => {
        setRewards(d.rewards);
        setUserPoints(d.userPoints);
      });
  }, []);

  const redeem = async (rewardId: string) => {
    setMsg("");
    const res = await fetch("/api/rewards/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rewardId }),
    });
    const data = await res.json();
    if (res.ok) {
      setUserPoints(data.points);
      setMsg(`✅ Canjeado con éxito!`);
      setRewards((prev) =>
        prev.map((r) =>
          r.id === rewardId && r.stock > 0 ? { ...r, stock: r.stock - 1 } : r
        )
      );
    } else {
      setMsg(`❌ ${data.error}`);
    }
  };

  const categories = useMemo(() => {
    const set = new Set(rewards.map((r) => r.category));
    return Array.from(set).sort();
  }, [rewards]);

  const filtered = useMemo(() => {
    let items = [...rewards];

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (r) => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== "all") {
      items = items.filter((r) => r.category === categoryFilter);
    }

    if (affordableOnly && user) {
      items = items.filter((r) => userPoints >= r.pointCost);
    }

    switch (sortKey) {
      case "costliest": items.sort((a, b) => b.pointCost - a.pointCost); break;
      case "newest": break; // already sorted desc by API
      case "az": items.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: items.sort((a, b) => a.pointCost - b.pointCost); break; // cheapest
    }

    return items;
  }, [rewards, search, categoryFilter, sortKey, affordableOnly, user, userPoints]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold">Tienda de premios</h1>
          <p className="text-noke-muted">Canjeá tus puntos por premios exclusivos de soynokexd.</p>
        </div>
        {user && (
          <div className="bg-noke-card border border-white/10 rounded-xl px-5 py-3 text-center sm:text-right shrink-0">
            <div className="text-noke-muted text-xs">Tus puntos</div>
            <div className="text-2xl font-bold text-kick">{userPoints.toLocaleString()}</div>
          </div>
        )}
      </div>

      {!user && (
        <div className="card text-center py-8 mb-8">
          <p className="text-noke-muted mb-4">Iniciá sesión para poder canjear premios.</p>
          <Link
            href="/api/auth/kick-start"
            className="bg-kick text-black font-bold px-6 py-2.5 rounded-lg text-sm hover:bg-kick-dark transition inline-flex items-center gap-2"
          >
            <img src="/kick-black.svg" alt="" className="w-4 h-4" />
            Conectar con Kick
          </Link>
        </div>
      )}

      {msg && (
        <div className="card border-kick/30 mb-6 text-sm">{msg}</div>
      )}

      <div className="flex flex-wrap gap-3 mb-8">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-noke-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar premios..."
            className="w-full bg-noke-card border border-white/10 rounded-lg pl-9 pr-3 py-2 text-white text-sm focus:border-kick/50 focus:outline-none"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-noke-card border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-kick/50 focus:outline-none"
        >
          <option value="all">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="bg-noke-card border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-kick/50 focus:outline-none"
        >
          <option value="cheapest">Menor precio</option>
          <option value="costliest">Mayor precio</option>
          <option value="newest">Más nuevo</option>
          <option value="az">A-Z</option>
        </select>

        {user && (
          <label className="flex items-center gap-2 text-sm text-noke-muted cursor-pointer shrink-0 bg-noke-card border border-white/10 rounded-lg px-3 py-2 hover:text-white transition">
            <input
              type="checkbox"
              checked={affordableOnly}
              onChange={(e) => setAffordableOnly(e.target.checked)}
              className="accent-kick"
            />
            Solo canjeables
          </label>
        )}
      </div>

      {filtered.length === 0 && (
        <p className="text-noke-muted text-sm py-12 text-center">
          {rewards.length === 0
            ? "No hay premios disponibles todavía."
            : "No se encontraron premios con esos filtros."}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((r) => {
          const canAfford = user && userPoints >= r.pointCost;
          const outOfStock = r.stock <= 0;
          return (
            <div key={r.id} className="card flex flex-col">
              {r.imageUrl ? (
                <img src={r.imageUrl} alt="" className="w-full h-40 object-cover rounded-lg mb-3 border border-white/5" />
              ) : (
                <div className="w-full h-40 rounded-lg bg-noke-card mb-3 flex items-center justify-center text-noke-muted text-xs border border-white/5">
                  Sin imagen
                </div>
              )}
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg">{r.name}</h3>
                <span className="text-xs bg-noke-card border border-white/10 px-2 py-0.5 rounded shrink-0">{r.category}</span>
              </div>
              <p className="text-noke-muted text-sm flex-1">{r.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <span className="text-kick font-bold text-lg">{r.pointCost.toLocaleString()}</span>
                  <span className="text-noke-muted text-xs ml-1">pts</span>
                  {r.stock > 0 && (
                    <span className="text-noke-muted text-xs block">Stock: {r.stock}</span>
                  )}
                </div>
                <button
                  onClick={() => redeem(r.id)}
                  disabled={!user || !canAfford || outOfStock}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    !user ? "bg-noke-card text-noke-muted border border-white/10 cursor-not-allowed" :
                    canAfford && !outOfStock ? "bg-kick text-black hover:bg-kick-dark" :
                    "bg-noke-card text-noke-muted border border-white/10 cursor-not-allowed"
                  }`}
                >
                  {!user ? "Conectate" : outOfStock ? "Sin stock" : !canAfford ? "Faltan pts" : "Canjear"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
