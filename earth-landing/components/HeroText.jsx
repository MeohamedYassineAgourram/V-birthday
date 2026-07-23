"use client";

import Button from "./Button";
import { motion } from "framer-motion";

export default function HeroText() {
  const scrollToStory = () => document.getElementById("story")?.scrollIntoView({ behavior: "smooth" });

  return (
    <motion.div
      className="hero-text"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.25, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <p className="hero-eyebrow">An invitation to look beyond</p>
      <h1 id="hero-title">Explore a New Perspective</h1>
      <p className="hero-description">
        Experience our interactive world through immersive visuals, elegant storytelling,
        and thoughtful design.
      </p>
      <div className="hero-actions">
        <Button href="/journey">Begin Journey <span aria-hidden="true">→</span></Button>
        <Button variant="secondary" onClick={scrollToStory}>Learn More</Button>
      </div>
    </motion.div>
  );
}
