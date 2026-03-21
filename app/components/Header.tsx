import Link from "next/link";

export default function Header() {
  return (
    <header style={wrap}>
      <div style={inner}>
        		
		<Link
			href="/"
			style={{
				display: "flex",
				alignItems: "center",
				gap: 10,
				textDecoration: "none",
				color: "inherit",
				fontWeight: 1400,
			}}
			>
			<img
				src="/logo.png"
				alt="Топ Окна и Двери Сысерть"
				style={{ width: 64, height: 64, objectFit: "contain" }}
			/>
			<span>Топ Окна и Двери Сысерть</span>
		</Link>


        <nav style={nav}>
          <Link href="/windows" style={navLink}>Окна</Link>
          <Link href="/doors" style={navLink}>Входные двери</Link>
		  <Link href="/calculator" style={navLink}>Калькулятор</Link>
          <Link href="/services" style={navLink}>Услуги</Link>
          <Link href="/contacts" style={navLink}>Контакты</Link>
          <Link href="/admin" style={navLink}>Панель Администратора</Link>
        </nav>
      </div>
    </header>
  );
}

const wrap: React.CSSProperties = {
  borderBottom: "1px solid #e5e7eb",
  position: "sticky",
  top: 0,
  background: "white",
  zIndex: 10,
};

const inner: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: "14px 16px",
  display: "flex",
  alignItems: "center",
  gap: 12,
  justifyContent: "space-between",
  flexWrap: "wrap",
};

const logo: React.CSSProperties = {
  fontWeight: 800,
  textDecoration: "none",
  color: "inherit",
};

const nav: React.CSSProperties = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
  alignItems: "center",
};

const navLink: React.CSSProperties = {
  textDecoration: "none",
  color: "inherit",
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid transparent",
};