import Link from "next/link";
import { ui } from "@/app/styles/ui";

export default function AdminHome() {
  return (
    <main style={{ padding: 24 }}>
		<div style={ ui.containerDA900 }>
			<h1 style={{ fontSize: 24, fontWeight: 700 }}>Панель Администратора</h1>
			<p style={heroText}>
				Добро пожаловать в панель админстратора! Здесь вы можете управлять товарами на сайте и работать с заявками от клиентов.
			</p>
			<div style={{ marginTop: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
				<Link href="/admin/products" className="btn btn-ghost"  style={ui.btnGhost}>Товары</Link>
				<Link href="/admin/services"className="btn btn-ghost" style={ui.btnGhost}>Услуги</Link>
				<Link href="/admin/leads"className="btn btn-ghost" style={ui.btnGhost}>Заявки</Link>
			</div>
		</div>
	</main>
  );
}

const heroText: React.CSSProperties = { color: "#6b7280", marginTop: 6, lineHeight: 1.6, fontSize: 16 };