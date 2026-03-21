"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ui } from "@/app/styles/ui";

type Product = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  priceFrom: number | null;
  imageUrls: string[];
  category: { slug: string; name: string } | null;
};

type Sort = "NEW" | "PRICE_ASC" | "PRICE_DESC" | "TITLE";

export default function DoorsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [sort, setSort] = useState<Sort>("NEW");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/products?type=DOOR", { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    setItems(Array.isArray(data.products) ? data.products : []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const min = minPrice ? Number(minPrice) : null;

    let arr = items.filter((p) => {
      const okQ =
        !query ||
        p.title.toLowerCase().includes(query) ||
        (p.description?.toLowerCase().includes(query) ?? false);

      const okPrice = min === null ? true : (p.priceFrom ?? 0) >= min;
      return okQ && okPrice;
    });

    arr = [...arr].sort((a, b) => {
      if (sort === "TITLE") return a.title.localeCompare(b.title, "ru");
      if (sort === "PRICE_ASC") return (a.priceFrom ?? 0) - (b.priceFrom ?? 0);
      if (sort === "PRICE_DESC") return (b.priceFrom ?? 0) - (a.priceFrom ?? 0);
      return 0;
    });

    return arr;
  }, [items, q, minPrice, sort]);

  return (
    <main style={{ padding: "24px 0" }}>
      <div style={ui.container}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>Входные двери</h1>
            <p style={{ color: "#6b7280", marginTop: 8 }}>Подбор и расчёт • установка • замер</p>
          </div>

          <Link href="/calculator?tab=doors" className="btn btn-primary" style={ui.btnPrimary}>
            Рассчитать дверь
          </Link>
        </div>

        <section style={{ ...ui.card, marginTop: 16 }}>
          <div
            style={{
              display: "grid",
              gap: 12,
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            }}
          >
            <label style={lbl}>
              <span>Поиск</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Например: Бостон"
                style={input}
              />
            </label>

            <label style={lbl}>
              <span>Цена от</span>
              <input
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="например 30000"
                style={input}
                inputMode="numeric"
              />
            </label>

            <label style={lbl}>
              <span>Сортировка</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} style={input}>
                <option value="NEW">По добавлению</option>
                <option value="PRICE_ASC">Цена: по возрастанию</option>
                <option value="PRICE_DESC">Цена: по убыванию</option>
                <option value="TITLE">По названию</option>
              </select>
            </label>

            <div style={{ display: "grid", gap: 6 }}>
              <span style={{ color: "#6b7280" }}>Результатов</span>
              <div style={{ fontWeight: 800, fontSize: 18 }}>{filtered.length}</div>
            </div>
          </div>
        </section>

        {loading ? (
          <p style={{ marginTop: 12 }}>Загрузка...</p>
        ) : (
          <div
            style={{
              marginTop: 16,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 12,
            }}
          >
            {filtered.map((p) => (
              <div key={p.id} className="hoverCard" style={ui.card}>
                <Link href={`/doors/${p.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div className="mediaFrame" style={{ ...ui.mediaFrame, height: 320 }}>
                    {p.imageUrls?.[0] ? (
					  <img
						className="mediaImg"
						src={p.imageUrls[0]}
						alt={p.title}
						style={{
							width: "100%",
							height: "100%",
							objectFit: "contain",     // ✅ вместо cover
							background: "#fff",       // чтобы поля выглядели аккуратно
							padding: 10,              // чтобы не прилипало к краям
							display: "block",
						}}
					  />
                    ) : (
                      <div
                        style={{
                          height: "100%",
                          display: "grid",
                          placeItems: "center",
                          color: "#6b7280",
                          fontWeight: 800,
                        }}
                      >
                        Нет фото
                      </div>
                    )}

                    {p.category?.slug === "thermal-doors" && <div style={ui.badgeThermal}>ТЕРМОРАЗРЫВ</div>}

                    <div className="mediaOverlay" style={ui.mediaOverlay}>
                      <div className="mediaOverlayText" style={ui.mediaOverlayText}>
                        Подробнее <span style={{ fontSize: 22, marginLeft: 8 }}>→</span>
                      </div>
                    </div>
                  </div>

                  <div className="cardTitle" style={{ fontWeight: 800, marginTop: 12 }}>
                    {p.title}
                  </div>

                  <div style={{ color: "#6b7280", marginTop: 6 }}>
                    {p.description
                      ? p.description.slice(0, 90) + (p.description.length > 90 ? "…" : "")
                      : "Описание скоро появится"}
                  </div>

                  <div style={{ marginTop: 10, fontWeight: 700 }}>
                    {p.priceFrom ? `от ${p.priceFrom} ₽` : "Цена по запросу"}
                  </div>
                </Link>

                <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Link href={`/doors/${p.slug}`} className="btn btn-ghost" style={ui.btnGhost}>
                    Подробнее
                  </Link>
                  <Link
                    href={`/calculator?tab=doors&product=${encodeURIComponent(p.slug)}`}
                    className="btn btn-primary"
                    style={ui.btnPrimary}
                  >
                    Рассчитать
                  </Link>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div style={empty}>Ничего не найдено. Попробуй убрать фильтры или изменить запрос.</div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

const lbl: React.CSSProperties = { display: "grid", gap: 6 };
const input: React.CSSProperties = { padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" };

const empty: React.CSSProperties = {
  border: "1px dashed #e5e7eb",
  borderRadius: 16,
  padding: 16,
  color: "#6b7280",
};