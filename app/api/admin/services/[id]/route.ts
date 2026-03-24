import path from "path";
import fs from "fs/promises";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-zа-яё0-9\s-]/gi, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function randomSuffix(length = 6) {
  return Math.random().toString(36).slice(2, 2 + length);
}

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const service = await prisma.service.findUnique({ 
	where: { id },
  });
  if (!service) return NextResponse.json({ error: "Услуга не найдена" }, { status: 404 });
  return NextResponse.json({ service });
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const body = await req.json().catch(() => null);

  const title = body?.title?.trim();
  if (!title) return NextResponse.json({ error: "Нужно поле: title" }, { status: 400 });

  let slug = (body?.slug?.trim() || "").toLowerCase();
  if (!slug) slug = slugify(title);
  if (!slug) slug = `service-${randomSuffix(6)}`;

  // ✅ уникальность slug (кроме текущей услуги)
  let finalSlug = slug;
  const exists = await prisma.service.findUnique({ where: { slug: finalSlug } });
  if (exists && exists.id !== id) finalSlug = `${slug}-${randomSuffix(4)}`;

  const service = await prisma.service.update({
    where: { id },
    data: {
      title,
      slug: finalSlug,
      description: body?.description?.trim() || null,
      badge: body?.badge?.trim() || null,
      sort: typeof body?.sort === "number" ? body.sort : Number(body?.sort) || 100,
      priceFrom: body?.priceFrom === null ? null : Number(body?.priceFrom) || null,
      isActive: body?.isActive ?? true,
      imageUrls: Array.isArray(body?.imageUrls) ? body.imageUrls : [],
    },
  });

  return NextResponse.json({ ok: true, service });
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

  // 1) забираем услугу, чтобы знать какие файлы удалять
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) return NextResponse.json({ error: "Услуга не найдена" }, { status: 404 });

  const urls: string[] = Array.isArray((service as any).imageUrls) ? (service as any).imageUrls : [];

  // 2) удаляем запись из БД
  await prisma.service.delete({ where: { id } });

  // 3) удаляем файлы (best-effort)
  const allowedPrefixes = ["/services/uploads/"];
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

