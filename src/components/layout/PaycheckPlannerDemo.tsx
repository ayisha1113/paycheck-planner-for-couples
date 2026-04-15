import { useEffect, useState } from "react";

const steps = ["Model", "Numbers", "Plan"];

export default function PaycheckPlannerDemo() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const duration = step === 2 ? 3400 : 1800;
    const timer = window.setTimeout(() => {
      setStep((current) => (current + 1) % steps.length);
    }, duration);

    return () => window.clearTimeout(timer);
  }, [step]);

  return (
    <div className="demo-shell" aria-label="Paycheck Planner demo">
      <div className="demo-progress" aria-label="Demo steps">
        {steps.map((label, index) => (
          <button
            type="button"
            key={label}
            className={`demo-progress-dot ${index <= step ? "active" : ""}`}
            onClick={() => setStep(index)}
            aria-label={`Show ${label} step`}
            aria-pressed={step === index}
          />
        ))}
      </div>

      <div className="demo-stage">
        {/* Step 1: choose a model */}
        <div className={`demo-step ${step === 0 ? "active" : ""}`}>
          <span className="demo-label">Choose what feels fair</span>
          <div className="demo-model-panel">
            <div className="demo-model-option">
              <span>Stability</span>
              <small>Shared first</small>
            </div>
            <div className="demo-model-option">
              <span>Autonomy</span>
              <small>Personal space</small>
            </div>
            <div className="demo-model-option selected">
              <span>Fair Share</span>
              <small>Income-based</small>
            </div>
          </div>
        </div>

        {/* Step 2: enter basic numbers */}
        <div className={`demo-step ${step === 1 ? "active" : ""}`}>
          <span className="demo-label">Enter your numbers</span>
          <div className="demo-input-list">
            <div className="demo-income-line">
              <span>Emma $3,500</span>
              <span>James $5,000</span>
            </div>
            <div className="demo-expense-line">
              Shared expenses <strong>$2,800</strong>
            </div>
          </div>
        </div>

        {/* Step 3: show the result */}
        <div className={`demo-step demo-result-step ${step === 2 ? "active" : ""}`}>
          <span className="demo-label">This is what you’ll get</span>
          <div className="demo-result-card">
            <span>Fair Share Model</span>
            <strong>Keep $900 · Move $1,600</strong>
            <p>Save $1450 after bills. Use the same plan next month.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
