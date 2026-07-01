"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const FIELDS = [
  { key: "POINTS_PER_TICK", label: "Puntos por tick", desc: "Cada 2 minutos de watchtime" },
  { key: "SUBSCRIBER_MULTIPLIER", label: "Multiplicador sub", desc: "x2 = el doble de puntos si es sub" },
  { key: "CHAT_BONUS_PER_MSG", label: "Bonus por mensaje", desc: "Puntos por cada mensaje en chat" },
  { key: "DAILY_CHAT_BONUS_LIMIT", label: "Límite diario de chat", desc: "Máx. mensajes con bonus por día" },
];

export default function AdminConfig() {
  const router = useRouter();
  const [config, setConfig] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((data) => { if (!data.admin) router.push("/"); });
    fetch("/api/admin/config")
      .then((r) => r.json())
      .then((data) => {
        const c: Record<string, string> = {};
        for (const [k, v] of Object.entries(data.config)) {
          c[k] = String(v);
        }
        setConfig(c);
      });
  }, [router]);

  const save = async () => {
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("✅ Guardado");
        const c: Record<string, string> = {};
        for (const [k, v] of Object.entries(data.config)) c[k] = String(v);
        setConfig(c);
      } else {
        setMsg(`❌ ${data.error}`);
      }
    } catch {
      setMsg("❌ Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin" className="text-noke-muted hover:text-white text-sm">← Admin</Link>
        <h1 className="text-2xl font-bold">Configuración de puntos</h1>
      </div>

      <div className="space-y-4 max-w-lg">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label className="block text-sm font-medium mb-1">{f.label}</label>
            <input
              type="number"
              value={config[f.key] ?? ""}
              onChange={(e) => setConfig({ ...config, [f.key]: e.target.value })}
              className="w-full bg-noke-card border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            />
            <p className="text-noke-muted text-xs mt-1">{f.desc}</p>
          </div>
        ))}

        <button
          onClick={save}
          disabled={saving}
          className="bg-kick text-black font-bold px-6 py-2.5 rounded-lg text-sm hover:bg-kick-dark transition disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar configuración"}
        </button>

        {msg && <p className="text-sm">{msg}</p>}
      </div>
    </div>
  );
}
