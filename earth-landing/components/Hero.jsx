"use client";

import dynamic from "next/dynamic";
import Clouds from "./Clouds";
import FloatingParticles from "./FloatingParticles";
import HeroText from "./HeroText";
import Mountains from "./Mountains";

const EarthScene = dynamic(() => import("./EarthScene"), { ssr: false });

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-sky" aria-hidden="true" />
      <Clouds />
      <FloatingParticles />
      <Mountains />
      <EarthScene />
      <div className="hero-content"><HeroText /></div>
      <div className="hero-scroll-cue" aria-hidden="true"><i /> Scroll to wander</div>
    </section>
  );
}
