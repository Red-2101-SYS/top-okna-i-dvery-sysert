"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    ymaps?: any;
  }
}

type Props = {
  center: [number, number]; // [lat, lon]
  zoom?: number;
  placemarkText?: string;
};

export default function YandexMap({ center, zoom = 16, placemarkText = "Офис" }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_YMAPS_KEY;
    if (!key) {
      console.error("NEXT_PUBLIC_YMAPS_KEY не задан в .env");
      return;
    }

    function initMap() {
      if (!window.ymaps || !mapRef.current) return;

      window.ymaps.ready(() => {
        if (!mapRef.current) return;

        // Если компонент перерендерился — не создаём карту второй раз
        if (mapInstanceRef.current) return;

        const map = new window.ymaps.Map(mapRef.current, {
          center,
          zoom,
          controls: ["zoomControl", "fullscreenControl"],
        });

        const placemark = new window.ymaps.Placemark(
          center,
          { balloonContent: placemarkText },
          { preset: "islands#redIcon" }
        );

        map.geoObjects.add(placemark);
        mapInstanceRef.current = map;
      });
    }

    // Если скрипт уже подключен
    if (window.ymaps) {
      initMap();
      return;
    }

    // Подключаем скрипт один раз
    const scriptId = "yandex-maps-api";
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (existing) {
      existing.addEventListener("load", initMap);
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${key}&lang=ru_RU`;
    script.async = true;
    script.onload = initMap;
    document.head.appendChild(script);

    return () => {
      // Уничтожаем инстанс карты при уходе со страницы
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, [center, zoom, placemarkText]);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: 420,
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid #e5e7eb",
      }}
    />
  );
}
