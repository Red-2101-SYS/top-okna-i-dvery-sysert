import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // DOOR | WINDOW

  if (!type) {
    return NextResponse.json({ error: "Укажи type=DOOR или type=WINDOW" }, { status: 400 });
  }

  const products = await prisma.product.findMany({
    where: { type: type as any, isActive: true },
    orderBy: { createdAt: "desc" },
    select: {
		id: true,
		type: true,
		title: true,
		slug: true,
		description: true,
		priceFrom: true,
		imageUrls: true,
		category: { select: { id: true, name: true, slug: true, type: true, }, },
    },
  });
  



  return NextResponse.json({ products });
}
