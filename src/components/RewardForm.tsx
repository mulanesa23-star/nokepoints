"use client";

import { useEffect, useState } from "react";

interface RewardData {
  id?: string;
  name: string;
  description: string;
  imageUrl: string | null;
  category: string;
  pointCost: number;
  stock: number;
  isActive: boolean;
}

interface RewardFormProps {
  initial?: RewardData | null;
  onSave: (data: RewardData) => Promise<void>;
  onCancel: () => void;
}

const CATEGORIES = ["digital", "físico", "item-mu"];

export default function RewardForm({ initial, onSave, onCancel }: RewardFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState(initial?.category ?? "digital");
  const [pointCost, setPointCost] = useState(initial?.pointCost ?? 100);
  const [stock, setStock] = useState(initial?.stock ?? 0);
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const editing = !!initial?.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !description.trim()) {
      setError("Nombre y descripción son obligatorios");
      return;
    }
    if (pointCost < 1) {
      setError("El costo debe ser al menos 1");
      return;
    }
    if (stock < 0) {
      setError("El stock no puede ser negativo");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        ...(initial?.id && { id: initial.id }),
        name: name.trim(),
        description: description.trim(),
        category,
        pointCost,
        stock,
        imageUrl: imageUrl.trim() || "",
        isActive,
      });
    } catch {
      setError("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Nombre</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-noke-card border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-kick/50 focus:outline-none"
          placeholder="Ej: Item +9 Set Dark Soul"
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full bg-noke-card border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-kick/50 focus:outline-none resize-none"
          placeholder="Stats, detalles, etc."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Categoría</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            list="cat-suggestions"
            className="w-full bg-noke-card border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-kick/50 focus:outline-none"
          />
          <datalist id="cat-suggestions">
            {CATEGORIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Costo (pts)</label>
          <input
            type="number"
            value={pointCost}
            onChange={(e) => setPointCost(Math.max(1, parseInt(e.target.value) || 1))}
            min={1}
            className="w-full bg-noke-card border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-kick/50 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Stock</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(Math.max(0, parseInt(e.target.value) || 0))}
            min={0}
            className="w-full bg-noke-card border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-kick/50 focus:outline-none"
          />
          <p className="text-noke-muted text-xs mt-0.5">0 = ilimitado</p>
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <span className="text-sm font-medium">Activo</span>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative w-10 h-5 rounded-full transition ${
                isActive ? "bg-kick" : "bg-noke-card border border-white/10"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  isActive ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Imagen URL <span className="text-noke-muted font-normal">(opcional)</span>
        </label>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full bg-noke-card border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-kick/50 focus:outline-none"
          placeholder="https://ejemplo.com/item.png"
        />
        {imageUrl && (
          <div className="mt-2 flex items-center gap-3">
            <img
              src={imageUrl}
              alt="preview"
              className="w-12 h-12 rounded-lg object-cover border border-white/10"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
              onLoad={(e) => {
                (e.target as HTMLImageElement).style.display = "";
              }}
            />
            <span className="text-xs text-noke-muted">Preview</span>
          </div>
        )}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-sm text-noke-muted hover:text-white hover:bg-white/5 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="bg-kick text-black font-bold px-6 py-2 rounded-lg text-sm hover:bg-kick-dark transition disabled:opacity-50"
        >
          {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear premio"}
        </button>
      </div>
    </form>
  );
}
