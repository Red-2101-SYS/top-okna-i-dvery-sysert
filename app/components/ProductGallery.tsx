"use client";

import { useMemo, useState } from "react";

export default function ProductGallery({
  title,
  imageUrls,
}: {
  title: string;
  imageUrls: string[] | null | undefined;
}) {
  const images = useMemo(() => {
    return (imageUrls ?? []).filter(Boolean);
  }, [imageUrls]);

  const [i, setI] = useState(0);

  if (images.length === 0) return null;

  const prev = () => setI((x) => (x - 1 + images.length) % images.length);
  const next = () => setI((x) => (x + 1) % images.length);

  return (
    <div style={{ marginTop: 12 }}>
      <div style={frame}>
        <img
          src={images[i]}
          alt={title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            background: "#f9fafb",
          }}
        />

        {images.length > 1 && (
          <div style={controls}>
            <button type="button" onClick={prev} style={btn}>‹</button>
            <div style={{ color: "#6b7280", fontWeight: 800 }}>
              {i + 1}/{images.length}
            </div>
            <button type="button" onClick={next} style={btn}>›</button>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div style={thumbs}>
          {images.map((src, idx) => (
            <button
              key={src + idx}
              type="button"
              onClick={() => setI(idx)}
              style={idx === i ? thumbActive : thumb}
              title={`Фото ${idx + 1}`}
            >
              <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const frame: React.CSSProperties = {
  width: "100%",
  height: 520,
  borderRadius: 16,
  border: "1px solid #e5e7eb",
  overflow: "hidden",
  position: "relative",
};

const controls: React.CSSProperties = {
  position: "absolute",
  left: 12,
  right: 12,
  bottom: 12,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
};

const btn: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "white",
  fontSize: 22,
  fontWeight: 900,
  cursor: "pointer",
};

const thumbs: React.CSSProperties = {
  marginTop: 10,
  display: "flex",
  gap: 10,
  overflowX: "auto",
  paddingBottom: 4,
};

const thumb: React.CSSProperties = {
  width: 84,
  height: 84,
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  overflow: "hidden",
  padding: 0,
  background: "white",
  cursor: "pointer",
};

const thumbActive: React.CSSProperties = {
  ...thumb,
  border: "3px solid #111827",
};
