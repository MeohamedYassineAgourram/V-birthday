export const metadata = {
  title: "The Hidden Horizon — Time Map",
  description: "Five missions across impossible eras.",
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
