import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function randomSuffix(len: number) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function GET() {
  const services = await prisma.service.findMany({
    orderBy: [{ sort: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ services });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const title = body?.title?.trim();
  const description = body?.description?.trim() || null;
  const priceFrom = body?.priceFrom ?? null;
  const badge = body?.badge?.trim() || null;
  const sort = typeof body?.sort === "number" ? body.sort : Number(body?.sort) || 100;
  const imageUrls = Array.isArray(body?.imageUrls) ? body.imageUrls : [];

  if (!title) {
    return NextResponse.json({ error: "Нужно поле: title" }, { status: 400 });
  }

  let slug = (body?.slug?.trim() || "").toLowerCase();
  if (!slug) slug = slugify(title);
  if (!slug) slug = `service-${randomSuffix(6)}`;

  // уникальность slug
  let finalSlug = slug;
  const exists = await prisma.service.findUnique({ where: { slug: finalSlug } });
  if (exists) finalSlug = `${slug}-${randomSuffix(4)}`;

  const service = await prisma.service.create({
    data: {
      title,
      slug: finalSlug,
      description,
      priceFrom: typeof priceFrom === "number" ? priceFrom : Number(priceFrom) || null,
      badge,
      sort,
      isActive: body?.isActive ?? true,
      imageUrls,
    },
  });

  return NextResponse.json({ ok: true, service });
}
