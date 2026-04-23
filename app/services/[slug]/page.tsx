"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ui } from "@/app/styles/ui";

type Service = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  imageUrls: string[];
  badge: string | null;
  priceFrom: number | null;
};

export default function ServiceDetailsPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [s, setS] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [activeIdx, setActiveIdx] = useState(0);

  async function load() {
    setLoading(true);
    setErr(null);

    const res = await fetch(`/api/services/${slug}`, { cache: "no-store" });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setErr(data?.error || "Не удалось загрузить услугу");
      setLoading(false);
      return;
    }

    const service = {
      ...data.service,
      imageUrls: Array.isArray(data.service?.imageUrls) ? data.service.imageUrls : [],
    };

    setS(service);
    setActiveIdx(0);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const activeImg = useMemo(() => {
    if (!s) return null;
    return s.imageUrls?.[activeIdx] ?? s.imageUrls?.[0] ?? null;
  }, [s, activeIdx]);

  if (loading) {
    return (
      <main style={{ padding: "24px 0" }}>
        <div style={ui.container}>
          <p>Загрузка...</p>
        </div>
      </main>
    );
  }

  if (err || !s) {
    return (
      <main style={{ padding: "24px 0" }}>
        <div style={ui.container}>
          <p style={{ color: "crimson", fontWeight: 800 }}>{err || "Не найдено"}</p>
          <Link href="/services" className="btn btn-ghost" style={ui.btnGhost}>
            ← К услугам
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: "24px 0" }}>
      <div style={ui.container}>
        <div
          className="service-top-actions"
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <Link href="/services" className="btn btn-ghost" style={ui.btnGhost}>
            ← К услугам
          </Link>
        </div>

        <div style={{ marginTop: 14 }}>
          {s.badge && <div style={badge}>{s.badge}</div>}
          <h1 style={{ margin: "10px 0 0", fontSize: 28, fontWeight: 900 }}>{s.title}</h1>
          <div style={{ marginTop: 8, color: "#6b7280" }}>
            {s.priceFrom ? `Цена от ${s.priceFrom} ₽` : "Цена по запросу"}
          </div>
        </div>

        <div
          className="service-layout"
          style={{
            marginTop: 16,
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: 16,
            alignItems: "start",
          }}
        >
          {/* Галерея */}
          <div style={ui.card}>
            {activeImg ? (
              <img
				className="service-main-image"
                src={activeImg}
                alt={s.title}
                style={{
                  width: "100%",
                  height: 420,
                  objectFit: "contain",
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
                  background: "#f9fafb",
                  display: "block",
                }}
              />
            ) : (
              <div
                className="service-main-image service-empty-image"
                style={{
                  width: "100%",
                  height: 420,
                  borderRadius: 12,
                  border: "1px dashed #e5e7eb",
                  background: "#f9fafb",
                  display: "grid",
                  placeItems: "center",
                  color: "#6b7280",
                  fontWeight: 800,
                }}
              >
                Нет фото
              </div>
            )}

            {s.imageUrls.length > 1 && (
              <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                {s.imageUrls.map((u, i) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setActiveIdx(i)}
                    style={{
                      border: i === activeIdx ? "2px solid #ef4444" : "1px solid #e5e7eb",
                      borderRadius: 12,
                      padding: 4,
                      background: "white",
                      cursor: "pointer",
                    }}
                    title={i === 0 ? "Главная" : "Фото"}
                  >
                    <img
                      src={u}
                      alt=""
                      style={{
                        width: 74,
                        height: 74,
                        objectFit: "cover",
                        borderRadius: 10,
                        display: "block",
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Описание */}
          <div style={ui.card}>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>Описание</div>
            <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, color: "#111827" }}>
              {s.description?.trim() ? s.description : "Описание скоро появится."}
            </div>

            <div 
			className="service-bottom-actions"
			style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
			  <Link href={`/calculator?tab=services&service=${s.slug}`} className="btn btn-primary" style={ui.btnPrimary}>
                Оставить заявку
              </Link>
              <Link href="/contacts" className="btn btn-ghost" style={ui.btnGhost}>
                Контакты
              </Link>
            </div>
          </div>
        </div>
      </div>
	  
	  <style jsx>{`
        @media (max-width: 768px) {
          .service-layout {
            grid-template-columns: 1fr !important;
          }

          .service-main-image {
            height: 260px !important;
          }

          .service-top-actions,
          .service-bottom-actions {
            flex-direction: column;
          }

          .service-top-actions :global(a),
          .service-bottom-actions :global(a) {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
	  
    </main>
  );
}

const badge: React.CSSProperties = {
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid rgba(17,24,39,0.15)",
  background: "#fff5f5",
  color: "#b91c1c",
  fontWeight: 900,
  fontSize: 12,
};