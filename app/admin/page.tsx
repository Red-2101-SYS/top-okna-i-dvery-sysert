"use client";

import Link from "next/link";
import { useState } from "react";
import { ui } from "@/app/styles/ui";

export default function AdminHome() {
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await fetch("/api/admin/logout", { method: "POST" });
      window.location.href = "/admin/login";
    } catch {
      alert("Не удалось выйти из аккаунта");
      setLoggingOut(false);
    }
  }

  return (
    <main style={{ padding: 24 }}>
		<div style={ ui.containerDA900 }>
			<div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 12 }}>
			<h1 style={{ fontSize: 24, fontWeight: 700 }}>Панель Администратора</h1>	
				<button onClick={handleLogout} className="btn btn-ghost" disabled={loggingOut} style={ui.btnGhost}>
				{loggingOut ? "Выходим..." : "Выйти"}
				</button>
			</div>
					
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