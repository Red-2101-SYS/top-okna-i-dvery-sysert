import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export const runtime = "nodejs";

function safeExt(name: string) {
  const ext = path.extname(name || "").toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg" || ext === ".png" || ext === ".webp") return ext;
  return ".jpg";
}

function randName() {
  // короткое уникальное имя
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const kind = String(form.get("kind") || "").toLowerCase(); // doors | windows | services

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "file обязателен" }, { status: 400 });
    }
    if (!["doors", "windows", "services"].includes(kind)) {
      return NextResponse.json({ ok: false, error: "kind должен быть doors, windows или services" }, { status: 400 });
    }

    const ext = safeExt(file.name);
    const filename = `${randName()}${ext}`;

    const dir =
		kind === "services"
			? path.join(process.cwd(), "public", "services", "uploads")
			: path.join(process.cwd(), "public", "products", kind);
		
		await fs.mkdir(dir, { recursive: true });

		const bytes = await file.arrayBuffer();
		await fs.writeFile(path.join(dir, filename), Buffer.from(bytes));

		const url =
		kind === "services"
			? `/services/uploads/${filename}`
			: `/products/${kind}/${filename}`;
    return NextResponse.json({ ok: true, url, filename });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Upload error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const url = body?.url;

    if (typeof url !== "string" || !url.startsWith("/")) {
      return NextResponse.json({ ok: false, error: "url обязателен" }, { status: 400 });
    }

    // Разрешаем удалять только из этих папок
    const allowed = ["/products/doors/", "/products/windows/", "/services/uploads/"];
    if (!allowed.some((p) => url.startsWith(p))) {
      return NextResponse.json({ ok: false, error: "Запрещённый путь" }, { status: 403 });
    }

    const publicDir = path.join(process.cwd(), "public");
    const rel = url.replace(/^\/+/, ""); // убираем первый /
    const filePath = path.join(publicDir, rel);

    // Доп. защита от выхода за public
    if (!filePath.startsWith(publicDir)) {
      return NextResponse.json({ ok: false, error: "Неверный путь" }, { status: 400 });
    }

    await fs.unlink(filePath).catch((err: any) => {
      // Если файла уже нет — считаем успехом
      if (err?.code !== "ENOENT") throw err;
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? "Delete error" }, { status: 500 });
  }
}