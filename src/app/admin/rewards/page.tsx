"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Modal from "@/components/Modal";
import RewardForm from "@/components/RewardForm";

interface Reward {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  category: string;
  pointCost: number;
  stock: number;
  isActive: boolean;
}

type SortKey = "newest" | "oldest" | "costliest" | "cheapest" | "az" | "za";
type StatusFilter = "all" | "active" | "inactive";

export default function AdminRewards() {
  const router = useRouter();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [editTarget, setEditTarget] = useState<Reward | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("newest");

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((data) => { if (!data.admin) router.push("/"); });
    load();
  }, [router]);

  const load = async () => {
    const res = await fetch("/api/admin/rewards");
    const data = await res.json();
    setRewards(data.rewards);
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

    if (statusFilter === "active") items = items.filter((r) => r.isActive);
    else if (statusFilter === "inactive") items = items.filter((r) => !r.isActive);

    switch (sortKey) {
      case "oldest": items.reverse(); break;
      case "costliest": items.sort((a, b) => b.pointCost - a.pointCost); break;
      case "cheapest": items.sort((a, b) => a.pointCost - b.pointCost); break;
      case "az": items.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "za": items.sort((a, b) => b.name.localeCompare(a.name)); break;
      default: break; // newest (already sorted desc by createdAt)
    }

    return items;
  }, [rewards, search, categoryFilter, statusFilter, sortKey]);

  const saveReward = async (data: any) => {
    if (data.id) {
      const res = await fetch(`/api/admin/rewards/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          category: data.category,
          pointCost: data.pointCost,
          stock: data.stock,
          imageUrl: data.imageUrl || null,
          isActive: data.isActive,
        }),
      });
      if (!res.ok) throw new Error();
    } else {
      const res = await fetch("/api/admin/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
    }
    await load();
    setShowCreate(false);
    setEditTarget(null);
  };

  const toggle = async (r: Reward) => {
    await fetch(`/api/admin/rewards/${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !r.isActive }),
    });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar este premio definitivamente?")) return;
    await fetch(`/api/admin/rewards/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-noke-muted hover:text-white text-sm">← Admin</Link>
          <h1 className="text-2xl font-bold">Premios</h1>
          <span className="text-noke-muted text-sm">({filtered.length} de {rewards.length})</span>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-kick text-black font-bold px-4 py-2 rounded-lg text-sm hover:bg-kick-dark transition"
        >
          + Nuevo premio
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
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
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="bg-noke-card border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-kick/50 focus:outline-none"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>

        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="bg-noke-card border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-kick/50 focus:outline-none"
        >
          <option value="newest">Más nuevo</option>
          <option value="oldest">Más antiguo</option>
          <option value="costliest">Más caro</option>
          <option value="cheapest">Más barato</option>
          <option value="az">A-Z</option>
          <option value="za">Z-A</option>
        </select>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-noke-muted text-sm py-8 text-center">
            {rewards.length === 0
              ? "No hay premios todavía. Creá el primero."
              : "No se encontraron premios con esos filtros."}
          </p>
        )}
        {filtered.map((r) => (
          <div key={r.id} className={`card flex items-center gap-4 ${!r.isActive ? "opacity-50" : ""}`}>
            {r.imageUrl ? (
              <img src={r.imageUrl} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0 border border-white/5" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-noke-card shrink-0 flex items-center justify-center text-noke-muted text-xs border border-white/5">
                sin img
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold">{r.name}</h3>
                <span className="text-xs bg-noke-card border border-white/10 px-2 py-0.5 rounded">{r.category}</span>
                {!r.isActive && <span className="text-xs text-red-400 font-medium">inactivo</span>}
              </div>
              <p className="text-noke-muted text-sm truncate">{r.description}</p>
              <div className="flex items-center gap-4 text-xs text-noke-muted mt-1">
                <span className="text-kick font-bold">{r.pointCost.toLocaleString()} pts</span>
                <span>Stock: {r.stock > 0 ? r.stock : "∞"}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setEditTarget(r)}
                className="text-xs px-3 py-1.5 rounded-lg bg-noke-card border border-white/10 text-noke-muted hover:text-white hover:border-white/20 transition"
              >
                Editar
              </button>
              <button
                onClick={() => toggle(r)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                  r.isActive ? "bg-noke-card border-white/10 text-yellow-400 hover:border-yellow-400/30" : "bg-kick/10 border-kick/20 text-kick hover:bg-kick/20"
                }`}
              >
                {r.isActive ? "Desactivar" : "Activar"}
              </button>
              <button
                onClick={() => remove(r.id)}
                className="text-xs px-3 py-1.5 rounded-lg bg-noke-card border border-white/10 text-red-400 hover:border-red-400/30 transition"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nuevo premio">
        <RewardForm onSave={saveReward} onCancel={() => setShowCreate(false)} />
      </Modal>

      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title={`Editar: ${editTarget?.name ?? ""}`}
      >
        <RewardForm
          initial={editTarget}
          onSave={saveReward}
          onCancel={() => setEditTarget(null)}
        />
      </Modal>
    </div>
  );
}
