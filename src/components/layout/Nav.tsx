type NavProps = {
  onBuild: () => void;
};

export default function Nav({ onBuild }: NavProps) {
  return (
    <nav className="nav">
      <div className="nav-logo">
        <div className="nav-mark">♡</div>
        <span className="nav-name">Paycheck Planner</span>
        <span className="nav-badge">For Couples</span>
      </div>
      <button className="nav-cta" onClick={onBuild}>
        Build My Plan
      </button>
    </nav>
  );
}
