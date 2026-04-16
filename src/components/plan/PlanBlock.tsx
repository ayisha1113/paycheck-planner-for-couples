import { fmtCurrency } from "../../lib/format";
import type { Language } from "../../lib/i18n";
import type { PlanBlock as PlanBlockType } from "../../types/planner";

type Props = {
  language: Language;
  block: PlanBlockType;
};

export default function PlanBlock({ language, block }: Props) {
  const isZh = language === "zh";

  return (
    <div className={`planBlock ${block.who === "a" ? "a" : ""}`}>
      <div className="planHead">
        <div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 22 }}>
            {block.title}
          </div>
          <div className="helperText">{isZh ? "到手" : "Take-home"} {fmtCurrency(block.gross)}</div>
        </div>
      </div>

      <div className="planSteps">
        {block.steps.length === 0 ? (
          <div className="planStep surplus">
            <span>{isZh ? "这笔工资暂时不需要操作" : "No action this paycheck"}</span>
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
