"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import WindowCalc from "./WindowCalc";
import DoorCalc from "./DoorCalc";
import ServicesOnlyCalc from "./ServicesOnlyCalc";

export default function CalculatorClient({ productParam, serviceParam }: { productParam?: string | null; serviceParam?: string | null }) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const initialTab =
    tabParam === "doors" ? "DOORS" : tabParam === "services" ? "SERVICES" : "WINDOWS";

  const [tab, setTab] = useState(initialTab);

  return (
    <>
      {tab === "WINDOWS" && <WindowCalc productSlugFromCatalog={productParam ?? null} />}
      {tab === "DOORS" && <DoorCalc productSlugFromCatalog={productParam ?? null} />}
      {tab === "SERVICES" && <ServicesOnlyCalc preselectSlug={serviceParam ?? null} />}
    </>
  );
}
