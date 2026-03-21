"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ui } from "@/app/styles/ui";


type Lead = {
  id: string;
  type: string;
  status: string;
  name: string | null;
  phone: string;
  email: string | null;
  comment: string | null;
  createdAt: string;
};

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/leads", { cache: "no-store" });
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (e) {
      setError("Не удалось загрузить заявки");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main style={{ padding: "24px 0" }}>
		<div style={ui.containerAdmin}>
			<Link href="/admin" className="btn btn-ghost" style={ui.btnGhost}>
			← Назад
			</Link>
		
			<div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 12 }}>
				<h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Заявки</h1>
				<button onClick={load} className="btn btn-ghost" style={ui.btnGhost}>
					Обновить
				</button>
			</div>

			{loading && <p style={{ marginTop: 12 }}>Загрузка...</p>}
			{error && <p style={{ marginTop: 12, color: "crimson" }}>{error}</p>}

			{!loading && !error && (
				<div style={{ marginTop: 12, overflowX: "auto" }}>
				<table style={{ width: "100%", minWidth: 1200, borderCollapse: "collapse" }}>
					<thead>
					<tr>
						<th style={th}>Дата</th>
						<th style={th}>Тип</th>
						<th style={th}>Статус</th>
						<th style={th}>Имя</th>
						<th style={th}>Телефон</th>
						<th style={th}>Email</th>
						<th style={th}>Комментарий</th>
						<th style={th}>Действия</th>
					</tr>
					</thead>
					<tbody>
					{leads.map((l) => (
						<tr key={l.id}>
						<td style={td}>{new Date(l.createdAt).toLocaleString()}</td>
						<td style={td}>{l.type}</td>
						<td style={td}>{l.status}</td>
						<td style={td}>{l.name ?? "—"}</td>
						<td style={td}>{l.phone}</td>
						<td style={td}>{l.email ?? "—"}</td>
						<td style={tdClip} title={l.comment ?? ""}>{l.comment ?? "—"}</td>
						<td style={td}>
							<Link href={`/admin/leads/${l.id}`} className="btn btn-ghost" style={ui.btnGhost}>
							Открыть
							</Link>
						</td>
						</tr>
					))}
	
					{leads.length === 0 && (
						<tr>
						<td style={td} colSpan={8}>
							Заявок пока нет
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

// для ограничения длинны коментариев 
const tdClip: React.CSSProperties = {   
  padding: 10,
  borderBottom: "1px solid #f3f4f6",
  maxWidth: 260,          // ширина столбца
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};
