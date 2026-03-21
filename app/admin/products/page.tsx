"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ui } from "@/app/styles/ui";

type Product = {
  id: string;
  type: string;
  title: string;
  slug: string;
  priceFrom: number | null;
  isActive: boolean;
  createdAt: string;
};

export default function AdminProductsPage() {
  const [type, setType] = useState<"ALL" | "DOOR" | "WINDOW">("ALL");
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const q = type === "ALL" ? "" : `?type=${type}`;
    const res = await fetch(`/api/admin/products${q}`, { cache: "no-store" });
    const data = await res.json();
    setItems(data.products || []);
    setLoading(false);
  }
  
  async function remove(id: string) {
	if (!confirm("Удалить товар? Это действие нельзя отменить.")) return;

	const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
	const data = await res.json().catch(() => ({}));

	if (!res.ok) {
		alert(data?.error || "Не удалось удалить");
		return;
	}

	await load(); // или setProducts(...) — как у тебя сделано
  }

  useEffect(() => { load(); }, [type]);

  return (
     <main style={{ padding: "24px 0" }}>
		<div style={ui.containerAdmin}>
			<Link href="/admin" className="btn btn-ghost" style={ui.btnGhost}>
			← Назад
			</Link>
			<div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
				<h1 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>Товары</h1>
				<Link href="/admin/products/new" className="btn btn-primary" style={ui.btnPrimary}>+ Добавить</Link>
		
				<select value={type} onChange={(e) => setType(e.target.value as any)} style={select}>
				<option value="ALL">Все</option>
				<option value="DOOR">Двери</option>
				<option value="WINDOW">Окна</option>
				</select>
		
				<button onClick={load} className="btn btn-ghost" style={ui.btnGhost}>Обновить</button>
			</div>

			{loading ? (
				<p style={{ marginTop: 12 }}>Загрузка...</p>
			) : (
				<div style={{ marginTop: 12, overflowX: "auto" }}>
				<table style={{ width: "100%", borderCollapse: "collapse" }}>
					<thead>
					<tr>
						<th style={th}>Название</th>
						<th style={th}>Тип</th>
						<th style={th}>Цена от</th>
						<th style={th}>Активен</th>
						<th style={th}>Действия</th>
					</tr>
					</thead>
					<tbody>
					{items.map((p) => (
						<tr key={p.id}>
						<td style={tdTitle} title={p.title}><b>{p.title}</b></td>
						<td style={td}>{p.type}</td>
						<td style={td}>{p.priceFrom ?? "—"}</td>
						<td style={td}>{p.isActive ? "Да" : "Нет"}</td>
						<td style={td}>
							<div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
								<Link href={`/admin/products/${p.id}`} className="btn btn-ghost" style={ui.btnGhost}>Редактировать</Link>
								<button onClick={() => remove(p.id)} className="btn btn-danger" style={ui.btnDanger}>Удалить</button>
							</div>
						</td>
						</tr>
					))}
					{items.length === 0 && (
						<tr><td style={td} colSpan={6}>Пока нет товаров</td></tr>
					)}
					</tbody>
				</table>
				</div>
			)}
		</div>
	</main>
  );
}

const th: React.CSSProperties = { textAlign: "left", padding: 10, borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap" };
const td: React.CSSProperties = { padding: 10, borderBottom: "1px solid #f3f4f6", whiteSpace: "nowrap" };

const btn: React.CSSProperties = {
  padding: "10px 12px", borderRadius: 12, border: "1px solid #111827",
  background: "#111827", color: "white", textDecoration: "none", fontWeight: 700,
};

const select: React.CSSProperties = { padding: "10px 12px", borderRadius: 12, border: "1px solid #e5e7eb" };
const link: React.CSSProperties = { textDecoration: "none" };

// для ограничения длинны названия товара
const tdTitle: React.CSSProperties = {   
  padding: 10,
  borderBottom: "1px solid #f3f4f6",
  maxWidth: 550,          // ширина столбца
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};
