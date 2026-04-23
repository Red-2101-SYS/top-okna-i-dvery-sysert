"use client";

import Link from "next/link";
import { useState } from "react";
import { ui } from "@/app/styles/ui";
import YandexMap from "@/app/components/YandexMap";

export default function HomePage() {
  return (
    <main style={{ padding: "24px 0" }}>
      <div style={ui.containerGlav}>
        <Hero />

        <div style={{ height: 18 }} />

        <section style={grid2}>
          <DirectionCard
            title="Окна"
            desc="ПВХ-окна, остекление, подбор под бюджет. Рассчитаем стоимость и сроки."
            href="/windows"
            cta="Перейти к окнам"
          />
          <DirectionCard
            title="Двери"
            desc="Входные, двери с терморазрывом для частных домов."
            href="/doors"
            cta="Перейти к дверям"
          />
        </section>

        <div style={{ height: 18 }} />

        <ServicesBlock />

        <div style={{ height: 18 }} />

        {/* ✅ Отзывы + карта (как на контактах) */}
        <ReviewsAndMap />

        <div style={{ height: 18 }} />

        {/* ✅ Почему мы */}
        <WhyUs />

        <div style={{ height: 18 }} />

        <section style={card}>
          <h2 style={h2}>Вызвать замерщика</h2>
          <p style={muted}>
            Оставьте телефон — согласуем удобное время. Работаем по Сысерти и до 50 км.
          </p>
          <MeasureLeadForm />
        </section>

        <div style={{ height: 24 }} />

        <section style={grid3}>
          <MiniInfo title="Гарантия" text="Официальные документы и гарантийные условия." />
          <MiniInfo title="Монтаж" text="Установка и регулировка — под ключ." />
          <MiniInfo title="Сроки" text="Согласуем сроки и быстро выйдем на замер." />
        </section>
      </div>

      {/* ✅ моб. кнопка звонка */}
      <MobileCallBar />
    </main>
  );
}

/* ---------------- HERO with background photo ---------------- */

function Hero() {
  return (
    <section style={heroBg}>
      <div style={heroOverlay}>
        <div style={heroGrid}>
          <div>
            <h1 style={h1}>Окна и двери под ключ в Сысерти</h1>
            <p style={heroText}>
              “Топ Окна и Двери Сысерть” — подберём варианты, рассчитаем стоимость и организуем установку.
            </p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
              <Link href="/windows" style={btnGhost}>Окна</Link>
              <Link href="/doors" style={btnGhost}>Входные двери</Link>
			  <Link href="/services" style={btnGhost}>Услуги</Link>
              <Link href="/contacts" style={btnGhost}>Контакты</Link>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
              <span style={pillDark}>Сысерть + 50 км</span>
              <span style={pillDark}>Замер • Установка • Ремонт</span>
            </div>
          </div>

          <div style={heroRight}>
            <div style={heroStatDark}>
              <b>Подбор под бюджет</b>
              <div style={mutedOnHero}>Предложим несколько вариантов</div>
            </div>
            <div style={heroStatDark}>
              <b>Быстрый расчёт</b>
              <div style={mutedOnHero}>Ответим и согласуем сроки</div>
            </div>
            <div style={heroStatDark}>
              <b>Монтаж под ключ</b>
              <div style={mutedOnHero}>Установка и регулировка</div>
            </div>
          </div>
        </div>
      </div>

      {/* адаптив */}
      <style>{`
        @media (max-width: 900px){
          .heroGrid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

/* ---------------- Cards / blocks ---------------- */

function DirectionCard({ title, desc, href, cta }: { title: string; desc: string; href: string; cta: string }) {
  return (
    <Link href={href} style={{ ...card, textDecoration: "none", color: "inherit" }}>
      <h2 style={{ marginTop: 0, fontSize: 20 }}>{title}</h2>
      <p style={muted}>{desc}</p>
      <div style={{ marginTop: 10, fontWeight: 700 }}>{cta} →</div>
    </Link>
  );
}

function ServicesBlock() {
  const items = [
    { title: "Замер", text: "Выезд и консультация по Сысерти и до 50 км." },
    { title: "Установка", text: "Монтаж окон и дверей под ключ." },
    { title: "Ремонт", text: "Регулировка, фурнитура, устранение продуваний." },
    { title: "Доставка", text: "Доставка и подъём по договорённости." },
    { title: "Демонтаж", text: "Снимем старые конструкции при необходимости." },
    { title: "Подбор", text: "Подберём варианты по цене и срокам." },
  ];

  return (
    <section style={card}>
      <h2 style={h2}>Услуги</h2>
      <div style={grid3}>
        {items.map((x) => (
          <div key={x.title} style={miniCard}>
            <b>{x.title}</b>
            <div style={{ ...muted, marginTop: 6 }}>{x.text}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12 }}>
        <Link href="/services" className="calcServiceRow" style={ui.btnGhost}>Все услуги</Link>
      </div>
    </section>
  );
}

function ReviewsAndMap() {
  return (
    <section style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <h2 style={{ ...h2, marginBottom: 0 }}>Отзывы и адрес</h2>
          <p style={{ ...muted, marginTop: 8 }}>
            Посмотрите отзывы на Яндекс и найдите офис на карте.
          </p>
        </div>
      </div>

      {/* ✅ Карта на всю ширину */}
      <div style={{ marginTop: 12 }}>
        <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e5e7eb" }}>
          <YandexMap
            center={[56.503149, 60.828882]}
            zoom={16}
            placemarkText="Офис: Топ Окна и Двери Сысерть"
          />
        </div>

        <p style={{ ...muted, marginTop: 10, marginBottom: 0 }}>
          Адрес: г. Сысерть, ул. Трактовая, 13
        </p>

        {/* ✅ Кнопки под картой */}
        <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a
            href="https://yandex.com/maps/org/top_okna/1325604915/"
            target="_blank"
            rel="noreferrer"
            style={ui.btnGhost}
			className="calcServiceRow"
          >
            Посмотреть отзывы в Яндекс.Картах →
          </a>

          <Link href="/contacts" className="calcServiceRow" style={ui.btnGhost}>
            Контакты
          </Link>
        </div>
      </div>
    </section>
  );
}

function WhyUs() {
  const items = [
    { title: "Честный подбор", text: "Покажем варианты под бюджет и задачи, без навязывания." },
    { title: "Реальный монтаж", text: "Монтаж под ключ, регулировка, сервис и ремонт." },
    { title: "Работаем рядом", text: "Сысерть и до 50 км — быстро приезжаем на замер." },
    { title: "Прозрачные шаги", text: "Заявка → замер → расчет → договор → установка." },
  ];

  return (
    <section style={card}>
      <h2 style={h2}>Почему мы</h2>
      <p style={muted}>Коротко о том, как мы работаем и почему удобно заказать у нас.</p>

      <div style={{ ...grid2, marginTop: 12 }}>
        {items.map((x) => (
          <div key={x.title} style={miniCard}>
            <div style={{ fontWeight: 900 }}>{x.title}</div>
            <div style={{ ...muted, marginTop: 6 }}>{x.text}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function MiniInfo({ title, text }: { title: string; text: string }) {
  return (
    <div style={miniCard}>
      <b>{title}</b>
      <div style={{ ...muted, marginTop: 6 }}>{text}</div>
    </div>
  );
}

/* ---------------- Forms ---------------- */

function MeasureLeadForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [agree, setAgree] = useState(false);

  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
	if (!agree) {
		setError("Необходимо дать согласие на обработку персональных данных.");
		return;
	}
    setLoading(true);
    setOk(false);
    setError(null);

    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "MEASURE",
        name,
        phone,
        comment,
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
	setAgree(false);
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 12, marginTop: 12 }}>
      <div style={grid2}>
        <label style={lbl}>
          <span>Имя</span>
          <input value={name} onChange={(e) => setName(e.target.value)} style={input} />
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
		<label style={agreeWrap}>
		<input
			type="checkbox"
			checked={agree}
			onChange={(e) => setAgree(e.target.checked)}
			style={agreeCheckbox}
		/>
		<span>
			Я даю согласие на обработку персональных данных и принимаю{" "}
			<Link href="/privacy" style={policyLink}>
			Политику конфиденциальности
			</Link>
			.
		</span>
		</label>
      <button disabled={loading} type="submit" className="btn btn-primary"  style={ui.btnPrimary}>
        {loading ? "Отправляем..." : "Вызвать замерщика"}
      </button>
    </form>
  );
}

/* ---------------- Mobile call bar (only mobile) ---------------- */

function MobileCallBar() {
  return (
    <div className="mobileCallBar">
      <a href="tel:+79126644447" className="btn btn-primary" style={mobileCallBtn}>
        Позвонить
      </a>

      <style>{`
        .mobileCallBar{
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          padding: 10px 12px;
          background: rgba(255,255,255,0.92);
          border-top: 1px solid #e5e7eb;
          display: none;
          z-index: 50;
          backdrop-filter: blur(8px);
        }
        @media (max-width: 760px){
          .mobileCallBar{ display: block; }
          body{ padding-bottom: 70px; } /* чтобы не перекрывать контент */
        }
      `}</style>
    </div>
  );
}

/* ---------------- styles ---------------- */

const h1: React.CSSProperties = { fontSize: 34, fontWeight: 900, margin: 0, lineHeight: 1.15, color: "white" };
const h2: React.CSSProperties = { fontSize: 22, fontWeight: 900, marginTop: 0 };

const muted: React.CSSProperties = { color: "#6b7280", marginTop: 6, lineHeight: 1.6 };
const mutedOnHero: React.CSSProperties = { color: "rgba(255,255,255,0.75)", marginTop: 6, lineHeight: 1.6 };

const heroBg: React.CSSProperties = {
  borderRadius: 20,
  overflow: "hidden",
  border: "1px solid #e5e7eb",
  backgroundImage: "url(/home/hero.jpg)", // <-- новая картинка
  backgroundSize: "cover",
  backgroundPosition: "center",
};

const heroOverlay: React.CSSProperties = {
  padding: 18,
  background: "linear-gradient(90deg, rgba(2,6,23,0.88) 0%, rgba(2,6,23,0.55) 55%, rgba(2,6,23,0.25) 100%)",
};

const heroGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.3fr 1fr",
  gap: 16,
} as any;

const heroText: React.CSSProperties = { ...mutedOnHero, fontSize: 16 };

const heroRight: React.CSSProperties = {
  display: "grid",
  gap: 10,
  alignContent: "start",
};

const heroStatDark: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 16,
  padding: 14,
  background: "rgba(255,255,255,0.06)",
  color: "white",
};

const card: React.CSSProperties = { border: "1px solid #e5e7eb", borderRadius: 16, padding: 16, background: "white" };

const miniCard: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 14,
  background: "white",
};

const reviewItem: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 12,
  background: "#f9fafb",
};

const grid2: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 12,
};

const grid3: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
};

const btnGhost: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.22)",
  background: "rgba(255,255,255,0.06)",
  fontWeight: 800,
  textDecoration: "none",
  color: "white",
  textAlign: "center",
};

const pillDark: React.CSSProperties = {
  display: "inline-block",
  padding: "8px 10px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.16)",
  background: "rgba(255,255,255,0.06)",
  fontSize: 12,
  fontWeight: 800,
  color: "white",
};

const lbl: React.CSSProperties = { display: "grid", gap: 6 };
const input: React.CSSProperties = { padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" };
const err: React.CSSProperties = { padding: 10, borderRadius: 10, background: "#fee2e2", border: "1px solid #fecaca" };
const okBox: React.CSSProperties = { padding: 10, borderRadius: 10, background: "#dcfce7", border: "1px solid #bbf7d0" };

const mobileCallBtn: React.CSSProperties = {
  width: "100%",
  padding: "14px 14px",
  borderRadius: 14,
  border: "1px solid #ef4444",
  background: "#ef4444",
  color: "white",
  fontWeight: 900,
  textDecoration: "none",
  display: "block",
  textAlign: "center",
};

const agreeWrap: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
  fontSize: 14,
  lineHeight: 1.5,
  color: "#374151",
};

const agreeCheckbox: React.CSSProperties = {
  marginTop: 3,
  flexShrink: 0,
};

const policyLink: React.CSSProperties = {
  color: "#b91c1c",
  textDecoration: "underline",
};