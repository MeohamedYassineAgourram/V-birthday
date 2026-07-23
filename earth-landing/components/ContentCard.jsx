"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function ContentCard() {
  const ref = useRef(null);
  const innerRef = useRef(null);

  // entrance: slide in from the left, smoothly (no bounce)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, x: -48 },
        { autoAlpha: 1, x: 0, duration: 1.2, ease: "power3.out", delay: 0.35 }
      );
    }, el);
    return () => ctx.revert();
  }, []);

  const beginJourney = () => {
    window.location.assign("/journey");
  };

  // subtle mouse parallax — the card drifts a few pixels
  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    let raf = 0;
    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    const onMove = (e) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 10;
      target.y = (e.clientY / window.innerHeight - 0.5) * 8;
    };
    const loop = () => {
      cur.x += (target.x - cur.x) * 0.06;
      cur.y += (target.y - cur.y) * 0.06;
      inner.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute left-[8%] top-1/2 z-20 w-[86vw] max-w-[380px] -translate-y-1/2 md:w-[380px]"
      style={{ willChange: "transform, opacity" }}
    >
      <div ref={innerRef} className="pointer-events-auto">
        <div
          className="overflow-hidden rounded-2xl border p-3"
          style={{
            background: "rgba(8,11,20,0.42)",
            borderColor: "rgba(255,255,255,0.10)",
            backdropFilter: "saturate(1.3) blur(22px)",
            WebkitBackdropFilter: "saturate(1.3) blur(22px)",
            boxShadow:
              "0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.03) inset, 0 0 60px -30px rgba(91,141,239,0.4)",
          }}
        >
          {/* cinematic thumbnail */}
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl">
            <img
              src="/img/thumb.jpg"
              alt="Rainforest conservation field footage"
              className="h-full w-full object-cover"
              loading="eager"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, transparent 40%, rgba(4,6,12,0.55) 100%)",
              }}
            />
          </div>

          {/* text */}
          <div className="px-2 pb-1 pt-4">
            <p className="text-[11px] font-medium uppercase tracking-widest2 text-muted">
              Case 35
            </p>
            <h2 className="mt-2 text-[19px] font-medium leading-snug text-ink">
              Protecting Indigenous Lands of the Amazon
            </h2>
            <p className="mt-3 text-[13px] leading-relaxed text-muted">
              Safeguarding the rainforest alongside the communities who have
              stewarded it for generations — restoring canopy, rivers, and the
              right to remain.
            </p>

            <button
              onClick={beginJourney}
              className="group mt-5 inline-flex items-center gap-3 text-[12px] font-semibold uppercase tracking-widest2 text-ink transition-opacity hover:opacity-80"
              type="button"
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full border"
                style={{ borderColor: "rgba(255,255,255,0.25)" }}
              >
                <svg width="10" height="12" viewBox="0 0 10 12" fill="none" aria-hidden>
                  <path d="M0 0L10 6L0 12V0Z" fill="currentColor" />
                </svg>
              </span>
              Begin the journey
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
