import Link from "next/link";
import { ui } from "@/app/styles/ui";

export default function NotFound() {
  return (
    <main style={{ padding: "48px 0" }}>
      <div style={ui.container}>
        <div
          style={{
            ...ui.card,
            textAlign: "center",
            padding: "48px 24px",
            maxWidth: 720,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 900,
              lineHeight: 1,
              color: "#111827",
            }}
          >
            404
          </div>

          <h1
            style={{
              margin: "16px 0 8px",
              fontSize: 32,
              fontWeight: 900,
              color: "#111827",
            }}
          >
            Страница не найдена
          </h1>

          <p
            style={{
              margin: "0 auto 24px",
              maxWidth: 520,
              color: "#6b7280",
              lineHeight: 1.6,
            }}
          >
            Возможно, страница была удалена, перемещена или адрес введён неверно.
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link href="/"  className="btn btn-primary" style={ui.btnPrimary}>
              На главную
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}