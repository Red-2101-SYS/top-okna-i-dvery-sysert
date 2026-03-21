"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ui } from "@/app/styles/ui";

export default function NewServicePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [badge, setBadge] = useState("");
  const [sort, setSort] = useState<string>("100");
  const [priceFrom, setPriceFrom] = useState<string>("");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        slug: slug.trim() || null, // сервер сгенерирует из title
		description: description.trim() || null,
		imageUrls,
        badge: badge.trim() || null,
        sort: sort ? Number(sort) : 100,
        priceFrom: priceFrom ? Number(priceFrom) : null,
        isActive,
      }),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data?.error || "Ошибка сохранения");
      return;
    }

    router.push("/admin/services");
  }
  
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

			setImageUrls((prev) => [...prev, data.url]);
		}
	}
  

  return (
    <main style={{ padding: "24px 0" }}>
      <div style={{ ...ui.container, maxWidth: 900 }}>
        <Link href="/admin/services" className="btn btn-ghost" style={ui.btnGhost}>
          ← Назад
        </Link>

        <h1 style={{ fontSize: 24, fontWeight: 900, marginTop: 12 }}>Новая услуга</h1>

        <form onSubmit={save} style={{ display: "grid", gap: 12, marginTop: 12 }}>
          <label style={lbl}>
            <span>Название *</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required style={input} />
          </label>

          <label style={lbl}>
            <span>Slug (можно пустым)</span>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} style={input} />
          </label>

          <label style={lbl}>
            <span>Бейдж (ОКНА / ДВЕРИ / ОКНА И ДВЕРИ)</span>
            <input value={badge} onChange={(e) => setBadge(e.target.value)} style={input} />
          </label>
		  
		  <label style={lbl}>
            <span>Цена от </span>
            <input value={priceFrom} onChange={(e) => setPriceFrom(e.target.value)} style={input} inputMode="numeric" />
          </label>

		  <label style={lbl}>
			<span>Описание</span>
			<textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...input, minHeight: 100 }} />
		  </label>

		<div style={{ marginTop: 16 }}>
			<div style={{ fontWeight: 900, marginBottom: 8, fontSize: 16 }}>Фотографии услуги</div>
			
			{/* Красивая кнопка выбора файлов */}
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
				<div style={uploadHint}>{imageUrls.length} шт</div>
			</label>
			
			{/* Превью */}
			{imageUrls.length > 0 && (
				<div
					style={{
					marginTop: 12,
					display: "grid",
					gap: 12,
					gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
					alignItems: "start",
					}}
				>
					{imageUrls.map((url, idx) => {
					const isMain = idx === 0;

					const move = (from: number, to: number) => {
						setImageUrls((prev) => {
						const copy = [...prev];
						const [picked] = copy.splice(from, 1);
						copy.splice(to, 0, picked);
						return copy;
						});
					};

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
						{/* превью + крестик */}
						<div style={{ position: "relative" }}>
							<img
							src={url}
							alt=""
							style={{
								width: "100%",
								height: 220,           // выше, чтобы не резало
								objectFit: "contain",    // или "contain", если хочешь без обрезки, cover с обрезкой
								borderRadius: 12,
								display: "block",
								background: "#f9fafb",
								border: "1px solid #e5e7eb",
								minWidth: 0,
								overflow: "hidden",
							}}
							/>

							{/* delete X */}
							<button
							type="button"
							className="icon-x"
							title="Удалить фото"
							onClick={() => setImageUrls((prev) => prev.filter((_, i) => i !== idx))}
							style={{
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
							}}
							>
							×
							</button>

							{/* бейдж "Главная" */}
							{isMain && (
							<div
								style={{
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
								}}
							>
								Главная
							</div>
							)}
						</div>

						<div
							style={{
								marginTop: 10,
								display: "grid",
								gap: 8,
							}}
							>
							{/* ряд стрелок */}
							<div
								style={{
								display: "grid",
								gridTemplateColumns: "repeat(5, 1fr)",
								gap: 8,
								}}
							>
								<button
								type="button"
								className="btn btn-ghost"
								title="В начало"
								disabled={idx === 0}
								onClick={() => move(idx, 0)}
								style={miniBtnFull}
								>
								«
								</button>

								<button
								type="button"
								className="btn btn-ghost"
								title="Влево"
								disabled={idx === 0}
								onClick={() => move(idx, idx - 1)}
								style={miniBtnFull}
								>
								‹
								</button>

								<div style={{ display: "grid", placeItems: "center", fontWeight: 800, color: "#6b7280" }}>
								{idx + 1}/{imageUrls.length}
								</div>

								<button
								type="button"
								className="btn btn-ghost"
								title="Вправо"
								disabled={idx === imageUrls.length - 1}
								onClick={() => move(idx, idx + 1)}
								style={miniBtnFull}
								>
								›
								</button>

								<button
								type="button"
								className="btn btn-ghost"
								title="В конец"
								disabled={idx === imageUrls.length - 1}
								onClick={() => move(idx, imageUrls.length - 1)}
								style={miniBtnFull}
								>
								»
								</button>
							</div>

							{/* ряд "Главная" */}
							<button
								type="button"
								className="btn btn-primary"
								onClick={() => {
								if (idx === 0) return;
								move(idx, 0);
								}}
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
				Совет: сделай “главной” фото, которое лучше всего выглядит в каталоге (вертикальное, без обрезки).
			</div>
		</div>


			<div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
				<label style={lbl}>
					<span>Сортировка (sort)</span>
					<input value={sort} onChange={(e) => setSort(e.target.value)} style={input} inputMode="numeric" />
				</label>

				<label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 22 }}>
					<input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
					Активна
				</label>
			</div>
			
		  {error && <div style={err}>{error}</div>}

          <button disabled={loading} className="btn btn-primary" style={ui.btnPrimary} type="submit">
            {loading ? "Сохраняем..." : "Сохранить"}
          </button>
        </form>
      </div>
    </main>
  );
}

const lbl: React.CSSProperties = { display: "grid", gap: 6 };
const input: React.CSSProperties = { padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" };
const err: React.CSSProperties = { padding: 10, borderRadius: 10, background: "#fee2e2", border: "1px solid #fecaca" };

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

const btnDangerMini: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid #fecaca",
  background: "#fee2e2",
  color: "#991b1b",
  fontWeight: 900,
  cursor: "pointer",
};


const miniBtn: React.CSSProperties = {
  width: 36,
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

const miniBtnFull: React.CSSProperties = {
  width: "100%",
  height: 36,
  padding: 0,
  borderRadius: 12,
  fontWeight: 900,
  display: "grid",
  placeItems: "center",
};