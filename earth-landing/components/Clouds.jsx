const CLOUDS = ["north", "east", "west", "low", "far"];

export default function Clouds() {
  return (
    <div className="atmos-clouds" aria-hidden="true">
      {CLOUDS.map((cloud) => (
        <div className={`paint-cloud paint-cloud--${cloud}`} key={cloud}>
          <i /><i /><i /><i />
        </div>
      ))}
    </div>
  );
}
