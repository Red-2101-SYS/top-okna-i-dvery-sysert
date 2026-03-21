import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const forCalc = url.searchParams.get("forCalc") === "1";

  const services = await prisma.service.findMany({
    where: forCalc ? {} : { isActive: true },
    orderBy: [{ sort: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ services });
}