import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

function safeStr(v: any) {
  if (v === null || v === undefined || v === "") return "—";
  return String(v);
}

function ruDate(dt: Date) {
  try {
    return dt.toLocaleString("ru-RU");
  } catch {
    return String(dt);
  }
}

function leadTypeLabel(t: string) {
  const m: Record<string, string> = {
    CALC_WINDOW: "Калькулятор — Окна",
    CALC_DOOR: "Калькулятор — Двери",
    MEASURE: "Заявка на замер",
    CALLBACK: "Обратный звонок",
    QUESTION: "Вопрос/Услуги",
  };
  return m[t] ?? t;
}

function leadStatusLabel(s: string) {
  const m: Record<string, string> = {
    NEW: "Новая",
    IN_PROGRESS: "В работе",
    DONE: "Завершена",
    SPAM: "Спам",
  };
  return m[s] ?? s;
}

// --- безопасно переводим URL (/products/... /services/...) в путь внутри public ---
function toPublicPath(url: string) {
  if (typeof url !== "string") return null;

  const allowed = ["/products/", "/services/"];
  if (!allowed.some((p) => url.startsWith(p))) return null;

  const publicDir = path.join(process.cwd(), "public");
  const abs = path.join(publicDir, url.replace(/^\/+/, ""));

  if (!abs.startsWith(publicDir)) return null;
  return abs;
}

async function embedImageIfExists(pdfDoc: PDFDocument, url: string) {
  const p = toPublicPath(url);
  if (!p) return null;

  const ext = path.extname(p).toLowerCase();
  const bytes = await fs.readFile(p).catch(() => null);
  if (!bytes) return null;

  // ✅ PNG
  if (ext === ".png") {
    try {
      return await pdfDoc.embedPng(bytes);
    } catch {
      return null;
    }
  }

  // ✅ JPG/JPEG (плюс проверка SOI)
  if (ext === ".jpg" || ext === ".jpeg") {
    // SOI = FF D8
    if (!(bytes[0] === 0xff && bytes[1] === 0xd8)) {
      return null; // файл не JPEG внутри
    }
    try {
      return await pdfDoc.embedJpg(bytes);
    } catch {
      return null;
    }
  }

  // ❌ WEBP/прочее — pdf-lib не поддерживает
  return null;
}

type KV = { label: string; value: string };

function mapPlace(v: any) {
  const m: any = { APT: "Квартира", HOUSE: "Частный дом", BALCONY: "Балкон/терраса" };
  return m[v] ?? safeStr(v);
}
function mapSashes(v: any) {
  const m: any = { S1: "1 створка", S2: "2 створки", S3: "3 створки", BALCONY_BLOCK: "Балконный блок" };
  return m[v] ?? safeStr(v);
}
function mapDoorType(v: any) {
  const m: any = { ENTRANCE: "Входная", THERMAL: "С терморазрывом" };
  return m[v] ?? safeStr(v);
}

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;

    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });

    const payload: any = lead.payload ?? null;

    // ---------------------- подтягиваем товар ----------------------
    let productTitle: string | null = null;
    let productImg: string | null = null;
    let productCategoryName: string | null = null;
    let productCategorySlug: string | null = null;

    // ✅ слуги/данные могут приходить по-разному:
    // - калькулятор: selectedProductSlug
    // - карточка товара: productSlug, productTitle, category
    const selectedProductSlug =
      payload?.selectedProductSlug ||
      payload?.productSlug ||
      payload?.productSlugFromCatalog ||
      payload?.selectedProductSlugFromCatalog ||
      null;

    // если есть slug — берём из БД (самый надёжный вариант)
    if (typeof selectedProductSlug === "string" && selectedProductSlug) {
      const p = await prisma.product.findUnique({
        where: { slug: selectedProductSlug },
        select: {
          title: true,
          imageUrls: true,
          category: { select: { name: true, slug: true } },
        },
      });

      if (p) {
        productTitle = p.title;
        productImg = Array.isArray(p.imageUrls) ? p.imageUrls[0] ?? null : null;
        productCategoryName = p.category?.name ?? null;
        productCategorySlug = p.category?.slug ?? null;
      }
    } else {
      // fallback: если slug нет, но есть title в payload
      productTitle = typeof payload?.productTitle === "string" ? payload.productTitle : null;

      // категория может прийти прямо из payload (ты сейчас добавляешь её)
      if (payload?.category && typeof payload.category === "object") {
        productCategoryName = payload.category?.name ?? null;
        productCategorySlug = payload.category?.slug ?? null;
      }
    }

    // ---------------------- услуги (services_only) ----------------------
    let chosenServices: { title: string; priceFrom: number | null }[] = [];

    if (payload?.kind === "services_only_v3" && Array.isArray(payload?.serviceIds)) {
      const ids = payload.serviceIds.filter((x: any) => typeof x === "string");
      if (ids.length) {
        const rows = await prisma.service.findMany({
          where: { id: { in: ids } },
          select: { id: true, title: true, priceFrom: true },
        });

        // ✅ сохраняем порядок как в payload.serviceIds
        const byId = new Map(rows.map((r) => [r.id, r]));
        chosenServices = ids
          .map((id: string) => byId.get(id))
          .filter(Boolean)
          .map((r: any) => ({ title: r.title, priceFrom: r.priceFrom ?? null }));
      }
    }

    // ---------------------- PDF init ----------------------
    const fontPath = path.join(process.cwd(), "public", "fonts", "DejaVuSans.ttf");
    const fontBoldPath = path.join(process.cwd(), "public", "fonts", "DejaVuSans-Bold.ttf");
    const [fontBytes, fontBoldBytes] = await Promise.all([fs.readFile(fontPath), fs.readFile(fontBoldPath)]);

    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const font = await pdfDoc.embedFont(fontBytes, { subset: true });
    const fontBold = await pdfDoc.embedFont(fontBoldBytes, { subset: true });

    let page = pdfDoc.addPage([595.28, 841.89]); // A4
    const margin = 40;
    const maxX = 595.28 - margin;
    let y = 841.89 - margin;

    const C = {
      text: rgb(17 / 255, 24 / 255, 39 / 255),
      muted: rgb(107 / 255, 114 / 255, 128 / 255),
      border: rgb(229 / 255, 231 / 255, 235 / 255),
      bg: rgb(248 / 255, 250 / 255, 252 / 255),
      white: rgb(1, 1, 1),
    };

    function newPage() {
      page = pdfDoc.addPage([595.28, 841.89]);
      y = 841.89 - margin;
    }

    function ensureSpace(h: number) {
      if (y - h < margin) newPage();
    }

    function drawTextLine(txt: string, opts?: { bold?: boolean; size?: number; color?: any }) {
      const size = opts?.size ?? 11;
      const usedFont = opts?.bold ? fontBold : font;
      const color = opts?.color ?? C.text;

      const words = String(txt).split(/\s+/).filter(Boolean);
      let line = "";
      const lines: string[] = [];
      for (const w of words) {
        const next = line ? `${line} ${w}` : w;
        const width = usedFont.widthOfTextAtSize(next, size);
        if (margin + width > maxX) {
          if (line) lines.push(line);
          line = w;
        } else {
          line = next;
        }
      }
      if (line) lines.push(line);

      for (const l of lines) {
        ensureSpace(size + 8);
        page.drawText(l, { x: margin, y, size, font: usedFont, color });
        y -= size + 6;
      }
    }

    function drawCard(title: string, rows: KV[], opts?: { rightImageUrl?: string | null }) {
      const cardW = maxX - margin;
      const padding = 12;
      const titleSize = 13;
      const labelSize = 10;
      const valueSize = 11;

      const rowH = 18;
      const bodyH = rows.length * rowH;
      const imgH = opts?.rightImageUrl ? 92 : 0;
      const contentH = Math.max(bodyH, imgH);
      const cardH = padding + titleSize + 10 + contentH + padding;

      ensureSpace(cardH + 12);

      page.drawRectangle({
        x: margin,
        y: y - cardH,
        width: cardW,
        height: cardH,
        borderColor: C.border,
        borderWidth: 1,
        color: C.bg,
      });

      page.drawText(title, {
        x: margin + padding,
        y: y - padding - titleSize,
        size: titleSize,
        font: fontBold,
        color: C.text,
      });

      const startY = y - padding - titleSize - 14;

      const leftX = margin + padding;
      const colGap = 18;
      const colW = opts?.rightImageUrl ? cardW * 0.62 : cardW;
      const rightX = leftX + colW + colGap;

      let ry = startY;
      for (const r of rows) {
        page.drawText(r.label, { x: leftX, y: ry, size: labelSize, font: fontBold, color: C.muted });
        page.drawText(r.value, { x: leftX + 150, y: ry, size: valueSize, font, color: C.text });
        ry -= rowH;
      }

      if (opts?.rightImageUrl) {
        const boxW = cardW - padding * 2 - colW - colGap;
        const boxH = 92;
        const boxX = rightX;
        const boxY = startY + 20;

        page.drawRectangle({
          x: boxX,
          y: boxY - boxH,
          width: boxW,
          height: boxH,
          borderColor: C.border,
          borderWidth: 1,
          color: C.white,
        });

        const imgBox = { url: opts.rightImageUrl, boxX, boxW, boxH, boxY };

        y = y - cardH - 12;
        return imgBox;
      }

      y = y - cardH - 12;
      return null;
    }

    async function drawImageInBox(imgBox: any) {
      if (!imgBox?.url) return;

      const embedded = await embedImageIfExists(pdfDoc, imgBox.url);
      if (!embedded) return;

      const iw = embedded.width;
      const ih = embedded.height;

      const scale = Math.min(imgBox.boxW / iw, imgBox.boxH / ih);
      const w = iw * scale;
      const h = ih * scale;

      const x = imgBox.boxX + (imgBox.boxW - w) / 2;
      const yBottom = imgBox.boxY - imgBox.boxH + (imgBox.boxH - h) / 2;

      page.drawImage(embedded, { x, y: yBottom, width: w, height: h });
    }

    // ---------------------- HEADER ----------------------
    drawTextLine("Заявка", { bold: true, size: 20 });
    drawTextLine(`ID: ${lead.id}`, { color: C.muted });
    drawTextLine(`Дата: ${ruDate(lead.createdAt)}`, { color: C.muted });
    y -= 8;

    // ---------------------- Контакты ----------------------
    const contactRows: KV[] = [
      { label: "Тип", value: leadTypeLabel(String(lead.type)) },
      { label: "Статус", value: leadStatusLabel(String(lead.status)) },
      { label: "Имя", value: safeStr(lead.name) },
      { label: "Телефон", value: safeStr(lead.phone) },
      { label: "Email", value: safeStr(lead.email) },
      { label: "Комментарий", value: safeStr(lead.comment) },
    ];
    drawCard("Контакты", contactRows, { rightImageUrl: null });

    // ---------------------- Детали ----------------------
    let detailsRows: KV[] = [];

    // ✅ 1) Окна из калькулятора
    if (payload?.kind === "window_calc_v4") {
      const areaM2 = payload?.priceParts?.areaM2 ?? null;
      detailsRows = [
        { label: "Раздел", value: "Окна" },
        { label: "Модель", value: productTitle ?? safeStr(payload?.selectedProductSlug) },
        { label: "Куда", value: mapPlace(payload?.place) },
        { label: "Створки", value: mapSashes(payload?.sashes) },
        { label: "Размер", value: `${safeStr(payload?.widthMm)} × ${safeStr(payload?.heightMm)} мм` },
        { label: "Площадь", value: areaM2 != null ? `${areaM2} м²` : "—" },
        {
          label: "Цена за м²",
          value: payload?.priceParts?.pricePerM2 != null ? `${payload.priceParts.pricePerM2} ₽/м²` : "—",
        },
        { label: "База", value: payload?.priceParts?.baseFromArea != null ? `${payload.priceParts.baseFromArea} ₽` : "—" },
        {
          label: "Доплата створки",
          value: payload?.priceParts?.sashesAdd != null ? `+${payload.priceParts.sashesAdd} ₽` : "—",
        },
        { label: "Монтаж", value: payload?.install ? "Да" : "Нет" },
        { label: "Доставка", value: payload?.delivery ? "Да" : "Нет" },
        { label: "Итого", value: payload?.totalFrom == null ? "Цена уточняется" : `${payload.totalFrom} ₽` },
      ];
    }

    // ✅ 2) Двери из калькулятора
    else if (payload?.kind === "door_calc_v4") {
      detailsRows = [
        { label: "Раздел", value: "Двери" },
        { label: "Дверь", value: productTitle ?? safeStr(payload?.selectedProductSlug) },
        { label: "Тип", value: mapDoorType(payload?.doorType) },
        { label: "Категория", value: productCategoryName ?? safeStr(payload?.category?.name) },
        { label: "Куда", value: mapPlace(payload?.place) },
        {
          label: "Цена двери",
          value: payload?.priceParts?.productPriceFrom != null ? `${payload.priceParts.productPriceFrom} ₽` : "—",
        },
        { label: "Монтаж", value: payload?.install ? "Да" : "Нет" },
        { label: "Доставка", value: payload?.delivery ? "Да" : "Нет" },
        { label: "Итого", value: payload?.totalFrom == null ? "Цена уточняется" : `${payload.totalFrom} ₽` },
      ];
    }

    // ✅ 3) Только услуги
    else if (payload?.kind === "services_only_v3") {
      const items = chosenServices.length
        ? chosenServices
        : Array.isArray(payload?.items)
          ? payload.items.map((x: any) => ({ title: safeStr(x.title), priceFrom: x?.priceFrom ?? null }))
          : [];

      detailsRows = [
        { label: "Раздел", value: "Услуги" },
        { label: "Выбрано", value: String(items.length) },
        { label: "Итого от", value: `${safeStr(payload?.totalFrom)} ₽` },
      ];

      for (const it of items.slice(0, 8)) {
        detailsRows.push({
          label: "•",
          value: `${it.title} (${it.priceFrom == null ? "цена уточняется" : `от ${it.priceFrom} ₽`})`,
        });
      }
      if (items.length > 8) {
        detailsRows.push({ label: "…", value: `и ещё ${items.length - 8} услуг(и)` });
      }
    }

    // ✅ 4) Заявка пришла с карточки товара (без калькулятора) — НОВЫЙ формат
    else if (payload?.kind === "product_direct_v1") {
      detailsRows = [
        { label: "Раздел", value: "Товар (без калькулятора)" },
        {
          label: "Примечание",
          value: "Заявка без калькулятора.",
        },
        { label: "Товар", value: productTitle ?? safeStr(payload?.productTitle) },
        { label: "Slug", value: safeStr(payload?.productSlug) },
        { label: "Категория", value: productCategoryName ?? safeStr(payload?.category?.name) },
        {
          label: "Цена (из карточки)",
          value: payload?.priceFrom != null ? `${payload.priceFrom} ₽` : "—",
        },
      ];
    }

    // ✅ 4.1) На случай старых заявок (если попадутся) — без kind
    else if (!payload?.kind && (payload?.productTitle || payload?.productSlug || payload?.productId)) {
      detailsRows = [
        { label: "Раздел", value: "Товар (без калькулятора)" },
        {
          label: "Примечание",
          value: "Заявка без калькулятора.",
        },
        { label: "Товар", value: productTitle ?? safeStr(payload?.productTitle) },
        { label: "Slug", value: safeStr(payload?.productSlug) },
        { label: "Категория", value: productCategoryName ?? safeStr(payload?.category?.name) },
        {
          label: "Цена (из карточки)",
          value: payload?.priceFrom != null ? `${payload.priceFrom} ₽` : "—",
        },
      ];
    }

    // fallback
    else {
      detailsRows = [
        { label: "kind", value: safeStr(payload?.kind) },
        { label: "payload", value: "Неизвестный формат. (Payload JSON скрыт)" },
      ];
    }

    const box2 = drawCard("Детали заявки", detailsRows, { rightImageUrl: productImg });
    await drawImageInBox(box2);

    // ---------------------- Источник ----------------------
    drawTextLine("Источник", { bold: true, size: 14 });
    drawTextLine(`pageUrl: ${safeStr(lead.pageUrl)}`, { color: C.muted });

    const bytes = await pdfDoc.save();
    const buf = Buffer.from(bytes);

    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="lead-${lead.id}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "PDF error" }, { status: 500 });
  }
}