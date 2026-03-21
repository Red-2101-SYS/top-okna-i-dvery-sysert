import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const phone = body?.phone?.trim();
  const type = body?.type;

  if (!phone || !type) {
    return NextResponse.json(
      { error: "Нужны поля: phone и type" },
      { status: 400 }
    );
  }

  const lead = await prisma.lead.create({
    data: {
      type,
      phone,
      name: body?.name?.trim() || null,
      email: body?.email?.trim() || null,
      comment: body?.comment?.trim() || null,
      payload: body?.payload ?? null,
      pageUrl: body?.pageUrl ?? null,
      referrer: body?.referrer ?? null,
      utmSource: body?.utmSource ?? null,
      utmMedium: body?.utmMedium ?? null,
      utmCampaign: body?.utmCampaign ?? null,
      utmTerm: body?.utmTerm ?? null,
      utmContent: body?.utmContent ?? null,
	  status: "NEW",
    },
  });

  return NextResponse.json({ ok: true, id: lead.id });
}

export async function GET() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ leads });
}
