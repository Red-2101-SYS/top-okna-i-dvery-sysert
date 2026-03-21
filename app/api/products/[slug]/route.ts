import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;

  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
		id: true,
		type: true,
		title: true,
		slug: true,
		description: true,
		priceFrom: true,
		imageUrls: true,
		category: true,
    },
  });

  if (!product) return NextResponse.json({ error: "Не найдено" }, { status: 404 });

  return NextResponse.json({ product });
}
