"use client";

import { useState } from "react";

type Product = {
  id: string;
  title: string;
  slug: string;
  priceFrom: number | null;
  category?: { slug: string; name: string } | null; // ✅ добавили
};

export default function CalcLeadFormClient({
  product,
  leadType,
}: {
  product: Product;
  leadType: "CALC_DOOR" | "CALC_WINDOW";
}) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setOk(false);
    setError(null);

    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: leadType,
        phone,
        name: name || null,
        comment: comment || null,

        // ✅ ключевое: добавляем kind, чтобы админка/PDF понимали формат
        payload: {
          kind: "product_direct_v1", // ✅ новый формат
          source: "product_page",
          productId: product.id,
          productSlug: product.slug,
          productTitle: product.title,
          priceFrom: product.priceFrom,
          category: product.category ?? null, // ✅ чтобы было видно тип двери
        },

        pageUrl: window.location.href,
        referrer: document.referrer,
      }),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data?.error || "Ошибка отправки");
      return;
    }

    setOk(true);
    setPhone("");
    setName("");
    setComment("");
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 12, marginTop: 12 }}>
      <label style={lbl}>
        <span>Телефон *</span>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          style={input}
          placeholder="+7..."
        />
      </label>

      <label style={lbl}>
        <span>Имя</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={input}
          placeholder="Как к вам обращаться"
        />
      </label>

      <label style={lbl}>
        <span>Комментарий</span>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{ ...input, minHeight: 90 }}
        />
      </label>

      {error && <div style={err}>{error}</div>}
      {ok && <div style={okBox}>Заявка отправлена! Мы скоро свяжемся.</div>}

      <button disabled={loading} type="submit" className="btn btn-primary" style={btnPrimary}>
        {loading ? "Отправляем..." : "Отправить заявку"}
      </button>
    </form>
  );
}

const lbl: React.CSSProperties = { display: "grid", gap: 6 };
const input: React.CSSProperties = { padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" };
const btnPrimary: React.CSSProperties = {
  padding: 12,
  borderRadius: 12,
  border: "1px solid #111827",
  background: "#111827",
  color: "white",
  fontWeight: 700,
};
const err: React.CSSProperties = { padding: 10, borderRadius: 10, background: "#fee2e2", border: "1px solid #fecaca" };
const okBox: React.CSSProperties = { padding: 10, borderRadius: 10, background: "#dcfce7", border: "1px solid #bbf7d0" };