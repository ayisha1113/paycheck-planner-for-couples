import { fmtCurrency } from "../../lib/format";
import type { PlanBlock as PlanBlockType } from "../../types/planner";

type Props = {
  block: PlanBlockType;
};

export default function PlanBlock({ block }: Props) {
  return (
    <div className={`planBlock ${block.who === "a" ? "a" : ""}`}>
      <div className="planHead">
        <div>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 22 }}>
            {block.title}
          </div>
          <div className="helperText">Take-home {fmtCurrency(block.gross)}</div>
        </div>
      </div>

      <div className="planSteps">
        {block.steps.length === 0 ? (
          <div className="planStep surplus">
            <span>No action this paycheck</span>
            <strong>$0</strong>
          </div>
        ) : null}

        {block.steps.map((step, idx) => (
          <div key={idx} className={`planStep ${step.kind}`}>
            <span>{step.label}</span>
            <strong>{fmtCurrency(step.amount)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
