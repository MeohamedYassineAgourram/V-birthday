const STORIES = [
  {
    number: "01",
    title: "A world made for wandering.",
    text: "Move slowly through quiet places, small discoveries, and moments that invite you to look again.",
    art: "islands",
  },
  {
    number: "02",
    title: "Every horizon tells a story.",
    text: "Thoughtful interactions turn five small challenges into one gentle adventure through time.",
    art: "ruins",
  },
  {
    number: "03",
    title: "Return with a little more wonder.",
    text: "The final gate opens only after every world has shared one of its hidden memories.",
    art: "sanctuary",
  },
];

export default function StorySection() {
  return (
    <section className="story" id="story">
      <header className="story-intro">
        <p>Designed as a small escape</p>
        <h2>A quieter kind of adventure.</h2>
      </header>
      <div className="story-list">
        {STORIES.map((story, index) => (
          <article className={`story-card ${index % 2 ? "story-card--reverse" : ""}`} key={story.number}>
            <div className={`story-art story-art--${story.art}`} aria-hidden="true"><i /><i /><i /></div>
            <div className="story-copy">
              <p className="story-number">{story.number}</p>
              <h3>{story.title}</h3>
              <p>{story.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
