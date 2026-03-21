import { ui } from "@/app/styles/ui";
import YandexMap from "@/app/components/YandexMap";

export default function ContactsPage() {
  return (
    <main style={{ padding: "24px 0" }}>
      <div style={ui.container}>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>Контакты</h1>
        <p style={{ color: "#6b7280", marginTop: 8 }}>
          Офис в Сысерти • Консультации • Замер • Установка
        </p>

        <div style={{ marginTop: 16, display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
          {/* Левая колонка */}
          <div style={{ display: "grid", gap: 12 }}>
            <div style={ui.card}>
              <div style={{ fontWeight: 900, marginBottom: 8 }}>Офис</div>
              <div><b>Адрес:</b> г. Сысерть, ул. Трактовая, 13</div>
              <div style={{ marginTop: 6 }}><b>Телефон:</b> +7(912)66-44-447 </div>
              <div style={{ marginTop: 6 }}><b>Гафик работы:</b> Пн - Сб, 10:00 - 18:30  </div>
			  <div> Воскресенье - выходной </div>
			  <div style={{ marginTop: 12 }}>
				<a href="tel:+79126644447" className="btn btn-primary" style={ui.callBtn}>Позвонить</a>
			  </div>
            </div>

            <div style={ui.card}>
              <div style={{ fontWeight: 900, marginBottom: 8 }}>Менеджер</div>
              <div><b>ФИО:</b> Наталья Одношевина </div>
              <div style={{ marginTop: 6 }}><b>Телефон:</b> +7(912)66-44-447 </div>
              <div style={{ marginTop: 6 }}><b>Email:</b> (Заглушка)</div>
            </div>

            <div style={ui.card}>
              <div style={{ fontWeight: 900, marginBottom: 8 }}>Специалист по установке</div>
              <div><b>ФИО:</b> Сергей Бутаков </div>
              <div style={{ marginTop: 6 }}><b>Телефон:</b> +7(963)04-80-823 </div>
            </div>
          </div>

          {/* Правая колонка */}
          <div style={ui.card}>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>Мы на карте</div>

            <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e5e7eb" }}>
              	
				<YandexMap
				 center={[56.503149, 60.828882]}   // <-- сюда координаты офиса
				 zoom={16}
				 placemarkText="Офис: Топ Окна и Двери Сысерть"
				/>
			
            </div>

            <p style={{ color: "#6b7280", marginTop: 10, marginBottom: 0 }}>
              Метка стоит на адресе офиса.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
