type PreviewSectionProps = {
  onBuild: () => void;
};

export default function PreviewSection({ onBuild }: PreviewSectionProps) {
  return (
    <section className="preview-section reveal-on-scroll">
      <div className="section-inner">
        <span className="section-eyebrow">What you'll get</span>
        <h2 className="section-heading">
          A clear plan you can follow without
          <br />
          rethinking everything every month.
        </h2>

        <div className="preview-card">
          <div>
            <span className="preview-label">Example monthly plan</span>

            <div className="preview-block">
              <div className="preview-block-head">
                <div className="preview-dot pd-a" />
                Emma — Paycheck 1
              </div>
              <div className="preview-step ps-keep">
                <span className="ps-label">Keep for personal spending</span>
                <span className="ps-amt">$800</span>
              </div>
              <div className="preview-step ps-xfer">
                <span className="ps-label">→ Transfer to Shared Expense Account</span>
                <span className="ps-amt">$1,700</span>
              </div>
            </div>

            <div className="preview-block">
              <div className="preview-block-head">
                <div className="preview-dot pd-b" />
                James — Paycheck 1
              </div>
              <div className="preview-step ps-keep">
                <span className="ps-label">Keep for personal spending</span>
                <span className="ps-amt">$1,200</span>
              </div>
              <div className="preview-step ps-xfer">
                <span className="ps-label">→ Transfer to Shared Expense Account</span>
                <span className="ps-amt">$1,800</span>
              </div>
            </div>

            <div className="preview-block">
              <div className="preview-block-head">
                <div className="preview-dot pd-b" />
                James — Paycheck 2
              </div>
              <div className="preview-step ps-xfer">
                <span className="ps-label">→ Transfer to Shared Buffer</span>
                <span className="ps-amt">$500</span>
              </div>
              <div className="preview-step ps-xfer">
                <span className="ps-label">→ Transfer to Joint Savings</span>
                <span className="ps-amt">$1,500</span>
              </div>
            </div>
          </div>

          <div className="preview-right">
            <h3>Your plan, ready in under 2 minutes.</h3>
            <p>
              Enter your paychecks, your shared expenses, and where
              you want your money to go. We handle the math and give
              you a step-by-step transfer guide you can actually follow.
            </p>
            <ul className="preview-items">
              <li>Exactly what to do with each paycheck</li>
              <li>How much to keep, move, and save</li>
              <li>A plan for both shared and personal money</li>
              <li>Clear steps you can follow right away</li>
            </ul>
            <button className="preview-cta" onClick={onBuild}>
              Build My Plan
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
