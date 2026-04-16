import { useMemo, useState } from "react";
import { joinNames, type Language } from "../../lib/i18n";
import { createPlanLink, copyText, savePlanImage, shareTool } from "../../lib/shareTools";
import type { BuilderState, ModelKey, PlanSummary } from "../../types/planner";
import PlanBlock from "./PlanBlock";
import PlanStatStrip from "./PlanStatStrip";

type Props = {
  language: Language;
  plan: PlanSummary;
  state: BuilderState;
  model: ModelKey;
  onEdit: () => void;
};

export default function PlanOutput({ language, plan, state, model, onEdit }: Props) {
  const [status, setStatus] = useState("");
  const planLink = useMemo(() => createPlanLink(model, state), [model, state]);
  const isZh = language === "zh";

  const handleShare = async () => {
    try {
      await shareTool(language);
      setStatus(isZh ? "工具链接已准备好分享。" : "Tool link ready to share.");
    } catch {
      setStatus(isZh ? "分享已取消。" : "Sharing was cancelled.");
    }
  };

  const handleCopy = async () => {
    await copyText(planLink);
    setStatus(isZh ? "结果链接已复制，里面会保留这次的数字。" : "Link copied. Your numbers are included.");
  };

  const handleSave = async () => {
    await savePlanImage(plan, state, language);
    setStatus(isZh ? "已保存为 PNG 图片。" : "Saved as a PNG.");
  };

  return (
    <section className="section">
      <div className="sectionInner">
        <div className="eyebrow">{isZh ? "你的月度计划" : "Your monthly plan"}</div>
        <h2 className="planTitle">
          {isZh ? `${joinNames(state.names.a, state.names.b, language)}的发薪计划` : `${joinNames(state.names.a, state.names.b, language)}'s paycheck plan`}
        </h2>
        <div className="sectionDesc" style={{ marginBottom: 24 }}>
          {plan.modelLabel} · {plan.sharedRuleText}
        </div>

        {plan.warnings.map((warning, idx) => (
          <div key={idx} className={warning.type === "error" ? "errorBox" : "warning"}>
            <span>!</span>
            <span>{warning.message}</span>
          </div>
        ))}

        <PlanStatStrip stats={plan.stats} />

        <div className="planGrid twoCol">
          {plan.blocks.map((block) => (
            <PlanBlock language={language} key={block.title} block={block} />
          ))}
        </div>

        <div style={{ marginTop: 24 }}>
          <button className="secondaryBtn" onClick={onEdit}>
            {isZh ? "修改输入" : "Edit my inputs"}
          </button>
        </div>

        <div className="planActions" aria-label={isZh ? "分享和保存这份计划" : "Share and save this plan"}>
          <button className="planActionBtn" onClick={handleShare}>
            {isZh ? "分享这个工具" : "Share this tool"}
          </button>
          <button className="planActionBtn" onClick={handleCopy}>
            {isZh ? "分享这份结果" : "Share this result"}
          </button>
          <button className="planActionBtn primary" onClick={handleSave}>
            {isZh ? "保存到本地" : "Save to device"}
          </button>
          <a
            className="planActionBtn feedback"
            href="https://forms.gle/s1mRj5X4Cw2SJi3z9"
            target="_blank"
            rel="noreferrer"
          >
            {isZh ? "30 秒反馈" : "Share 30-sec feedback"}
          </a>
        </div>
        {status ? <div className="planActionStatus">{status}</div> : null}
      </div>
    </section>
  );
}
