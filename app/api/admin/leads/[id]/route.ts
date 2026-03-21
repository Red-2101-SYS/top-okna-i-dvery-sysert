import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const lead = await prisma.lead.findUnique({
    where: { id },
    select: {
      id: true,
      type: true,
	  status: true,
      name: true,
      phone: true,
	  email: true,
      comment: true,
      payload: true,
      pageUrl: true,
      referrer: true,
      createdAt: true,
    },
  });

  if (!lead) return NextResponse.json({ error: "Не найдено" }, { status: 404 });

  return NextResponse.json({ lead });
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;

    await prisma.lead.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Не удалось удалить заявку" },
      { status: 500 }
    );
  }
}
