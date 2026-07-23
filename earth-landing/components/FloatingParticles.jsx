const PARTICLES = Array.from({ length: 18 }, (_, index) => index);

export default function FloatingParticles() {
  return (
    <div className="floating-particles" aria-hidden="true">
      {PARTICLES.map((particle) => <i key={particle} style={{ "--particle": particle }} />)}
    </div>
  );
}
