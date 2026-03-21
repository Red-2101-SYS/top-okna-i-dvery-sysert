"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ui } from "@/app/styles/ui";

type Tab = "WINDOWS" | "DOORS" | "SERVICES";

type Product = {
  id: string;
  type: "DOOR" | "WINDOW";
  title: string;
  slug: string;
  priceFrom: number | null;
  imageUrls: string[];
  isActive: boolean;

  // ✅ добавили категорию (для фильтра дверей)
  category?: { slug: string; name: string } | null;
};

type Service = {
  id: string;
  title: string;
  slug: string;
  priceFrom: number | null;
  isActive: boolean;
};

export default function CalculatorPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab"); // "doors" | "windows" | "services"
  const productParam = searchParams.get("product"); // slug
  const serviceParam = searchParams.get("service"); // slug услуги

  const initialTab: Tab =
    tabParam === "doors" ? "DOORS" : tabParam === "services" ? "SERVICES" : "WINDOWS";

  const [tab, setTab] = useState<Tab>(initialTab);

  useEffect(() => {
    if (tabParam === "doors") setTab("DOORS");
    if (tabParam === "windows") setTab("WINDOWS");
    if (tabParam === "services") setTab("SERVICES");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabParam]);

  const productSlugFromCatalog = productParam || null;

  return (
    <main style={{ padding: "24px 0" }}>
      <div style={ui.container}>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>Калькулятор</h1>
        <p style={{ color: "#6b7280", marginTop: 8 }}>
          Ориентировочный расчёт. Для точной цены — замер и подбор комплектации.
        </p>

        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={() => setTab("WINDOWS")} className="btn btn-primary" style={tab === "WINDOWS" ? tabActive : tabBtn} type="button">
            Окна
          </button>
          <button onClick={() => setTab("DOORS")} className="btn btn-primary" style={tab === "DOORS" ? tabActive : tabBtn} type="button">
            Двери
          </button>
          <button onClick={() => setTab("SERVICES")} className="btn btn-primary" style={tab === "SERVICES" ? tabActive : tabBtn} type="button">
            Услуги
          </button>
        </div>

        <div style={{ marginTop: 16 }}>
          {tab === "WINDOWS" && <WindowCalc productSlugFromCatalog={productSlugFromCatalog} />}
          {tab === "DOORS" && <DoorCalc productSlugFromCatalog={productSlugFromCatalog} />}
          {tab === "SERVICES" && <ServicesOnlyCalc preselectSlug={serviceParam} />}
        </div>
      </div>
    </main>
  );
}

/* ----------------------------- helpers ----------------------------- */

function normalizeList<T>(arr: any, mapFn: (x: any) => T): T[] {
  if (!Array.isArray(arr)) return [];
  return arr.map(mapFn);
}

function safeNum(v: string, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

// Ищем услугу строго по названию (не по slug)
function findServiceByExactTitle(services: Service[], title: string) {
  const s = services.find((x) => x.title?.trim().toLowerCase() === title.trim().toLowerCase());
  return {
    id: s?.id ?? null,
    slug: s?.slug ?? null,
    title: s?.title ?? title,
    price: s?.priceFrom ?? 0,
  };
}

/* ----------------------------- WINDOWS ----------------------------- */

function WindowCalc({ productSlugFromCatalog }: { productSlugFromCatalog: string | null }) {
  // STEP 1
  const [place, setPlace] = useState<"APT" | "HOUSE" | "BALCONY">("APT");

  // STEP 2
  const [sashes, setSashes] = useState<"S1" | "S2" | "S3" | "BALCONY_BLOCK">("S1");
  const [width, setWidth] = useState("1250");
  const [height, setHeight] = useState("1350");

  // selected product + services
  const [products, setProducts] = useState<Product[]>([]);
  const [calcServices, setCalcServices] = useState<Service[]>([]); // включает скрытые (forCalc=1)
  const [selectedSlug, setSelectedSlug] = useState<string | null>(productSlugFromCatalog);

  // options
  const [install, setInstall] = useState(true);
  const [delivery, setDelivery] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);

      const [pRes, sRes] = await Promise.all([
        fetch("/api/products?type=WINDOW", { cache: "no-store" }).catch(() => null),
        fetch("/api/services?forCalc=1", { cache: "no-store" }).catch(() => null),
      ]);

      const pData = await pRes?.json().catch(() => ({}));
      const sData = await sRes?.json().catch(() => ({}));

      const listP = normalizeList<Product>(pData?.products, (x) => ({
        id: String(x.id),
        type: x.type,
        title: String(x.title),
        slug: String(x.slug),
        priceFrom: typeof x.priceFrom === "number" ? x.priceFrom : null,
        imageUrls: Array.isArray(x.imageUrls) ? x.imageUrls : [],
        isActive: x.isActive !== false,
        category: x.category ?? null,
      }))
        .filter((x) => x.isActive)
        .sort((a, b) => a.title.localeCompare(b.title, "ru"));

      // ⚠️ не фильтруем по isActive — скрытые услуги нужны для калькулятора
      const listS = normalizeList<Service>(sData?.services, (x) => ({
        id: String(x.id),
        title: String(x.title),
        slug: String(x.slug),
        priceFrom: typeof x.priceFrom === "number" ? x.priceFrom : null,
        isActive: x.isActive !== false,
      }));

      setProducts(listP);
      setCalcServices(listS);

      if (productSlugFromCatalog) {
        const exists = listP.find((p) => p.slug === productSlugFromCatalog);
        setSelectedSlug(exists ? productSlugFromCatalog : null);
      } else {
        setSelectedSlug(listP[0]?.slug ?? null);
      }

      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productSlugFromCatalog]);

  const selected = useMemo(
    () => products.find((p) => p.slug === selectedSlug) ?? null,
    [products, selectedSlug]
  );

  // услуги (строго по названиям)
  const installMeta = useMemo(() => findServiceByExactTitle(calcServices, "Монтаж Окон"), [calcServices]);
  const deliveryMeta = useMemo(() => findServiceByExactTitle(calcServices, "Доставка Окон"), [calcServices]);

  // надбавки за створки (тоже из услуг)
  const s2Meta = useMemo(() => findServiceByExactTitle(calcServices, "Доплата: 2 створки"), [calcServices]);
  const s3Meta = useMemo(() => findServiceByExactTitle(calcServices, "Доплата: 3 створки"), [calcServices]);
  const bbMeta = useMemo(() => findServiceByExactTitle(calcServices, "Доплата: Балконный блок"), [calcServices]);

  const calc = useMemo(() => {
    const w = safeNum(width, 0) / 1000;
    const h = safeNum(height, 0) / 1000;
    const area = Math.max(0, w) * Math.max(0, h);

    // цена окна в БД = ₽/м²
    const pricePerM2 = selected?.priceFrom ?? null;
    const baseFromArea = pricePerM2 === null ? null : Math.round(pricePerM2 * area);

    const sashesAdd =
      sashes === "S2" ? s2Meta.price :
      sashes === "S3" ? s3Meta.price :
      sashes === "BALCONY_BLOCK" ? bbMeta.price :
      0;

    const installCost = install ? installMeta.price : 0;
    const deliveryCost = delivery ? deliveryMeta.price : 0;

    const total =
      baseFromArea === null
        ? null
        : Math.max(0, Math.floor((baseFromArea + sashesAdd + installCost + deliveryCost) / 100) * 100);

    return {
      area: Number(area.toFixed(2)),
      pricePerM2,
      baseFromArea,
      sashesAdd,
      installCost,
      deliveryCost,
      total,
    };
  }, [
    width,
    height,
    sashes,
    install,
    delivery,
    installMeta.price,
    deliveryMeta.price,
    s2Meta.price,
    s3Meta.price,
    bbMeta.price,
    selected?.priceFrom,
  ]);

  return (
    <section style={card}>
      <h2 style={h2}>Окна</h2>

      {loading ? (
        <p style={{ marginTop: 10 }}>Загрузка...</p>
      ) : (
        <>
          {/* STEP 1 */}
          <div style={{ marginTop: 10 }}>
            <div style={stepTitle}>
              <span style={stepNum}>01</span>
              <span style={stepText}>Куда установить окно</span>
            </div>
			
            <div  style={choiceRow}>
              <ChoiceButton active={place === "APT"} onClick={() => setPlace("APT")} label="Квартира" />
              <ChoiceButton active={place === "HOUSE"} onClick={() => setPlace("HOUSE")} label="Частный дом" />
              <ChoiceButton active={place === "BALCONY"} onClick={() => setPlace("BALCONY")} label="Балкон, терраса" />
            </div>
          </div>

          {/* STEP 2 */}
          <div style={{ marginTop: 18 }}>
            <div style={stepTitle}>
              <span style={stepNum}>02</span>
              <span style={stepText}>Количество створок</span>
            </div>

            <div style={{ color: "#6b7280", marginTop: 6, lineHeight: 1.6 }}>
              Размер окна{" "}
              <b>
                {width} мм × {height} мм
              </b>
              <br />
              Доплата за створки: <b>+{calc.sashesAdd} ₽</b>
            </div>

            <div style={choiceRow}>
              <ChoiceButton active={sashes === "S1"} onClick={() => setSashes("S1")} label="Одна створка" />
              <ChoiceButton active={sashes === "S2"} onClick={() => setSashes("S2")} label="Две створки" />
              <ChoiceButton active={sashes === "S3"} onClick={() => setSashes("S3")} label="Три створки" />
              <ChoiceButton
                active={sashes === "BALCONY_BLOCK"}
                onClick={() => setSashes("BALCONY_BLOCK")}
                label="Балконный блок"
              />
            </div>

            <div style={{ marginTop: 12, display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
              <label style={lbl}>
                <span>Ширина (мм)</span>
                <input value={width} onChange={(e) => setWidth(e.target.value)} style={input} inputMode="numeric" />
              </label>
              <label style={lbl}>
                <span>Высота (мм)</span>
                <input value={height} onChange={(e) => setHeight(e.target.value)} style={input} inputMode="numeric" />
              </label>
            </div>
          </div>

          {/* STEP 3 */}
          <div style={{ marginTop: 18 }}>
            <div style={stepTitle}>
              <span style={stepNum}>03</span>
              <span style={stepText}>Выберите модель из каталога</span>
            </div>

            <div style={modelRow}>
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  active={p.slug === selectedSlug}
                  title={p.title}
                  priceFrom={p.priceFrom}
                  img={p.imageUrls?.[0] ?? null}
                  priceLabel="₽/м²"
                  onClick={() => setSelectedSlug(p.slug)}
                />
              ))}
            </div>
          </div>

          {/* STEP 4 */}
          <div style={{ marginTop: 18 }}>
            <div style={stepTitle}>
              <span style={stepNum}>04</span>
              <span style={stepText}>Услуги</span>
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 18, flexWrap: "wrap" }}>
              <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input type="checkbox" checked={install} onChange={(e) => setInstall(e.target.checked)} />
                Монтаж <span style={{ color: "#6b7280" }}>(+{installMeta.price} ₽)</span>
              </label>

              <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input type="checkbox" checked={delivery} onChange={(e) => setDelivery(e.target.checked)} />
                Доставка <span style={{ color: "#6b7280" }}>(+{deliveryMeta.price} ₽)</span>
              </label>
            </div>
          </div>

          {/* RESULT + SEND */}
          <div style={totalBar}>
            <div>
              <div style={{ color: "#6b7280", fontSize: 12, fontWeight: 800 }}>ИТОГО</div>

              {calc.total === null ? (
                <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>Цена уточняется менеджером</div>
              ) : (
                <div style={{ fontSize: 34, fontWeight: 900, marginTop: 6 }}>{calc.total} ₽</div>
              )}

              <div style={{ color: "#6b7280", marginTop: 6, lineHeight: 1.6 }}>
                Площадь: <b>{calc.area} м²</b>
                <br />
                Модель: <b>{selected?.title ?? "—"}</b>
                <br />
                Цена модели: <b>{calc.pricePerM2 ?? "—"} ₽/м²</b>
                <br />
                База по площади: <b>{calc.baseFromArea ?? "—"} ₽</b>
                <br />
                Доплата за створки: <b>+{calc.sashesAdd} ₽</b>
              </div>
            </div>

            <div style={{ minWidth: 320 }}>
              <LeadSendBlock
                leadType="CALC_WINDOW"
                payload={{
                  kind: "window_calc_v4",
                  productSlugFromCatalog,
                  selectedProductSlug: selected?.slug ?? null,
                  place,
                  sashes,
                  widthMm: safeNum(width, 0),
                  heightMm: safeNum(height, 0),
                  install,
                  delivery,
                  priceParts: {
                    areaM2: calc.area,
                    pricePerM2: calc.pricePerM2,
                    baseFromArea: calc.baseFromArea,
                    sashesAdd: calc.sashesAdd,
                    installService: installMeta,
                    deliveryService: deliveryMeta,
                    sashesRules: { s2Meta, s3Meta, bbMeta },
                  },
                  totalFrom: calc.total,
                }}
                compact
              />
            </div>
          </div>

          <div style={{ marginTop: 10, color: "#6b7280", lineHeight: 1.6 }}>
            Если у выбранной модели нет цены — менеджер уточнит стоимость после замера и подбора комплектации.
          </div>
        </>
      )}
    </section>
  );
}

/* ----------------------------- DOORS (✅ фильтр + бейдж) ----------------------------- */

function DoorCalc({ productSlugFromCatalog }: { productSlugFromCatalog: string | null }) {
  const [doorType, setDoorType] = useState<"ENTRANCE" | "THERMAL">("ENTRANCE");
  const [place, setPlace] = useState<"APT" | "HOUSE">("APT");

  const [products, setProducts] = useState<Product[]>([]);
  const [calcServices, setCalcServices] = useState<Service[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(productSlugFromCatalog);

  const [install, setInstall] = useState(true);
  const [delivery, setDelivery] = useState(true);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productSlugFromCatalog) return;

    const p = products.find((x) => x.slug === productSlugFromCatalog);
    if (!p) return;

    const cat = p.category?.slug ?? "";
    if (cat === "thermal-doors") setDoorType("THERMAL");
    if (cat === "entrance-doors") setDoorType("ENTRANCE");
  }, [productSlugFromCatalog, products]);

  useEffect(() => {
    (async () => {
      setLoading(true);

      const [pRes, sRes] = await Promise.all([
        fetch("/api/products?type=DOOR", { cache: "no-store" }).catch(() => null),
        fetch("/api/services?forCalc=1", { cache: "no-store" }).catch(() => null),
      ]);

      const pData = await pRes?.json().catch(() => ({}));
      const sData = await sRes?.json().catch(() => ({}));

      const listP = normalizeList<Product>(pData?.products, (x) => ({
        id: String(x.id),
        type: x.type,
        title: String(x.title),
        slug: String(x.slug),
        priceFrom: typeof x.priceFrom === "number" ? x.priceFrom : null,
        imageUrls: Array.isArray(x.imageUrls) ? x.imageUrls : [],
        isActive: x.isActive !== false,
        category: x.category ?? null,
      }))
        .filter((x) => x.isActive)
        .sort((a, b) => a.title.localeCompare(b.title, "ru"));

      const listS = normalizeList<Service>(sData?.services, (x) => ({
        id: String(x.id),
        title: String(x.title),
        slug: String(x.slug),
        priceFrom: typeof x.priceFrom === "number" ? x.priceFrom : null,
        isActive: x.isActive !== false,
      }));

      setProducts(listP);
      setCalcServices(listS);

      if (productSlugFromCatalog) {
        const exists = listP.find((p) => p.slug === productSlugFromCatalog);
        setSelectedSlug(exists ? productSlugFromCatalog : null);
      } else {
        setSelectedSlug(listP[0]?.slug ?? null);
      }

      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productSlugFromCatalog]);

  const filteredDoors = useMemo(() => {
    const needSlug = doorType === "THERMAL" ? "thermal-doors" : "entrance-doors";
    return products.filter((p) => (p.category?.slug ?? null) === needSlug);
  }, [products, doorType]);

  useEffect(() => {
    if (productSlugFromCatalog) {
      const p = products.find((x) => x.slug === productSlugFromCatalog);
      const cat = p?.category?.slug ?? null;

      if (cat === "thermal-doors" && doorType !== "THERMAL") return;
      if (cat === "entrance-doors" && doorType !== "ENTRANCE") return;
    }

    if (!filteredDoors.length) {
      setSelectedSlug(null);
      return;
    }

    if (!selectedSlug) {
      setSelectedSlug(filteredDoors[0].slug);
      return;
    }

    const ok = filteredDoors.some((p) => p.slug === selectedSlug);
    if (!ok) setSelectedSlug(filteredDoors[0].slug);
  }, [filteredDoors, selectedSlug, productSlugFromCatalog, products, doorType]);

  const selected = useMemo(
    () => filteredDoors.find((p) => p.slug === selectedSlug) ?? null,
    [filteredDoors, selectedSlug]
  );

  const installMeta = useMemo(() => findServiceByExactTitle(calcServices, "Монтаж Дверей"), [calcServices]);
  const deliveryMeta = useMemo(() => findServiceByExactTitle(calcServices, "Доставка Дверей"), [calcServices]);

  const calc = useMemo(() => {
    const base = selected?.priceFrom ?? null;
    const installCost = install ? installMeta.price : 0;
    const deliveryCost = delivery ? deliveryMeta.price : 0;

    const total =
      base === null ? null : Math.max(0, Math.floor((base + installCost + deliveryCost) / 100) * 100);

    return { base, installCost, deliveryCost, total };
  }, [selected?.priceFrom, install, delivery, installMeta.price, deliveryMeta.price]);

  return (
    <section style={card}>
      <h2 style={h2}>Двери</h2>

      {loading ? (
        <p style={{ marginTop: 10 }}>Загрузка...</p>
      ) : (
        <>
          <div style={{ marginTop: 10 }}>
            <div style={stepTitle}>
              <span style={stepNum}>01</span>
              <span style={stepText}>Тип двери</span>
            </div>

            <div style={choiceRow}>
              <ChoiceButton active={doorType === "ENTRANCE"} onClick={() => setDoorType("ENTRANCE")} label="Входная" />
              <ChoiceButton active={doorType === "THERMAL"} onClick={() => setDoorType("THERMAL")} label="С терморазрывом" />
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <div style={stepTitle}>
              <span style={stepNum}>02</span>
              <span style={stepText}>Куда устанавливаем</span>
            </div>

            <div style={choiceRow}>
              <ChoiceButton active={place === "APT"} onClick={() => setPlace("APT")} label="Квартира" />
              <ChoiceButton active={place === "HOUSE"} onClick={() => setPlace("HOUSE")} label="Частный дом" />
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <div style={stepTitle}>
              <span style={stepNum}>03</span>
              <span style={stepText}>Выберите дверь из каталога</span>
            </div>

            {filteredDoors.length === 0 ? (
              <div style={{ marginTop: 10, color: "#6b7280" }}>
                Нет дверей в категории: <b>{doorType === "THERMAL" ? "thermal-doors" : "entrance-doors"}</b>
              </div>
            ) : (
              <div style={modelRow}>
                {filteredDoors.map((p) => (
                  <ProductCard
                    key={p.id}
                    active={p.slug === selectedSlug}
                    title={p.title}
                    priceFrom={p.priceFrom}
                    img={p.imageUrls?.[0] ?? null}
                    onClick={() => setSelectedSlug(p.slug)}
                    badgeText={p.category?.slug === "thermal-doors" ? "ТЕРМОРАЗРЫВ" : null}
                  />
                ))}
              </div>
            )}
          </div>

          <div style={{ marginTop: 18 }}>
            <div style={stepTitle}>
              <span style={stepNum}>04</span>
              <span style={stepText}>Услуги</span>
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 18, flexWrap: "wrap" }}>
              <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input type="checkbox" checked={install} onChange={(e) => setInstall(e.target.checked)} />
                Монтаж <span style={{ color: "#6b7280" }}>(+{installMeta.price} ₽)</span>
              </label>

              <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input type="checkbox" checked={delivery} onChange={(e) => setDelivery(e.target.checked)} />
                Доставка <span style={{ color: "#6b7280" }}>(+{deliveryMeta.price} ₽)</span>
              </label>
            </div>
          </div>

          <div style={totalBar}>
            <div>
              <div style={{ color: "#6b7280", fontSize: 12, fontWeight: 800 }}>ИТОГО</div>

              {calc.total === null ? (
                <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>Цена уточняется менеджером</div>
              ) : (
                <div style={{ fontSize: 34, fontWeight: 900, marginTop: 6 }}>{calc.total} ₽</div>
              )}

              <div style={{ color: "#6b7280", marginTop: 6, lineHeight: 1.6 }}>
                Дверь: <b>{selected?.title ?? "—"}</b>
                <br />
                Категория: <b>{selected?.category?.name ?? "—"}</b>
                <br />
                Цена товара: <b>{selected?.priceFrom ?? "—"} ₽</b>
              </div>
            </div>

            <div style={{ minWidth: 320 }}>
              <LeadSendBlock
                leadType="CALC_DOOR"
                payload={{
                  kind: "door_calc_v4",
                  productSlugFromCatalog,
                  selectedProductSlug: selected?.slug ?? null,
                  doorType,
                  place,
                  install,
                  delivery,
                  category: selected?.category ?? null,
                  priceParts: {
                    productPriceFrom: selected?.priceFrom ?? null,
                    installService: installMeta,
                    deliveryService: deliveryMeta,
                  },
                  totalFrom: calc.total,
                }}
                compact
              />
            </div>
          </div>
        </>
      )}
    </section>
  );
}

/* ----------------------------- SERVICES ONLY ----------------------------- */

function ServicesOnlyCalc({ preselectSlug }: { preselectSlug?: string | null }) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);

      const res = await fetch("/api/services", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));

      const list = normalizeList<Service>(data?.services, (x) => ({
        id: String(x.id),
        title: String(x.title),
        slug: String(x.slug),
        priceFrom: typeof x.priceFrom === "number" ? x.priceFrom : null,
        isActive: x.isActive !== false,
      }))
        .filter((x) => x.isActive)
        .sort((a, b) => a.title.localeCompare(b.title, "ru"));

      setServices(list);

      if (preselectSlug) {
        const found = list.find((x) => x.slug === preselectSlug);
        if (found) setSelectedIds((prev) => (prev.length ? prev : [found.id]));
      }

      setLoading(false);
    })();
  }, [preselectSlug]);

  const chosen = useMemo(() => services.filter((s) => selectedIds.includes(s.id)), [services, selectedIds]);

  const totalFrom = useMemo(() => {
    const sum = chosen.reduce((acc, s) => acc + (s.priceFrom ?? 0), 0);
    return Math.max(0, Math.floor(sum / 100) * 100);
  }, [chosen]);

  const leadType = useMemo(() => {
    const isMeasure =
      chosen.some((x) => x.slug.toLowerCase().includes("measure")) ||
      chosen.some((x) => x.title.toLowerCase().includes("замер"));
    return isMeasure ? ("MEASURE" as const) : ("QUESTION" as const);
  }, [chosen]);

  return (
    <section style={card}>
      <h2 style={h2}>Услуги</h2>

      {loading ? (
        <p style={{ marginTop: 10 }}>Загрузка...</p>
      ) : (
        <>
          <div style={{ marginTop: 10, color: "#6b7280" }}>
            Выберите услуги (например: замер). Если у услуги нет цены — менеджер уточнит стоимость.
          </div>

          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            {services.map((s) => {
              const checked = selectedIds.includes(s.id);

              return (
                <label
                  key={s.id}
				  className="calcServiceRow"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: 12,
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    background: "white",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      setSelectedIds((prev) =>
                        e.target.checked ? [...prev, s.id] : prev.filter((id) => id !== s.id)
                      );
                    }}
                  />

                  <div style={{ display: "grid", gap: 2 }}>
                    <div className="calcServiceTitle" style={{ fontWeight: 900 }}>{s.title}</div>

                    <div style={{ color: "#6b7280" }}>
                      {typeof s.priceFrom === "number" ? `от ${s.priceFrom} ₽` : "Цена уточняется"}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          <div style={totalBar}>
            <div>
              <div style={{ color: "#6b7280", fontSize: 12, fontWeight: 800 }}>ИТОГО ОТ</div>
              <div style={{ fontSize: 34, fontWeight: 900, marginTop: 6 }}>{totalFrom} ₽</div>
              <div style={{ color: "#6b7280", marginTop: 6 }}>
                Выбрано услуг: <b>{chosen.length}</b>
              </div>
            </div>

            <div style={{ minWidth: 320 }}>
              <LeadSendBlock
                leadType={leadType}
                payload={{
                  kind: "services_only_v3",
                  serviceIds: chosen.map((x) => x.id),
                  serviceSlugs: chosen.map((x) => x.slug),
                  totalFrom,
                  items: chosen.map((x) => ({ id: x.id, slug: x.slug, title: x.title, priceFrom: x.priceFrom })),
                }}
                compact
              />
            </div>
          </div>
        </>
      )}
    </section>
  );
}

/* ----------------------------- UI blocks ----------------------------- */

function ChoiceButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} type="button" style={active ? choiceActive : choiceBtn}>
      {label}
    </button>
  );
}

/* ✅ ИМЕННО ТУТ ДОБАВЛЕНЫ ЭФФЕКТЫ */
function ProductCard({
  active,
  title,
  priceFrom,
  img,
  onClick,
  priceLabel,
  badgeText,
}: {
  active: boolean;
  title: string;
  priceFrom: number | null;
  img: string | null;
  onClick: () => void;
  priceLabel?: string;
  badgeText?: string | null;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="hoverCard"                 // ✅ для hover
      style={active ? modelActive : modelBtn}
    >
      <div style={{ display: "grid", gap: 10 }}>
        <div className="mediaWrap" style={thumbFrame}>
          {img ? (
            <img
              src={img}
              alt={title}
              style={thumbImg}
            />
          ) : (
            <div
              className="mediaImg"          // ✅ чтобы “Нет фото” тоже затемнялось
              style={{
                height: "100%",
                display: "grid",
                placeItems: "center",
                color: "#6b7280",
                fontWeight: 800,
              }}
            >
              Нет фото
            </div>
          )}

          {badgeText ? <div style={badgeInCard}>{badgeText}</div> : null}
        </div>

        <div className="cardTitle" style={{ fontWeight: 900, textAlign: "left" }}>
          {title}
        </div>

        <div style={{ color: "#6b7280", fontWeight: 800, textAlign: "left" }}>
          {typeof priceFrom === "number"
            ? `от ${priceFrom} ₽${priceLabel ? ` ${priceLabel}` : ""}`
            : "Цена уточняется"}
        </div>
      </div>
    </button>
  );
}

/* ----------------------------- LeadSendBlock ----------------------------- */

function LeadSendBlock({
  leadType,
  payload,
  compact,
}: {
  leadType: "CALC_WINDOW" | "CALC_DOOR" | "MEASURE" | "QUESTION";
  payload: any;
  compact?: boolean;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setOk(false);
    setError(null);

    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: leadType,
        name: name || null,
        phone,
        comment: comment || null,
        payload,
        pageUrl: window.location.href,
        referrer: document.referrer,
      }),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data?.error || "Ошибка отправки");
      return;
    }

    setOk(true);
    setName("");
    setPhone("");
    setComment("");
  }

  return (
    <section style={{ marginTop: compact ? 0 : 16 }}>
      {compact ? (
        <div style={{ fontWeight: 900, marginBottom: 8 }}>Оставить заявку</div>
      ) : (
        <>
          <h3 style={{ margin: 0, fontSize: 18 }}>Оставить заявку</h3>
          <p style={{ color: "#6b7280", marginTop: 6 }}>Оставьте телефон — мы перезвоним и уточним детали.</p>
        </>
      )}

      <form onSubmit={submit} style={{ display: "grid", gap: 12, marginTop: 10 }}>
        <div style={grid2}>
          <label style={lbl}>
            <span>Имя</span>
            <input value={name} onChange={(e) => setName(e.target.value)} style={input} placeholder="Ваше имя" />
          </label>

          <label style={lbl}>
            <span>Телефон *</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} required style={input} placeholder="+7..." />
          </label>
        </div>

        <label style={lbl}>
          <span>Комментарий</span>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} style={{ ...input, minHeight: 90 }} />
        </label>

        {error && <div style={err}>{error}</div>}
        {ok && <div style={okBox}>Заявка отправлена! Мы скоро свяжемся.</div>}

        <button disabled={loading} type="submit" className="btn btn-primary" style={btnPrimary}>
          {loading ? "Отправляем..." : "Отправить"}
        </button>
      </form>
    </section>
  );
}

/* ----------------------------- styles ----------------------------- */

const card: React.CSSProperties = { border: "1px solid #e5e7eb", borderRadius: 16, padding: 16, background: "white" };
const h2: React.CSSProperties = { fontSize: 22, fontWeight: 900, marginTop: 0 };
const grid2: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 };
const lbl: React.CSSProperties = { display: "grid", gap: 6 };
const input: React.CSSProperties = { padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" };

const btnPrimary: React.CSSProperties = {
  padding: 12,
  borderRadius: 12,
  border: "1px solid #111827",
  background: "#111827",
  color: "white",
  fontWeight: 900,
  cursor: "pointer",
};

const err: React.CSSProperties = { padding: 10, borderRadius: 10, background: "#fee2e2", border: "1px solid #fecaca" };
const okBox: React.CSSProperties = { padding: 10, borderRadius: 10, background: "#dcfce7", border: "1px solid #bbf7d0" };

const tabBtn: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "white",
  fontWeight: 900,
  cursor: "pointer",
};

const tabActive: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  background: "#ef4444",
  color: "white",
  fontWeight: 900,
  cursor: "pointer",
};

const stepTitle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 12, fontWeight: 900, fontSize: 20 };
const stepNum: React.CSSProperties = { color: "#ef4444", fontWeight: 900, width: 42 };
const stepText: React.CSSProperties = { fontWeight: 900 };

const choiceRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 12,
  marginTop: 12,
};

const choiceBtn: React.CSSProperties = {
  padding: "14px 12px",
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "white",
  fontWeight: 900,
  cursor: "pointer",
};

const choiceActive: React.CSSProperties = {
  padding: "14px 12px",
  borderRadius: 12,
  border: "1px solid #ef4444",
  background: "#ef4444",
  color: "white",
  fontWeight: 900,
  cursor: "pointer",
};

const modelRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 12,
  marginTop: 12,
};

const modelBtn: React.CSSProperties = {
  textAlign: "left",
  padding: 16,
  borderRadius: 16,
  border: "1px solid #e5e7eb",
  background: "white",
  cursor: "pointer",
};

const modelActive: React.CSSProperties = {
  textAlign: "left",
  padding: 16,
  borderRadius: 16,
  border: "3px solid #ef4444",
  background: "white",
  cursor: "pointer",
};

const totalBar: React.CSSProperties = {
  marginTop: 18,
  borderTop: "1px solid #e5e7eb",
  paddingTop: 16,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: 16,
  alignItems: "start",
};

const thumbFrame: React.CSSProperties = {
  width: "100%",
  height: 320,
  borderRadius: 14,
  border: "1px solid #e5e7eb",
  background: "white",
  overflow: "hidden",
  display: "grid",
  placeItems: "center",
  padding: 10,
  position: "relative",
};

const thumbImg: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
  display: "block",
  transition: "filter 180ms ease", // ✅ плавное затемнение
};

const badgeInCard: React.CSSProperties = {
  position: "absolute",
  top: 10,
  right: 10,
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.6)",
  background: "rgba(17,24,39,0.65)",
  color: "white",
  fontWeight: 900,
  fontSize: 12,
  letterSpacing: 0.4,
};