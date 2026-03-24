import path from "path";
import fs from "fs/promises";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify, randomSuffix } from "@/lib/slug";

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true, images: true },
  });

  if (!product) return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);

  const title = body?.title?.trim();
  if (!title) return NextResponse.json({ error: "title обязателен" }, { status: 400 });

  let slug = (body?.slug?.trim() || "").toLowerCase();
  if (!slug) slug = slugify(title);
  if (!slug) slug = `item-${randomSuffix(6)}`;

  // если slug меняется — проверим уникальность
  const current = await prisma.product.findUnique({ where: { id } });
  if (!current) return NextResponse.json({ error: "Не найдено" }, { status: 404 });

  let finalSlug = slug;
  if (finalSlug !== current.slug) {
    const exists = await prisma.product.findUnique({ where: { slug: finalSlug } });
    if (exists) finalSlug = `${slug}-${randomSuffix(4)}`;
  }

  const updated = await prisma.product.update({
    where: { id },
    data: {
      type: body?.type ?? current.type,
      title,
      slug: finalSlug,
      description: body?.description?.trim() || null,
      priceFrom: typeof body?.priceFrom === "number" ? body.priceFrom : null,
      isActive: body?.isActive ?? current.isActive,
	  imageUrls: body.imageUrls,
	  categoryId: body?.categoryId || null,
    },
  });

  return NextResponse.json({ ok: true, product: updated });
}

function getUploadsRoot() {
  const dir = process.env.UPLOADS_DIR;
  if (!dir) {
    throw new Error("UPLOADS_DIR is not set");
  }

  return path.isAbsolute(dir) ? dir : path.resolve(process.cwd(), dir);
}

function toUploadPath(url: string) {
  const uploadsRoot = getUploadsRoot();
  const rel = url.replace(/^\/+/, "");
  const filePath = path.resolve(uploadsRoot, rel);

  if (filePath !== uploadsRoot && !filePath.startsWith(uploadsRoot + path.sep)) {
    return null;
  }

  return filePath;
}


export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  // 1) найдём товар и его картинки
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: "Товар не найден" }, { status: 404 });

  const urls: string[] = Array.isArray((product as any).imageUrls) ? (product as any).imageUrls : [];

  // 2) удаляем товар из БД
  await prisma.product.delete({ where: { id } });

  // 3) удаляем файлы (best-effort)
  const allowedPrefixes = ["/products/doors/", "/products/windows/"];
  for (const url of urls) {
    if (typeof url !== "string") continue;
    if (!allowedPrefixes.some((p) => url.startsWith(p))) continue;

	const filePath = toUploadPath(url);
    if (!filePath) continue;

    await fs.unlink(filePath).catch((err: any) => {
      if (err?.code !== "ENOENT") console.warn("file delete error:", err?.message);
    });
  }

  return NextResponse.json({ ok: true });
}
