import CalcLeadFormClient from "@/app/components/CalcLeadFormClient";
import ProductGallery from "@/app/components/ProductGallery";
import Link from "next/link";
import { ui } from "@/app/styles/ui";
import { notFound } from "next/navigation";

type Product = {
  id: string;
  type: "DOOR" | "WINDOW";
  title: string;
  slug: string;
  description: string | null;
  priceFrom: number | null;
  imageUrls: string[]; 
  category?: { slug: string; name: string } | null;
};

async function getProduct(slug: string): Promise<Product | null> {
	const res = await fetch(`${process.env.APP_URL}/api/products/${slug}`, {
	  cache: "no-store",
  });
	if (res.status === 404) {
		notFound();
	}
	if (!res.ok) {
		throw new Error(`Failed to load product: ${res.status}`);
	}
  const data = await res.json();
  return data.product ?? null;
}

export default async function WindowPage(ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const product = await getProduct(slug);

  if (!product) {
    return (
      <main style={{ padding: "24px 0" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>Не найдено</h1>
        <p style={{ color: "#6b7280" }}>Такого окна нет.</p>
      </main>
    );
  }

  return (
    <main style={{ padding: "24px 0" }}>
		<div style={ui.containerDA900}>
			<Link href="/windows" className="btn btn-ghost" style={backBtn}>
				← Назад
			</Link>
			<h1 style={{ fontSize: 28, fontWeight: 800 }}>{product.title}</h1>
			<p style={{ color: "#6b7280", marginTop: 8 }}>
				{product.priceFrom ? `Цена от ${product.priceFrom} ₽ /м²` : "Цена по запросу"}
			</p>

				<ProductGallery // галерея вместо img c параметрами.
					title={product.title}
					imageUrls={product.imageUrls}
				/>

			<div style={{ marginTop: 16, display: "grid", gap: 16 }}>
				<section style={card}>
				<h2 style={{ marginTop: 0 }}>Описание</h2>
				<p style={{ color: "#374151", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
					{product.description || "Описание скоро появится"}
				</p>
				</section>
				
				<div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap" }}>
					<Link
						href={`/calculator?tab=windows&product=${encodeURIComponent(product.slug)}`}
						className="btn btn-primary"
						style={{ ...ui.btnPrimary, width: "100%", display: "block", textAlign: "center"}}
					>
						Рассчитать окно
					</Link>
				</div>

				<section style={card}>
				<h2 style={{ marginTop: 0 }}>Получить консультацию</h2>
				<p style={{ color: "#6b7280", marginTop: 6 }}>
					Оставьте телефон — мы перезвоним и прокансультируем.
				</p>
				<CalcLeadFormClient
					product={{
						id: product.id,
						slug: product.slug,
						title: product.title,
						priceFrom: product.priceFrom,
						category: product.category ?? null,
					}}
					leadType="CALC_WINDOW"
				/>
				</section>

			</div>
		</div>
    </main>
  );
}

const card: React.CSSProperties = { border: "1px solid #e5e7eb", borderRadius: 16, padding: 16 };
const lbl: React.CSSProperties = { display: "grid", gap: 6 };
const input: React.CSSProperties = { padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" };
const btnPrimary: React.CSSProperties = { padding: 12, borderRadius: 12, border: "1px solid #111827", background: "#111827", color: "white", fontWeight: 700 };
const err: React.CSSProperties = { padding: 10, borderRadius: 10, background: "#fee2e2", border: "1px solid #fecaca" };
const okBox: React.CSSProperties = { padding: 10, borderRadius: 10, background: "#dcfce7", border: "1px solid #bbf7d0" };

const backBtn: React.CSSProperties = {
  display: "inline-block",
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  textDecoration: "none",
  color: "inherit",
  fontWeight: 700,
  marginBottom: 12,
};
