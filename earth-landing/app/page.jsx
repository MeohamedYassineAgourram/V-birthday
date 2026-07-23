import Link from "next/link";

export default function Page() {
  return (
    <main className="dream-landing">
      <div className="dream-sky" aria-hidden="true">
        <div className="dream-sun" />
        <div className="dream-cloud cloud-one"><i /><i /><i /></div>
        <div className="dream-cloud cloud-two"><i /><i /><i /></div>
        <div className="dream-cloud cloud-three"><i /><i /><i /></div>
        <div className="dream-cloud cloud-four"><i /><i /><i /></div>
        <div className="dream-birds"><i /><i /><i /></div>

        <div className="dream-mountains mountain-far" />
        <div className="dream-mountains mountain-mid" />
        <div className="dream-mountains mountain-near" />

        <section className="dream-island">
          <div className="island-grass" />
          <div className="island-rock rock-left" />
          <div className="island-rock rock-right" />
          <div className="island-rock rock-core" />
          <div className="island-path" />
          <div className="dream-gateway" aria-hidden="true">
            <i className="gateway-stone stone-top" />
            <i className="gateway-stone stone-left" />
            <i className="gateway-stone stone-right" />
            <i className="gateway-light" />
          </div>
        </section>
      </div>

      <section className="dream-intro">
        <p className="dream-kicker">A private little adventure</p>
        <h1>The hidden horizon</h1>
        <p className="dream-subtitle">There is a world beyond the clouds, built for you to explore.</p>
        <Link className="dream-begin" href="/journey">
          Begin the journey <span aria-hidden="true">→</span>
        </Link>
      </section>

      <p className="dream-note">Follow the light</p>
    </main>
  );
}
