"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  payload: any;
  pageUrl: string | null;
  referrer: string | null;
  createdAt: string;
};

export default function AdminLeadDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();

  const [lead, setLead] = useState<Lead | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setError(null);
      const res = await fetch(`/api/admin/leads/${id}`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || "Не удалось загрузить заявку");
        return;
      }

      setLead(data.lead);
    })();
  }, [id]);

  async function setStatus(next: "NEW" | "IN_PROGRESS" | "DONE") {
    const res = await fetch(`/api/admin/leads/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data?.error || "Не удалось обновить статус");
      return;
    }

    setLead((prev) => (prev ? { ...prev, status: data.lead.status } : prev));
  }

  async function removeLead() {
    if (!confirm("Удалить заявку? Это действие нельзя отменить.")) return;

    const res = await fetch(`/api/admin/leads/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert(data?.error || "Не удалось удалить заявку");
      return;
    }
    router.push("/admin/leads");
  }

  const prettyType = useMemo(() => leadTypeLabel(lead?.type ?? ""), [lead?.type]);
  const prettyStatus = useMemo(() => leadStatusLabel(lead?.status ?? ""), [lead?.status]);

  if (error) {
    return (
      <main style={{ padding: 24 }}>
        <p style={{ color: "crimson" }}>{error}</p>
        <Link href="/admin/leads">← Назад</Link>
      </main>
    );
  }

  if (!lead) return <main style={{ padding: 24 }}>Загрузка...</main>;

  return (
    <main style={{ padding: "24px 0" }}>
      <div style={ui.containerDA900}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ marginTop: 14, fontSize: 24, fontWeight: 900, marginBottom: 6 }}>Заявка</h1>
            <div style={{ color: "#6b7280" }}>
              ID: <code>{lead.id}</code> • {new Date(lead.createdAt).toLocaleString("ru-RU")}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <Link href="/admin/leads" className="btn btn-ghost" style={ui.btnGhost}>
              ← К списку
            </Link>

            {/* ✅ PDF */}
            <a
              className="btn btn-ghost"
              style={ui.btnGhost}
              href={`/api/admin/leads/${lead.id}/pdf`}
              target="_blank"
              rel="noreferrer"
              title="Скачать PDF"
            >
              PDF
            </a>

            <button onClick={removeLead} className="btn btn-danger" style={ui.btnDanger}>
              Удалить
            </button>
          </div>
        </div>

        <div style={{ marginTop: 14, display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          <Field label="Тип" value={prettyType} />
          <Field label="Статус" value={prettyStatus} />
          <Field label="Имя" value={lead.name ?? "—"} />
          <Field label="Телефон" value={lead.phone} />
          <Field label="Email" value={lead.email ?? "—"} />
          <Field label="Комментарий" value={lead.comment ?? "—"} />
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button style={btn} onClick={() => setStatus("NEW")}>Новая</button>
          <button style={btn} onClick={() => setStatus("IN_PROGRESS")}>В работе</button>
          <button style={btn} onClick={() => setStatus("DONE")}>Завершена</button>
        </div>

        <h2 style={{ marginTop: 18, fontSize: 18, fontWeight: 900 }}>Детали заявки (понятно)</h2>
        <div style={card}>
          <PrettyPayload payload={lead.payload} />
        </div>

        <details style={{ marginTop: 14 }}>
          <summary style={{ cursor: "pointer", fontWeight: 900 }}>Raw payload (для отладки)</summary>
          <pre style={{ ...pre, marginTop: 10 }}>{JSON.stringify(lead.payload, null, 2)}</pre>
        </details>

        <h2 style={{ marginTop: 18, fontSize: 18, fontWeight: 900 }}>Источник</h2>
        <div style={{ color: "#374151", wordBreak: "break-all" }}>
          <div><b>pageUrl:</b> {lead.pageUrl ?? "—"}</div>
          <div><b>referrer:</b> {lead.referrer ?? "—"}</div>
        </div>
      </div>
    </main>
  );
}

/* -------------------- PrettyPayload (обновлённый) -------------------- */

function PrettyPayload({ payload }: { payload: any }) {
  if (!payload || typeof payload !== "object") {
    return <div style={{ color: "#6b7280" }}>Нет данных</div>;
  }

  // ✅ ОКНА (новый калькулятор)
  if (payload.kind === "window_calc_v4") {
    const p = payload;
    return (
      <div style={grid}>
        <Line label="Модель (slug)" value={p.selectedProductSlug || "—"} />
        <Line label="Куда" value={placeLabel(p.place)} />
        <Line label="Створки" value={sashesLabel(p.sashes)} />
        <Line label="Размер" value={`${p.widthMm ?? "—"}×${p.heightMm ?? "—"} мм`} />
        <Line label="Монтаж" value={p.install ? "Да" : "Нет"} />
        <Line label="Доставка" value={p.delivery ? "Да" : "Нет"} />
        <Line label="Площадь" value={p?.priceParts?.areaM2 != null ? `${p.priceParts.areaM2} м²` : "—"} />
        <Line label="Цена за м²" value={p?.priceParts?.pricePerM2 != null ? `${p.priceParts.pricePerM2} ₽/м²` : "—"} />
        <Line label="База" value={p?.priceParts?.baseFromArea != null ? `${p.priceParts.baseFromArea} ₽` : "—"} />
        <Line label="Доплата (створки)" value={p?.priceParts?.sashesAdd != null ? `+${p.priceParts.sashesAdd} ₽` : "—"} />
        <Line label="Итого" value={p.totalFrom == null ? "Цена уточняется" : `${p.totalFrom} ₽`} />
      </div>
    );
  }

  // ✅ ДВЕРИ (новый калькулятор)
  if (payload.kind === "door_calc_v4") {
    const p = payload;
    return (
      <div style={grid}>
        <Line label="Дверь (slug)" value={p.selectedProductSlug || "—"} />
        <Line label="Тип двери" value={doorTypeLabel(p.doorType)} />
        <Line label="Куда" value={placeLabel(p.place)} />
        <Line label="Монтаж" value={p.install ? "Да" : "Нет"} />
        <Line label="Доставка" value={p.delivery ? "Да" : "Нет"} />
        <Line label="Цена двери" value={p?.priceParts?.productPriceFrom != null ? `${p.priceParts.productPriceFrom} ₽` : "—"} />
        <Line label="Итого" value={p.totalFrom == null ? "Цена уточняется" : `${p.totalFrom} ₽`} />
      </div>
    );
  }

  // ✅ Только услуги
  if (payload.kind === "services_only_v3") {
    const items = Array.isArray(payload.items) ? payload.items : [];
    return (
      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ color: "#6b7280", fontWeight: 800 }}>
          Выбрано услуг: <b style={{ color: "#111827" }}>{items.length}</b>
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          {items.map((it: any) => (
            <div key={it.id || it.slug} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 10 }}>
              <div style={{ fontWeight: 900 }}>{it.title}</div>
              <div style={{ color: "#6b7280", marginTop: 4 }}>
                {typeof it.priceFrom === "number" ? `от ${it.priceFrom} ₽` : "Цена уточняется"}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 6 }}>
          <b>Итого от:</b> {payload.totalFrom ?? "—"} ₽
        </div>
      </div>
    );
  }

  // старые версии — оставим
  if (payload.kind === "window_wizard_v1" || payload.kind === "door_wizard_v1") {
    return (
      <div style={{ color: "#6b7280" }}>
        Старый формат калькулятора: <b>{String(payload.kind)}</b>. Открой Raw payload ниже.
      </div>
    );
  }
  
  // ✅ Заявка пришла с карточки товара (без калькулятора)
  if (payload.kind === "product_direct_v1") {
    return (
      <div style={grid}>
        <Line label="Источник" value="Карточка товара (без калькулятора)" />
        <Line label="Товар" value={payload.productTitle ?? "—"} />
        <Line label="Тип" value={payload.productType ?? "—"} />
        <Line
          label="Категория"
          value={payload?.category?.name ?? "—"}
        />
        <Line
          label="Цена (из карточки)"
          value={typeof payload.priceFrom === "number" ? `${payload.priceFrom} ₽` : "—"}
        />
        <Line
          label="Примечание"
          value="Пользователь отправил заявку напрямую со страницы товара, без расчёта в калькуляторе."
        />
      </div>
    );
  }

  return (
    <div style={{ color: "#6b7280" }}>
      Неизвестный формат payload (kind: <b>{String(payload.kind ?? "—")}</b>)
    </div>
  );
}

function placeLabel(x: any) {
  const m: any = { APT: "Квартира", HOUSE: "Частный дом", BALCONY: "Балкон/терраса", SUMMER: "Летний дом" };
  return m[x] || String(x ?? "—");
}
function sashesLabel(x: any) {
  const m: any = { S1: "Одна створка", S2: "Две створки", S3: "Три створки", BALCONY_BLOCK: "Балконный блок" };
  return m[x] || String(x ?? "—");
}
function doorTypeLabel(x: any) {
  const m: any = { ENTRANCE: "Входная", THERMAL: "С терморазрывом", INTERIOR: "Межкомнатная" };
  return m[x] || String(x ?? "—");
}

function leadTypeLabel(t: string) {
  const m: Record<string, string> = {
    CALC_WINDOW: "Калькулятор — Окна",
    CALC_DOOR: "Калькулятор — Двери",
    MEASURE: "Заявка на замер",
    CALLBACK: "Обратный звонок",
    QUESTION: "Вопрос/Услуги",
  };
  return m[t] ?? t;
}
function leadStatusLabel(s: string) {
  const m: Record<string, string> = {
    NEW: "Новая",
    IN_PROGRESS: "В работе",
    DONE: "Завершена",
    SPAM: "Спам",
  };
  return m[s] ?? s;
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "grid", gap: 4 }}>
      <div style={{ color: "#6b7280", fontSize: 12, fontWeight: 900 }}>{label}</div>
      <div style={{ fontWeight: 900 }}>{value}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={card}>
      <div style={{ color: "#6b7280", fontSize: 12, fontWeight: 900 }}>{label}</div>
      <div style={{ fontWeight: 900, marginTop: 6 }}>{value}</div>
    </div>
  );
}

const card: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 12,
  background: "white",
};

const pre: React.CSSProperties = {
  background: "#0b1020",
  color: "white",
  padding: 12,
  borderRadius: 12,
  overflow: "auto",
};

const btn: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  background: "white",
  fontWeight: 900,
  cursor: "pointer",
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 12,
};