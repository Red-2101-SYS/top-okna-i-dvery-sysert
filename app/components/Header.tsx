"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/windows", label: "Окна" },
  { href: "/doors", label: "Входные двери" },
  { href: "/calculator", label: "Калькулятор" },
  { href: "/services", label: "Услуги" },
  { href: "/contacts", label: "Контакты" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <header style={wrap}>
      <div style={inner}>
        <div style={topRow}>
          <Link href="/" style={brand} onClick={closeMenu}>
            <img
              src="/logo.png"
              alt="Топ Окна и Двери Сысерть"
              style={logoImg}
            />
            <span style={brandText}>Топ Окна и Двери Сысерть</span>
          </Link>

          <button
            type="button"
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="menuToggle"
            style={menuButton}
          >
            <span style={burgerLine} />
            <span style={burgerLine} />
            <span style={burgerLine} />
          </button>

          <div className="desktopNavWrap">
            <nav style={navDesktop}>
              {links.map((item) => (
                <Link key={item.href} href={item.href} style={navLink}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {open && (
          <div style={mobileMenuWrap}>
            <nav style={navMobile}>
              {links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={mobileNavLink}
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>

      <style jsx>{`
        .menuToggle {
          display: none;
        }

        .desktopNavWrap {
          display: block;
        }

        @media (max-width: 767px) {
          .menuToggle {
            display: inline-flex;
          }

          .desktopNavWrap {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}

const wrap: React.CSSProperties = {
  borderBottom: "1px solid #e5e7eb",
  position: "sticky",
  top: 0,
  background: "#ffffff",
  zIndex: 20,
};

const inner: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: "14px 16px",
};

const topRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap",
};

const brand: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  textDecoration: "none",
  color: "inherit",
  flexShrink: 0,
};

const logoImg: React.CSSProperties = {
  width: 64,
  height: 64,
  objectFit: "contain",
  flexShrink: 0,
};

const brandText: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 500,
  lineHeight: 1.2,
  whiteSpace: "nowrap",
};

const navDesktop: React.CSSProperties = {
  display: "flex",
  gap: 12,
  rowGap: 8,
  flexWrap: "wrap",
  alignItems: "center",
  minWidth: 280,
};

const navLink: React.CSSProperties = {
  textDecoration: "none",
  color: "inherit",
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid transparent",
  whiteSpace: "nowrap",
};

const menuButton: React.CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "#ffffff",
  cursor: "pointer",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  gap: 4,
  flexShrink: 0,
};

const burgerLine: React.CSSProperties = {
  display: "block",
  width: 18,
  height: 2,
  background: "#111827",
  borderRadius: 999,
};

const mobileMenuWrap: React.CSSProperties = {
  paddingTop: 12,
};

const navMobile: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  paddingTop: 12,
  borderTop: "1px solid #e5e7eb",
  width: "100%",
  alignItems: "stretch",
};

const mobileNavLink: React.CSSProperties = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  textDecoration: "none",
  color: "inherit",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "#ffffff",
  fontWeight: 500,
};