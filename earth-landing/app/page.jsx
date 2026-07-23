"use client";

import dynamic from "next/dynamic";
import ContentCard from "@/components/ContentCard";

// The R3F scene is client-only (WebGL) — never server-render it.
const Scene = dynamic(() => import("@/components/Scene"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-space" />,
});

export default function Page() {
  return (
    <main className="relative h-[100dvh] w-screen overflow-hidden bg-space">
      {/* fullscreen space + earth */}
      <Scene />

      {/* faint vignette to seat the composition */}
      <div
        className="pointer-events-none absolute inset-0 z-[5]"
        style={{
          background:
            "radial-gradient(120% 90% at 30% 40%, transparent 40%, rgba(3,4,10,0.55) 100%)",
        }}
      />

      {/* left floating glass card */}
      <ContentCard />
    </main>
  );
}
