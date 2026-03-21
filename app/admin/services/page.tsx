"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ui } from "@/app/styles/ui";

type Service = {
  id: string;
  title: string;
  slug: string;
  badge: string | null;
  sort: number;
  priceFrom: number | null;
  isActive: boolean;
  createdAt: string;
  description: string;
};

export default function AdminServicesPage() {
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/services", { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data?.error || "Не удалось загрузить услуги");
      setLoading(false);
      return;
    }
    setItems(data.services || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id: string) {
    if (!confirm("Удалить услугу?")) return;

    const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data?.error || "Не удалось удалить");
      return;
    }
    await load();
  }

  return (
    <main style={{ padding: "24px 0" }}>
      <div style={ui.containerAdmin}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "grid", gap: 6 }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>Услуги</h1>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <Link href="/admin" className="btn btn-ghost" style={ui.btnGhost}>
              ← Назад
            </Link>
            <button onClick={load} className="btn btn-ghost" style={ui.btnGhost}>
              Обновить
            </button>
            <Link href="/admin/services/new" className="btn btn-primary" style={ui.btnPrimary}>
              + Добавить услугу
            </Link>
          </div>
        </div>

        {error && <p style={{ marginTop: 12, color: "crimson", fontWeight: 700 }}>{error}</p>}
        {loading && <p style={{ marginTop: 12 }}>Загрузка...</p>}

        {!loading && !error && (
          <div style={{ marginTop: 12, overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: 1200, borderCollapse: "collapse" }}>
              <thead>
                <tr>
					<th style={th}>Сорт.</th>
					<th style={th}>Название</th>
					<th style={th}>Бейдж</th>
					<th style={th}>Цена от</th>
					<th style={th}>Активна</th>
					<th style={th}>Описание</th>
					<th style={th}>Действия</th>
				</tr>
              </thead>
              <tbody>
                {items.map((s) => (
					<tr key={s.id}>
						<td style={td}>{s.sort}</td>
						<td style={tdClip} title={s.title}>{s.title}</td>
						<td style={td}>{s.badge ?? "—"}</td>
						<td style={td}>{s.priceFrom ?? "—"}</td>
						<td style={td}>{s.isActive ? "Да" : "Нет"}</td>
						
						<td style={tdClipWide} title={s.description ?? ""}>
							{s.description ?? "—"}
						</td>

						<td style={td}>
							<div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
							<Link href={`/admin/services/${s.id}`} className="btn btn-ghost" style={ui.btnGhost}>
								Редактировать
							</Link>
							<button onClick={() => remove(s.id)} className="btn btn-danger" style={btnDanger}>
								Удалить
							</button>
							</div>
						</td>
					</tr>
                ))}

                {items.length === 0 && (
                  <tr>
                    <td style={td} colSpan={9}>
                      Услуг пока нет
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  padding: 10,
  borderBottom: "1px solid #e5e7eb",
  whiteSpace: "nowrap",
};

const td: React.CSSProperties = {
  padding: 10,
  borderBottom: "1px solid #f3f4f6",
  whiteSpace: "nowrap",
};

const tdClip: React.CSSProperties = {
  padding: 10,
  borderBottom: "1px solid #f3f4f6",
  maxWidth: 260,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const tdClipWide: React.CSSProperties = {
  ...tdClip,
  maxWidth: 360, // можно 300–500
};

const btnDanger: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #ef4444",
  background: "#ef4444",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};