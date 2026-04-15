type HeroProps = {
  onSample: () => void;
  onBuild: () => void;
};

export default function Hero({ onSample, onBuild }: HeroProps) {
  return (
    <section className="hero">
      <div className="hero-inner">
        <span className="hero-eyebrow">A simple paycheck planner for couples</span>
        <h1>
          Know exactly what to do
          <br />
          with <em>every paycheck.</em>
        </h1>
        <p className="hero-sub">
          Clear. Fair.
          <br />
          And one less thing to think about every month.
        </p>
        <div className="hero-actions">
          <button className="btn-hero-primary" onClick={onBuild}>
            Build My Plan
          </button>
          <button className="btn-hero-secondary" onClick={onSample}>
            Try with Sample Data
          </button>
        </div>
        <p className="hero-privacy">
          All calculations happen locally on your device. No data is stored or shared.
        </p>
      </div>
    </section>
  );
}
