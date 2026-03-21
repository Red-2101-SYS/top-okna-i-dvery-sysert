"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ui } from "@/app/styles/ui";

type Product = {
  id: string;
  type: "DOOR" | "WINDOW";
  title: string;
  slug: string;
  description: string | null;
  priceFrom: number | null;
  isActive: boolean;
  imageUrls: string[];
  categoryId: string | null;
};

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();

  const [p, setP] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [initialImageUrls, setInitialImageUrls] = useState<string[]>([]);
  const [doorCats, setDoorCats] = useState<{ id: string; name: string; slug: string }[]>([]);

  async function load() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/products/${id}`, { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data?.error || "Не удалось загрузить товар");
      setLoading(false);
      return;
    }
	const imgs = Array.isArray(data.product?.imageUrls) ? data.product.imageUrls : [];
	setP({ ...data.product, imageUrls: imgs });
	// категории дверей (для селекта)
	fetch("/api/admin/categories?type=DOOR", { cache: "no-store" })
	.then((r) => r.json())
	.then((d) => setDoorCats(d.categories || []))
	.catch(() => setDoorCats([]));
	setInitialImageUrls(imgs);
	
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!p) return;

    setSaving(true);
    setError(null);
    setInfo(null);

    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: p.type,
        title: p.title,
        slug: p.slug,
        description: p.description,
        priceFrom: p.priceFrom,
        isActive: p.isActive,
		imageUrls: p.imageUrls,
		categoryId: p.categoryId,
      }),
    });

    const data = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok) {
      setError(data?.error || "Ошибка сохранения");
      return;
    }

    setInfo("Сохранено ✅");
    // обновим данные с сервера (на случай пересоздания slug)

	// ✅ найти удалённые фото
	const removed = initialImageUrls.filter((u) => !p.imageUrls.includes(u));

	// ✅ удалить файлы физически
	for (const url of removed) {
		await fetch("/api/upload", {
			method: "DELETE",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ url }),
		}).catch(() => null);
	}

	// ✅ обновить “исходный список”
	setInitialImageUrls(p.imageUrls);

	// обновим данные с сервера (на случай пересоздания slug)
    await load();
  }


	async function uploadFiles(files: FileList | null, kind: "doors" | "windows") {
		if (!files || files.length === 0 || !p) return;

		for (const file of Array.from(files)) {
			const fd = new FormData();
			fd.append("file", file);
			fd.append("kind", kind);

			const res = await fetch("/api/upload", { method: "POST", body: fd });
			const data = await res.json().catch(() => ({}));

			if (!data?.ok) {
				alert("Не удалось загрузить файл: " + (data?.error || ""));
				continue;
			}

			setP((prev) => {
				if (!prev) return prev;
				const arr = Array.isArray(prev.imageUrls) ? prev.imageUrls : [];
			return { ...prev, imageUrls: [...arr, data.url] };
			});
		}
	}
	
	function move(from: number, to: number) {
		setP((prev) => {
			if (!prev) return prev;
			const arr = Array.isArray(prev.imageUrls) ? [...prev.imageUrls] : [];
			if (from < 0 || from >= arr.length) return prev;
		
			if (to < 0) to = 0;
			if (to >= arr.length) to = arr.length - 1;

			const [picked] = arr.splice(from, 1);
			arr.splice(to, 0, picked);
			return { ...prev, imageUrls: arr };
		});
	}




  async function remove() {
    if (!confirm("Удалить товар? Это действие нельзя отменить.")) return;

    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/products");
    } else {
      setError("Не удалось удалить товар");
    }
  }

  if (loading) return <div style={{ padding: "24px 0" }}>Загрузка...</div>;

  if (error && !p)
    return (
      <div style={{ padding: "24px 0" }}>
        <p style={{ color: "crimson" }}>{error}</p>
        <Link href="/admin/products">← Назад</Link>
      </div>
    );

  if (!p) return null;

  return (
    <main style={{ padding: "24px 0" }}>
	<div style={ui.containerDA900}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1  style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Редактирование</h1>
          <div style={{ marginTop: 6, color: "#6b7280" }}>
            ID: {p.id} • Slug: <code>{p.slug}</code>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link href="/admin/products" className="btn btn-ghost" style={ui.btnGhost}>← К списку</Link>
          <button onClick={remove} className="btn btn-danger" style={ui.btnDanger}>Удалить</button>
        </div>
      </div>

      <form onSubmit={save} style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <label style={lbl}>
          <span>Тип</span>
          <select
            value={p.type}
            onChange={(e) => setP({ ...p, type: e.target.value as any })}
            style={input}
          >
            <option value="DOOR">Дверь</option>
            <option value="WINDOW">Окно</option>
          </select>
        </label>
		
		{p.type === "DOOR" && (
			<label style={lbl}>
				<span>Категория двери</span>
				<select
				value={p.categoryId ?? ""}
				onChange={(e) => setP({ ...p, categoryId: e.target.value || null })}
				style={input}
				>
				<option value="">— Без категории —</option>
				{doorCats.map((c) => (
					<option key={c.id} value={c.id}>
					{c.name}
					</option>
				))}
				</select>
				<div style={{ color: "#6b7280", fontSize: 13, marginTop: 6 }}>
				Для “Терморазрыв” выбери соответствующую категорию.
				</div>
			</label>
		)}

        <label style={lbl}>
          <span>Название *</span>
          <input
            value={p.title}
            onChange={(e) => setP({ ...p, title: e.target.value })}
            required
            style={input}
          />
        </label>

        <label style={lbl}>
          <span>Slug *</span>
          <input
            value={p.slug}
            onChange={(e) => setP({ ...p, slug: e.target.value })}
            required
            style={input}
          />
        </label>

        <label style={lbl}>
          <span>Цена от</span>
          <input
            value={p.priceFrom ?? ""}
            onChange={(e) =>
              setP({ ...p, priceFrom: e.target.value === "" ? null : Number(e.target.value) })
            }
            style={input}
            placeholder="например 35000"
          />
        </label>

        <label style={lbl}>
          <span>Описание</span>
          <textarea
            value={p.description ?? ""}
            onChange={(e) => setP({ ...p, description: e.target.value })}
            style={{ ...input, minHeight: 120 }}
          />
        </label>
		
		
		<div style={{ marginTop: 16 }}>
			<div style={{ fontWeight: 800, marginBottom: 8 }}>Фотографии товара</div>

			{/* Красивая кнопка выбора файлов */}
			<label className="uploadBox" style={uploadBox}>
				<input
				type="file"
				multiple
				accept="image/*"
				style={{ display: "none" }}
				onChange={(e) => {
					uploadFiles(e.target.files, p.type === "WINDOW" ? "windows" : "doors");
					e.currentTarget.value = "";
				}}
				/>
				<div style={{ display: "grid", gap: 6 }}>
				<div style={{ fontWeight: 800 }}>Выбрать файлы</div>
				<div style={{ color: "#6b7280", fontSize: 13 }}>
					Можно выбрать несколько. Первая картинка будет главной.
				</div>
				</div>
				<div style={uploadHint}>{(p.imageUrls?.length ?? 0)} шт</div>
			</label>

			{(p.imageUrls?.length ?? 0) > 0 && (
				<div className="photosGrid" style={photosGrid}>
				{p.imageUrls.map((url, idx) => (
					<div key={url} style={photoCard}>
					<div style={photoWrap}>
						<img src={url} alt="" style={photoImg} />

						{/* крестик удалить */}
						<button
						type="button"
						className="photoX"
						title="Удалить"
						onClick={() => {
							setP((prev) => {
							if (!prev) return prev;
							return { ...prev, imageUrls: prev.imageUrls.filter((_, i) => i !== idx) };
							});
						}}
						style={photoX}
						>
						×
						</button>
			
						{idx === 0 && <div style={badgeMain}>Главная</div>}
					</div>
			
					{/* 2 ряда: стрелки + сделать главной */}
					<div style={{ marginTop: 10, display: "grid", gap: 8 }}>
						<div style={photoArrows}>
						<button type="button" className="btn btn-ghost" style={miniBtnFull} disabled={idx === 0} onClick={() => move(idx, 0)}>«</button>
						<button type="button" className="btn btn-ghost" style={miniBtnFull} disabled={idx === 0} onClick={() => move(idx, idx - 1)}>‹</button>
						<div style={{ display: "grid", placeItems: "center", fontWeight: 800, color: "#6b7280" }}>
							{idx + 1}/{p.imageUrls.length}
						</div>
						<button type="button" className="btn btn-ghost" style={miniBtnFull} disabled={idx === p.imageUrls.length - 1} onClick={() => move(idx, idx + 1)}>›</button>
						<button type="button" className="btn btn-ghost" style={miniBtnFull} disabled={idx === p.imageUrls.length - 1} onClick={() => move(idx, p.imageUrls.length - 1)}>»</button>
						</div>
			
						<button
						type="button"
						className="btn btn-primary"
						style={{ ...mainBtn, opacity: idx === 0 ? 0.75 : 1 }}
						onClick={() => (idx === 0 ? null : move(idx, 0))}
						>
						{idx === 0 ? "Главная" : "Сделать главной"}
						</button>
					</div>
					</div>
				))}
				</div>
				

				
			)}
		</div>

		

        <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={p.isActive}
            onChange={(e) => setP({ ...p, isActive: e.target.checked })}
          />
          Активен
        </label>

        {error && <div style={err}>{error}</div>}
        {info && <div style={ok}>{info}</div>}

        <button disabled={saving} className="btn btn-primary" style={btnPrimary} type="submit">
          {saving ? "Сохраняем..." : "Сохранить"}
        </button>
      </form>  
    </div>
	</main>
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

const photoCard: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 10,
  background: "white",
};

const photoWrap: React.CSSProperties = {
  position: "relative",
};

const photoImg: React.CSSProperties = {
  width: "100%",
  height: 220,
  objectFit: "contain",
  borderRadius: 12,
  display: "block",
  background: "#f9fafb",
  border: "1px solid #e5e7eb",
  minWidth: 0,
  overflow: "hidden",
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

const photoArrows: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(5, 1fr)",
  gap: 8,
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

const mainBtn: React.CSSProperties = {
  width: "100%",
  height: 36,
  padding: "0 10px",
  borderRadius: 12,
  fontWeight: 900,
};

const photosGrid: React.CSSProperties = {
  marginTop: 12,
  display: "grid",
  gap: 12,
  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
  alignItems: "start",
};
