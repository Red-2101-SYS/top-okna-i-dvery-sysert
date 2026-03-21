export const ui = {
  container: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "0 16px",
  } as const,

  card: {
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 16,
    background: "white",
  } as const,

  imgMain: { // Проверить может использую и если что удалить
    width: "100%",
    height: 320,
    objectFit: "contain",
    background: "#f9fafb",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    marginBottom: 10,
  } as const,

  imgEmpty: { // Проверить может использую и если что удалить
    width: "100%",
    height: 320, // Надо указывать такую же высоту, как imgMain
    borderRadius: 12,
    border: "1px dashed #e5e7eb",
    background: "#f9fafb",
    marginBottom: 10,
    display: "grid",
    placeItems: "center",
    color: "#6b7280",
    fontWeight: 700,
  } as const,

  btnPrimary: {
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #111827",
    background: "#111827",
    color: "white",
    fontWeight: 900,
    textDecoration: "none",
    display: "inline-block",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(17,24,39,0.12)",
  } as const,

  btnGhost: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "white",
    fontWeight: 800,
    textDecoration: "none",
    color: "inherit",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
	boxShadow: "0 10px 24px rgba(17,24,39,0.12)",
  } as const,

  btnSm: {
    padding: "10px 12px",
    borderRadius: 12,
    fontWeight: 900,
  } as const,

  // контейнер для админ панели
  containerAdmin: {
    maxWidth: 1680,
    margin: "0 auto",
    padding: "0 16px",
  } as const,
  
  containerGlav: {
    maxWidth: 1920,
    margin: "0 auto",
    padding: "0 16px",
  } as const,
  
  containerDA900: {
    maxWidth: 900,
    margin: "0 auto",
    padding: "0 16px",
  } as const,

  containerDA700: {
    maxWidth: 700,
    margin: "0 auto",
    padding: "0 16px",
  } as const,

  btnDanger: {
	padding: "10px 12px",
	borderRadius: 12,
	border: "1px solid #ef4444",
	background: "#ef4444",
	color: "white",
	fontWeight: 700,
  } as const,
  
  callBtn: {
  textDecoration: "none",
  color: "white",
  background: "#111827",
  padding: "10px 12px",
  borderRadius: 12,
  fontWeight: 700,
  } as const,
  
  badgeThermal: {
	position: "absolute",
	top: 10,
	left: 10,
	padding: "6px 10px",
	borderRadius: 999,
	border: "1px solid rgba(255,255,255,0.6)",
	background: "rgba(17,24,39,0.75)",
	color: "white",
	fontWeight: 900,
	fontSize: 12,
	letterSpacing: 0.4,
  } as const,


  catPill: {
	padding: "6px 10px",
	borderRadius: 999,
	border: "1px solid #e5e7eb",
	background: "#f9fafb",
	fontWeight: 900,
	fontSize: 16,
	color: "#111827",
	whiteSpace: "nowrap",
  } as const,
  
  mediaFrame: {
    position: "relative",
    borderRadius: 14,
    overflow: "hidden",
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
  } as const,

  mediaOverlay: {
    position: "absolute",
    inset: 0,
    display: "grid",
    placeItems: "center",
    background: "rgba(17,24,39,0.35)",
    transition: "opacity 180ms ease",
    pointerEvents: "none",
    zIndex: 2,
  } as const,

  mediaOverlayText: {
    color: "white",
    fontWeight: 900,
    fontSize: 18,
    letterSpacing: 0.2,
    display: "inline-flex",
    alignItems: "center",
    textShadow: "0 6px 18px rgba(0,0,0,0.45)",
    transition: "transform 180ms ease",
  } as const,

}