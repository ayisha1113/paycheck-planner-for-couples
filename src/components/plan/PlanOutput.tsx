import { useMemo, useState } from "react";
import { createPlanLink, copyText, savePlanImage, shareTool } from "../../lib/shareTools";
import type { BuilderState, ModelKey, PlanSummary } from "../../types/planner";
import PlanBlock from "./PlanBlock";
import PlanStatStrip from "./PlanStatStrip";

type Props = {
  plan: PlanSummary;
  state: BuilderState;
  model: ModelKey;
  onEdit: () => void;
};

export default function PlanOutput({ plan, state, model, onEdit }: Props) {
  const [status, setStatus] = useState("");
  const planLink = useMemo(() => createPlanLink(model, state), [model, state]);

  const handleShare = async () => {
    try {
      await shareTool(planLink);
      setStatus("Ready to share.");
    } catch {
      setStatus("Sharing was cancelled.");
    }
  };

  const handleCopy = async () => {
    await copyText(planLink);
    setStatus("Link copied. Your numbers are included.");
  };

  const handleSave = async () => {
    await savePlanImage(plan, state);
    setStatus("Saved as a PNG.");
  };

  return (
    <section className="section">
      <div className="sectionInner">
        <div className="eyebrow">Your monthly plan</div>
        <h2 className="planTitle">
          {state.names.a} &amp; {state.names.b}'s paycheck plan
        </h2>
        <div className="sectionDesc" style={{ marginBottom: 24 }}>
          {plan.modelLabel} · {plan.sharedRuleText}
        </div>

        {plan.warnings.map((warning, idx) => (
          <div key={idx} className={warning.type === "error" ? "errorBox" : "warning"}>
            <span>{warning.type === "error" ? "!" : "!"}</span>
            <span>{warning.message}</span>
          </div>
        ))}

        <PlanStatStrip stats={plan.stats} />

        <div className="planGrid twoCol">
          {plan.blocks.map((block) => (
            <PlanBlock key={block.title} block={block} />
          ))}
        </div>

        <div style={{ marginTop: 24 }}>
          <button className="secondaryBtn" onClick={onEdit}>
            Edit my inputs
          </button>
        </div>

        <div className="planActions" aria-label="Share and save this plan">
          <button className="planActionBtn" onClick={handleShare}>
            Share this tool
          </button>
          <button className="planActionBtn" onClick={handleCopy}>
            Copy link
          </button>
          <button className="planActionBtn primary" onClick={handleSave}>
            Save to device
          </button>
        </div>
        {status ? <div className="planActionStatus">{status}</div> : null}
      </div>
    </section>
  );
}
