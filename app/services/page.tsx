"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ui } from "@/app/styles/ui";

type Service = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  imageUrls: string[];
  badge: string | null;
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch("/api/services", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));

      const list = (data.services || []).map((x: any) => ({
        ...x,
        imageUrls: Array.isArray(x.imageUrls) ? x.imageUrls : [],
      }));

      setServices(list);
      setLoading(false);
    })();
  }, []);

  return (
    <main style={{ padding: "24px 0" }}>
      <div style={ui.container}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>Услуги</h1>
            <p style={{ color: "#6b7280", marginTop: 8 }}>
              Окна и двери • установка • замер • ремонт • сервис
            </p>
          </div>

          <Link href="/calculator?tab=services" className="btn btn-primary" style={ui.btnPrimary}>
            Оставить заявку
          </Link>
        </div>

        {loading ? (
          <p style={{ marginTop: 12 }}>Загрузка...</p>
        ) : (
          <div
            style={{
              marginTop: 16,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 16,
            }}
          >
            {services.map((s) => {
              const cover = s.imageUrls?.[0] || null;

              return (
                <Link
                  key={s.id}
                  href={`/services/${s.slug}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div className="serviceCard" style={serviceCard}>
                    <div className="imgWrap" style={imgWrap}>
                      {cover ? (
                        <img className="serviceImg" src={cover} alt={s.title} style={img} />
                      ) : (
                        <div style={{ ...img, display: "grid", placeItems: "center", color: "#6b7280" }}>
                          Нет фото
                        </div>
                      )}

                      {s.badge && <div style={badge}>{s.badge}</div>}

                      <div className="serviceOverlay" style={overlay}>
                        <div style={overlayText}>
                          Подробнее <span style={{ fontSize: 22, marginLeft: 8 }}>→</span>
                        </div>
                      </div>
                    </div>

                    <div className="serviceTitle" style={title}>
                      {s.title}
                    </div>

                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <style>{`
          .serviceOverlay { opacity: 0; }
          .serviceCard:hover .serviceOverlay { opacity: 1; }
          .serviceCard:hover .serviceImg { filter: brightness(0.65); }
          .serviceCard:hover .serviceTitle { color: #b91c1c; }
          .serviceOverlay > div { transform: translateY(6px); transition: transform 180ms ease; }
          .serviceCard:hover .serviceOverlay > div { transform: translateY(0); }
        `}</style>
      </div>
    </main>
  );
}

const serviceCard: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 16,
  background: "white",
};

const imgWrap: React.CSSProperties = {
position: "relative",
  borderRadius: 14,
  overflow: "hidden",
  border: "1px solid #e5e7eb",
  background: "#f9fafb",
  display: "grid",
  placeItems: "center",
};

const img: React.CSSProperties = {
  width: "100%",
  maxWidth: 520,
  height: 220,
  objectFit: "cover",
  display: "block",
  transition: "filter 180ms ease",
};

const overlay: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "grid",
  placeItems: "center",
  background: "rgba(17,24,39,0.35)",
  transition: "opacity 180ms ease",
  pointerEvents: "none",
};

const overlayText: React.CSSProperties = {
  color: "white",
  fontWeight: 900,
  fontSize: 18,
  letterSpacing: 0.2,
  display: "inline-flex",
  alignItems: "center",
  textShadow: "0 6px 18px rgba(0,0,0,0.45)",
};

const title: React.CSSProperties = {
  marginTop: 12,
  fontWeight: 900,
  fontSize: 16,
  lineHeight: 1.25,
};

const badge: React.CSSProperties = {
  position: "absolute",
  top: 12,
  right: 12,
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.6)",
  background: "rgba(17,24,39,0.65)",
  color: "white",
  fontWeight: 900,
  fontSize: 12,
  letterSpacing: 0.4,
  zIndex: 3,
};