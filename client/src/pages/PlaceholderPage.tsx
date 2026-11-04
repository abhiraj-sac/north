export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <section className="placeholder-content" aria-labelledby="placeholder-heading">
      <h1 id="placeholder-heading">{title}</h1>
    </section>
  );
}
