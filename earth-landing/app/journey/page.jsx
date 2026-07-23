export const metadata = {
  title: "Viviane's Route — The Journey",
  description: "Five missions around the world.",
};

export default function JourneyPage() {
  return (
    <iframe
      title="Viviane's birthday journey"
      src="/journey/index.html?dev=journey"
      style={{ display: "block", width: "100vw", height: "100dvh", border: 0 }}
    />
  );
}
