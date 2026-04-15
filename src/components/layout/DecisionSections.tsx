import PaycheckPlannerDemo from "./PaycheckPlannerDemo";

export default function DecisionSections() {
  return (
    <section className="pain-section reveal-on-scroll">
      <div className="section-inner pain-inner">
        <div className="pain-content">
          <span className="section-eyebrow">IT’S NOT JUST MATH</span>
          <h2 className="section-heading">Why this feels harder than it should</h2>
          <div className="pain-copy">
            <p>Because it’s not just math.</p>
            <p>It’s:</p>
            <div className="pain-lines">
              <span>"Is this fair?"</span>
              <span>"Are we on track?"</span>
              <span>"Why do we keep rethinking this?"</span>
            </div>
          </div>
        </div>

        <PaycheckPlannerDemo />
      </div>
    </section>
  );
}
