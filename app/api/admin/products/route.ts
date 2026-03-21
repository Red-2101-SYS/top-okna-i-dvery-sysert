import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify, randomSuffix } from "@/lib/slug";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // DOOR | WINDOW | null

  const products = await prisma.product.findMany({
    where: type ? { type: type as any } : undefined,
    orderBy: { createdAt: "desc" },
    include: { category: true, images: true },
  });

  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const type = body?.type; // "DOOR" | "WINDOW"
  const title = body?.title?.trim();
  const description = body?.description?.trim() || null;
  const priceFrom = body?.priceFrom ?? null;
  const categoryId = body?.categoryId || null;
  const { imageUrls = [] } = body;

  if (!type || !title) {
    return NextResponse.json({ error: "Нужны поля: type и title" }, { status: 400 });
  }

  let slug = (body?.slug?.trim() || "").toLowerCase();
  if (!slug) slug = slugify(title);
  if (!slug) slug = `item-${randomSuffix(6)}`;

  // гарантируем уникальность slug
  let finalSlug = slug;
  const exists = await prisma.product.findUnique({ where: { slug: finalSlug } });
  if (exists) finalSlug = `${slug}-${randomSuffix(4)}`;

  const product = await prisma.product.create({
    data: {
      type,
      title,
      slug: finalSlug,
      description,
      priceFrom: typeof priceFrom === "number" ? priceFrom : null,
      isActive: body?.isActive ?? true,
	  imageUrls,
	  categoryId: body?.categoryId || null,
    },
  });

  return NextResponse.json({ ok: true, product });
}
