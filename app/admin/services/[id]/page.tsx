"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ui } from "@/app/styles/ui";

type Service = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  priceFrom: number | null;
  imageUrls: string[];
  badge: string | null;
  sort: number;
  isActive: boolean;
  createdAt: string;
};

export default function EditServicePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();

  const [s, setS] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [initialImageUrls, setInitialImageUrls] = useState<string[]>([]);

  async function load() {
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/admin/services/${id}`, { cache: "no-store" });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data?.error || "Не удалось загрузить услугу");
      setLoading(false);
      return;
    }

    const srv = data.service;
    const fixed: Service = {
      ...srv,
      imageUrls: Array.isArray(srv?.imageUrls) ? srv.imageUrls : [],
    };

    setS(fixed);
	setInitialImageUrls(fixed.imageUrls);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", "services");

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));

      if (!data?.ok) {
        alert("Не удалось загрузить файл: " + (data?.error || ""));
        continue;
      }

      setS((prev) => {
        if (!prev) return prev;
        return { ...prev, imageUrls: [...prev.imageUrls, data.url] };
      });
    }
  }

  function move(from: number, to: number) {
    setS((prev) => {
      if (!prev) return prev;
      const copy = [...prev.imageUrls];
      if (from < 0 || from >= copy.length) return prev;

      if (to < 0) to = 0;
      if (to >= copy.length) to = copy.length - 1;

      const [picked] = copy.splice(from, 1);
      copy.splice(to, 0, picked);
      return { ...prev, imageUrls: copy };
    });
  }

  async function removePhoto(idx: number) {
    // 1) убираем из UI сразу (быстро)
    setS((prev) => {
      if (!prev) return prev;
      return { ...prev, imageUrls: prev.imageUrls.filter((_, i) => i !== idx) };
    });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!s) return;

    setSaving(true);
    setError(null);
    setInfo(null);

	// ✅ найти удалённые фото
	const removed = initialImageUrls.filter((u) => !s.imageUrls.includes(u));

    const res = await fetch(`/api/admin/services/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: s.title,
        slug: s.slug,
        description: (s.description ?? "").trim() || null,
        imageUrls: s.imageUrls,
        badge: s.badge ?? null,
        sort: Number(s.sort) || 100,
        priceFrom: s.priceFrom ?? null,
        isActive: s.isActive,
      }),
    });
	
    const data = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok) {
      setError(data?.error || "Ошибка сохранения");
      return;
    }
	
	// ✅ удалить файлы физически
	for (const url of removed) {
		await fetch("/api/upload", {
			method: "DELETE",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ url }),
		}).catch(() => null);
	}
	
	// ✅ обновить “исходный список”
	setInitialImageUrls(s.imageUrls);

    setInfo("Сохранено ✅");
    await load();
 }

  async function removeService() {
    if (!confirm("Удалить услугу? Это действие нельзя отменить.")) return;

    const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/admin/services");
    else alert("Не удалось удалить услугу");
  }

  if (loading) return <main style={{ padding: 24 }}>Загрузка...</main>;

  if (error && !s)
    return (
      <main style={{ padding: 24 }}>
        <p style={{ color: "crimson" }}>{error}</p>
        <Link href="/admin/services">← Назад</Link>
      </main>
    );

  if (!s) return null;

  return (
    <main style={{ padding: "24px 0" }}>
      <div style={{ ...ui.container, maxWidth: 900 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>Редактирование услуги</h1>
            <div style={{ marginTop: 6, color: "#6b7280" }}>
              ID: {s.id} • Slug: <code>{s.slug}</code>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Link href="/admin/services" className="btn btn-ghost" style={ui.btnGhost}>
              ← К списку
            </Link>
            <button onClick={removeService} className="btn btn-danger" style={btnDanger}>
              Удалить
            </button>
          </div>
        </div>

        <form onSubmit={save} style={{ display: "grid", gap: 12, marginTop: 16 }}>
          <label style={lbl}>
            <span>Название *</span>
            <input value={s.title} onChange={(e) => setS({ ...s, title: e.target.value })} required style={input} />
          </label>
		  
		  <label style={lbl}>
			<span>Slug (можно пустым — сгенерируем)</span>
			<input
				value={s.slug ?? ""}
				onChange={(e) => setS({ ...s, slug: e.target.value })}
				style={input}
			/>
		  </label>

          <label style={lbl}>
            <span>Бейдж (ОКНА / ДВЕРИ / ОКНА И ДВЕРИ)</span>
            <input value={s.badge ?? ""} onChange={(e) => setS({ ...s, badge: e.target.value || null })} style={input} />
          </label>

          <label style={lbl}>
            <span>Цена от</span>
            <input
              value={s.priceFrom ?? ""}
              onChange={(e) => setS({ ...s, priceFrom: e.target.value === "" ? null : Number(e.target.value) })}
              style={input}
              inputMode="numeric"
            />
          </label>

          <label style={lbl}>
            <span>Описание</span>
            <textarea
              value={s.description ?? ""}
              onChange={(e) => setS({ ...s, description: e.target.value })}
              style={{ ...input, minHeight: 120 }}
            />
          </label>

          {/* ФОТО — как у товаров */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 900, marginBottom: 8, fontSize: 16 }}>Фотографии услуги</div>

            <label className="uploadBox" style={uploadBox}>
              <input
                type="file"
                multiple
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  uploadFiles(e.target.files);
                  e.currentTarget.value = "";
                }}
              />
              <div style={{ display: "grid", gap: 6 }}>
                <div style={{ fontWeight: 800 }}>Выбрать файлы</div>
                <div style={{ color: "#6b7280", fontSize: 13 }}>
                  Можно выбрать несколько. Первая картинка будет главной.
                </div>
              </div>
              <div style={uploadHint}>{s.imageUrls.length} шт</div>
            </label>

            {s.imageUrls.length > 0 && (
              <div
                style={{
				marginTop: 12,
                  display: "grid",
                  gap: 12,
                  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                  alignItems: "start",
                }}
              >
                {s.imageUrls.map((url, idx) => {
                  const isMain = idx === 0;
                  return (
                    <div
                      key={url}
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 14,
                        padding: 10,
                        background: "white",
                      }}
                    >
                      <div style={{ position: "relative" }}>
                        <img
                          src={url}
                          alt=""
                          style={{
                            width: "100%",
                            height: 220,
                            objectFit: "contain",
                            borderRadius: 12,
                            display: "block",
                            background: "#f9fafb",
                            border: "1px solid #e5e7eb",
                            minWidth: 0,
                            overflow: "hidden",
                          }}
                        />

                        <button
                          type="button"
                          title="Удалить фото"
                          onClick={() => removePhoto(idx)}
                          style={photoX}
                        >
                          ×
                        </button>

                        {isMain && <div style={badgeMain}>Главная</div>}
                      </div>

                      <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                          <button type="button" className="btn btn-ghost" style={miniBtnFull} disabled={idx === 0} onClick={() => move(idx, 0)}>«</button>
                          <button type="button" className="btn btn-ghost" style={miniBtnFull} disabled={idx === 0} onClick={() => move(idx, idx - 1)}>‹</button>
                          <div style={{ display: "grid", placeItems: "center", fontWeight: 800, color: "#6b7280" }}>
                            {idx + 1}/{s.imageUrls.length}
                          </div>
                          <button type="button" className="btn btn-ghost" style={miniBtnFull} disabled={idx === s.imageUrls.length - 1} onClick={() => move(idx, idx + 1)}>›</button>
                          <button type="button" className="btn btn-ghost" style={miniBtnFull} disabled={idx === s.imageUrls.length - 1} onClick={() => move(idx, s.imageUrls.length - 1)}>»</button>
                        </div>

                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => (idx === 0 ? null : move(idx, 0))}
                          style={{ ...mainBtn, opacity: idx === 0 ? 0.75 : 1 }}
                        >
                          {idx === 0 ? "Главная" : "Сделать главной"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ marginTop: 10, color: "#6b7280", fontSize: 13 }}>
              Совет: главной делай картинку, которая лучше всего выглядит на карточке.
            </div>
          </div>

          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            <label style={lbl}>
              <span>Сортировка (sort)</span>
              <input
                value={String(s.sort ?? 100)}
                onChange={(e) => setS({ ...s, sort: Number(e.target.value) || 100 })}
                style={input}
                inputMode="numeric"
              />
            </label>
			<label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 22 }}>
              <input
                type="checkbox"
                checked={s.isActive}
                onChange={(e) => setS({ ...s, isActive: e.target.checked })}
              />
              Активна
            </label>
          </div>

          {error && <div style={err}>{error}</div>}
          {info && <div style={ok}>{info}</div>}

          <button disabled={saving} className="btn btn-primary" style={ui.btnPrimary} type="submit">
            {saving ? "Сохраняем..." : "Сохранить"}
          </button>
        </form>
      </div>
    </main>
  );
}

const lbl: React.CSSProperties = { display: "grid", gap: 6 };
const input: React.CSSProperties = { padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" };

const btnDanger: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #ef4444",
  background: "#ef4444",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};

const err: React.CSSProperties = { padding: 10, borderRadius: 10, background: "#fee2e2", border: "1px solid #fecaca" };
const ok: React.CSSProperties = { padding: 10, borderRadius: 10, background: "#dcfce7", border: "1px solid #bbf7d0" };

const uploadBox: React.CSSProperties = {
  border: "1px dashed #cbd5e1",
  borderRadius: 14,
  padding: 14,
  background: "#f8fafc",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  cursor: "pointer",
  transition: "background 150ms ease, border-color 150ms ease, transform 120ms ease",
};

const uploadHint: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  background: "white",
  borderRadius: 999,
  padding: "6px 10px",
  fontWeight: 900,
  fontSize: 12,
  color: "#111827",
  whiteSpace: "nowrap",
};

const badgeMain: React.CSSProperties = {
  position: "absolute",
  left: 8,
  top: 8,
  padding: "6px 10px",
  borderRadius: 999,
  background: "rgba(0,0,0,0.65)",
  color: "white",
  fontWeight: 900,
  fontSize: 12,
  border: "1px solid rgba(255,255,255,0.25)",
};

const photoX: React.CSSProperties = {
  position: "absolute",
  top: 8,
  right: 8,
  width: 32,
  height: 32,
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.65)",
  background: "rgba(17,24,39,0.55)",
  color: "white",
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
  lineHeight: 1,
  fontSize: 18,
  fontWeight: 900,
};

const mainBtn: React.CSSProperties = {
  width: "100%",
  height: 36,
  padding: "0 10px",
  borderRadius: 12,
  fontWeight: 900,
};

const miniBtnFull: React.CSSProperties = {
  width: "100%",
  height: 36,
  padding: 0,
  borderRadius: 12,
  fontWeight: 900,
  display: "grid",
  placeItems: "center",
};