"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ui } from "@/app/styles/ui";


export default function NewProductPage() {
  const router = useRouter();

  const [type, setType] = useState<"DOOR" | "WINDOW">("DOOR");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [priceFrom, setPriceFrom] = useState<string>("");
  const [description, setDescription] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [categoryId, setCategoryId] = useState<string>("");
  const [categories, setCategories] = useState<{ id: string; name: string; type: "DOOR" | "WINDOW" }[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
  (async () => {
	  const res = await fetch("/api/admin/categories", { cache: "no-store" });
	  const data = await res.json().catch(() => ({}));
	  setCategories(data.categories || []);
  })();
  }, []);

  useEffect(() => {
  setCategoryId(""); // сбрасываем выбранный тип двери при смене DOOR/WINDOW
  }, [type]);

  
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        title,
        slug: slug || null,
        priceFrom: priceFrom ? Number(priceFrom) : null,
        description,
        isActive,
		imageUrls: imageUrls.map((url) => url.split("?")[0]),
		categoryId: type === "DOOR" ? (categoryId || null) : null,
      }),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data?.error || "Ошибка сохранения");
      return;
    }

    router.push("/admin/products");
  }
  
    async function uploadFiles(files: FileList | null, kind: "doors" | "windows") {
		if (!files || files.length === 0) return;

		for (const file of Array.from(files)) {
			const fd = new FormData();
			fd.append("file", file);
			fd.append("kind", kind);
		
			const res = await fetch("/api/upload", { method: "POST", body: fd });
			const data = await res.json();
		
			if (!data?.ok) {
			alert("Не удалось загрузить файл: " + (data?.error || ""));
			continue;
			}
		
			const freshUrl = `${data.url}?v=${Date.now()}`;
			setImageUrls((prev) => [...prev, data.url]); // добавляем в конец
		}
	}

  return (
    <main style={{ padding: "24px 0" }}>
	<div style={ui.containerDA900}>
	  <Link href="/admin/products" className="btn btn-ghost" style={ui.btnGhost}>
	    ← Назад
	  </Link>

      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Новый товар</h1>

      <form onSubmit={save} style={{ display: "grid", gap: 12, marginTop: 12 }}>
        <label style={lbl}>
          <span>Тип</span>
          <select value={type} onChange={(e) => setType(e.target.value as any)} style={input}>
            <option value="DOOR">Дверь</option>
            <option value="WINDOW">Окно</option>
          </select>
        </label>
		
	  {type === "DOOR" && (
		<label style={lbl}>
			<span>Тип двери</span>
			<select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} style={input}>
			<option value="">— выбрать —</option>
			{categories
				.filter((c) => c.type === "DOOR")
				.map((c) => (
				<option key={c.id} value={c.id}>
					{c.name}
				</option>
				))}
			</select>
		</label>
		)}
		

        <label style={lbl}>
          <span>Название *</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required style={input} />
        </label>

        <label style={lbl}>
          <span>Slug (можно пустым — сгенерируем)</span>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} style={input} placeholder="naprimer-vhodnaya-dver" />
        </label>

        <label style={lbl}>
          <span>Цена от</span>
          <input value={priceFrom} onChange={(e) => setPriceFrom(e.target.value)} style={input} placeholder="например 35000" />
        </label>

        <label style={lbl}>
          <span>Описание</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...input, minHeight: 100 }} />
        </label>

		<div style={{ marginTop: 16 }}>
			<div style={{ fontWeight: 900, marginBottom: 8, fontSize: 16 }}>Фотографии товара</div>
			
			{/* Красивая кнопка выбора файлов */}
			<label className="uploadBox" style={uploadBox}>
				<input
				type="file"
				multiple
				accept="image/*"
				style={{ display: "none" }}
				onChange={(e) => {
					uploadFiles(e.target.files, type === "WINDOW" ? "windows" : "doors");
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



        <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Активен
        </label>

        {error && <div style={err}>{error}</div>}

        <button disabled={loading} className="btn btn-primary" style={btnPrimary} type="submit">
          {loading ? "Сохраняем..." : "Сохранить"}
        </button>
      </form>
	  
		<style>{`
			.thumbBtn{
				height: 40px;
				border-radius: 10px;
				border: 1px solid #e5e7eb;
				background: #fff;
				font-weight: 900;
				cursor: pointer;
				transition: background 150ms ease, color 150ms ease, border-color 150ms ease, filter 150ms ease;
				display: inline-flex;
				align-items: center;
				justify-content: center;
				user-select: none;
			}

			.thumbBtn:disabled{
				opacity: 0.5;
				cursor: not-allowed;
			}

			/* стрелки — жирнее */
			.thumbBtnArrow{
				font-size: 22px;
				font-weight: 1000;
				line-height: 1;
			}

			/* стрелки + "главная" — краснеют при наведении */
			.thumbBtnPrimary:hover:not(:disabled),
			.thumbBtnArrow:hover:not(:disabled){
				border-color: #ef4444;
				color: #ef4444;
				background: #fff5f5;
			}

			/* удалить — затемняется при наведении */
			.thumbBtnDanger{
				border-color: #fecaca;
				background: #fee2e2;
				color: #991b1b;
			}
			.thumbBtnDanger:hover{
				filter: brightness(0.9);
			}
			
			/* --- Блок "Выбрать файлы" --- */
			.uploadBox:hover{
				border-color: #ef4444;
				background: #fff5f5;
			}
			.uploadBox:active{
				transform: scale(0.995);
			}
	
		`}</style>
    </div>
	</main>
  );
}

const lbl: React.CSSProperties = { display: "grid", gap: 6 };
const input: React.CSSProperties = { padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" };
const btnPrimary: React.CSSProperties = { padding: 12, borderRadius: 12, border: "1px solid #111827", background: "#111827", color: "white", fontWeight: 700 };
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

const emptyHint: React.CSSProperties = {
  marginTop: 12,
  padding: 12,
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "white",
  color: "#6b7280",
  fontWeight: 700,
};

const thumbGrid: React.CSSProperties = {
  marginTop: 12,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: 12,
};

const thumbCard: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 10,
  background: "white",
};

const thumbImgWrap: React.CSSProperties = {
  position: "relative",
  borderRadius: 12,
  overflow: "hidden",
  border: "1px solid #e5e7eb",
  background: "#f9fafb",
};

const thumbImg: React.CSSProperties = {
  width: "100%",
  height:220,
  objectFit: "contain",
  display: "block",
};

const badgeMain: React.CSSProperties = {
  position: "absolute",
  top: 8,
  left: 8,
  padding: "6px 10px",
  borderRadius: 999,
  background: "rgba(17,24,39,0.85)",
  color: "white",
  fontWeight: 900,
  fontSize: 12,
};

const btnMini: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  background: "white",
  fontWeight: 800,
  cursor: "pointer",
};

const btnMiniDisabled: React.CSSProperties = {
  ...btnMini,
  opacity: 0.5,
  cursor: "not-allowed",
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

const thumbActions: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 44px 44px 92px", // ✅ фикс ширины, выглядит ровно
  gap: 8,
  marginTop: 10,
  alignItems: "center",
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