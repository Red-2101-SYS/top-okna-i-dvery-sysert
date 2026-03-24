import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";
import { adminCookieName, verifyAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_KINDS = new Set(["doors", "windows", "services"]);
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_DELETE_PREFIXES = ["/products/doors/", "/products/windows/", "/services/uploads/"];

function safeExt(name: string) {
  const ext = path.extname(name || "").toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg" || ext === ".png" || ext === ".webp") return ext;
  return null;
}

function randName(ext: string) {
  return `${Date.now()}-${randomUUID()}${ext}`;
}

function isJpeg(bytes: Uint8Array) {
  return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

function isPng(bytes: Uint8Array) {
  return (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  );
}

function isWebp(bytes: Uint8Array) {
  return (
    bytes.length >= 12 &&
    bytes[0] === 0x52 && // R
    bytes[1] === 0x49 && // I
    bytes[2] === 0x46 && // F
    bytes[3] === 0x46 && // F
    bytes[8] === 0x57 && // W
    bytes[9] === 0x45 && // E
    bytes[10] === 0x42 && // B
    bytes[11] === 0x50 // P
  );
}

function matchesFileSignature(bytes: Uint8Array, ext: string, mime: string) {
  if ((ext === ".jpg" || ext === ".jpeg") && mime === "image/jpeg") {
    return isJpeg(bytes);
  }

  if (ext === ".png" && mime === "image/png") {
    return isPng(bytes);
  }

  if (ext === ".webp" && mime === "image/webp") {
    return isWebp(bytes);
  }

  return false;
}

async function isAdminAuthorized() {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName)?.value;
  const session = await verifyAdminSession(token);
  return !!session;
}

export async function POST(req: Request) {
  try {
    const authorized = await isAdminAuthorized();
    if (!authorized) {
      return NextResponse.json({ ok: false, error: "Не авторизован" }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file");
    const kind = String(form.get("kind") || "").toLowerCase();

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "Файл обязателен" }, { status: 400 });
    }

    if (!ALLOWED_KINDS.has(kind)) {
      return NextResponse.json(
        { ok: false, error: "kind должен быть doors, windows или services" },
        { status: 400 }
      );
    }

    if (file.size <= 0) {
      return NextResponse.json({ ok: false, error: "Пустой файл" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { ok: false, error: "Файл слишком большой. Максимум 5 МБ" },
        { status: 400 }
      );
    }

    const ext = safeExt(file.name);
    if (!ext) {
      return NextResponse.json(
        { ok: false, error: "Разрешены только JPG, PNG и WEBP" },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { ok: false, error: "Недопустимый тип файла" },
        { status: 400 }
      );
    }

    const bytes = new Uint8Array(await file.arrayBuffer());

    if (!matchesFileSignature(bytes, ext, file.type)) {
      return NextResponse.json(
        { ok: false, error: "Содержимое файла не соответствует изображению" },
        { status: 400 }
      );
    }

    const filename = randName(ext);

    const dir =
      kind === "services"
        ? path.join(process.cwd(), "public", "services", "uploads")
        : path.join(process.cwd(), "public", "products", kind);

    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, filename), Buffer.from(bytes));

    const url =
      kind === "services"
        ? `/services/uploads/${filename}`
        : `/products/${kind}/${filename}`;

    return NextResponse.json({ ok: true, url, filename });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ ok: false, error: "Ошибка загрузки файла" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const authorized = await isAdminAuthorized();
    if (!authorized) {
      return NextResponse.json({ ok: false, error: "Не авторизован" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const url = body?.url;

    if (typeof url !== "string" || !url.startsWith("/")) {
      return NextResponse.json({ ok: false, error: "url обязателен" }, { status: 400 });
    }

    if (!ALLOWED_DELETE_PREFIXES.some((prefix) => url.startsWith(prefix))) {
      return NextResponse.json({ ok: false, error: "Запрещённый путь" }, { status: 403 });
    }

    const publicDir = path.resolve(process.cwd(), "public");
    const rel = url.replace(/^\/+/, "");
    const filePath = path.resolve(publicDir, rel);

    if (filePath !== publicDir && !filePath.startsWith(publicDir + path.sep)) {
      return NextResponse.json({ ok: false, error: "Неверный путь" }, { status: 400 });
    }

    await fs.unlink(filePath).catch((err: NodeJS.ErrnoException) => {
      if (err?.code !== "ENOENT") throw err;
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete upload error:", error);
    return NextResponse.json({ ok: false, error: "Ошибка удаления файла" }, { status: 500 });
  }
}