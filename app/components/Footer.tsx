export default function Footer() {
  return (
    <footer style={wrap}>
      <div style={inner}>
        <div>
          <div style={{ fontWeight: 800 }}>Топ Окна и Двери Сысерть</div>
          <div style={{ color: "#6b7280", marginTop: 6 }}>
            Сысерть и агломерация (до 50 км)
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <a href="tel:+79126644447" style={link}>+7 (912) 664-44-47</a>
          <div style={{ marginTop: 6 }}>
            <a href="/privacy" style={link}>Политика конфиденциальности</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

const wrap: React.CSSProperties = {
  borderTop: "1px solid #e5e7eb",
  marginTop: 40,
};

const inner: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: "20px 16px",
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap",
};

const link: React.CSSProperties = {
  color: "inherit",
  textDecoration: "none",
};
