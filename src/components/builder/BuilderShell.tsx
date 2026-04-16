import type { Dispatch, SetStateAction } from "react";
import { getModelCopy } from "../../data/modelCopy";
import type { Language } from "../../lib/i18n";
import type { BuilderState, ModelKey } from "../../types/planner";
import ModelSelection from "../model-selection/ModelSelection";
import AccountsSection from "./AccountsSection";
import PaychecksSection from "./PaychecksSection";
import PersonalSection from "./PersonalSection";
import ReviewSection from "./ReviewSection";
import SharedExpensesSection from "./SharedExpensesSection";

type Props = {
  language: Language;
  model: ModelKey | null;
  state: BuilderState;
  setState: Dispatch<SetStateAction<BuilderState>>;
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
  onSelectModel: (model: ModelKey) => void;
  onChangeModel: () => void;
  onGenerate: () => void;
};

type StepConfig = {
  label: string;
  sub: string;
};

function getSteps(model: ModelKey, language: Language): StepConfig[] {
  const isZh = language === "zh";

  if (model === "personal_first") {
    return [
      { label: isZh ? "工资" : "Paychecks", sub: isZh ? "谁发工资、金额是多少" : "Who gets paid and how much" },
      { label: isZh ? "个人空间" : "Personal Space", sub: isZh ? "每个人先留下多少钱" : "What each person keeps first" },
      { label: isZh ? "共同支出" : "Shared Expenses", sub: isZh ? "检查剩余的钱够不够覆盖账单" : "Check what is left to cover" },
      { label: isZh ? "共同目标" : "Shared Goals", sub: isZh ? "剩下的钱优先去哪里" : "Where remaining money goes" },
      { label: isZh ? "确认" : "Review", sub: isZh ? "生成计划" : "Generate your plan" },
    ];
  }

  if (model === "proportional") {
    return [
      { label: isZh ? "工资" : "Paychecks", sub: isZh ? "谁发工资、金额是多少" : "Who gets paid and how much" },
      { label: isZh ? "共同设置" : "Shared Setup", sub: isZh ? "共同支出和分摊规则" : "Shared costs and split rule" },
      { label: isZh ? "个人空间" : "Personal Space", sub: isZh ? "每个人留下多少钱" : "What each person keeps" },
      { label: isZh ? "共同目标" : "Shared Goals", sub: isZh ? "剩下的钱优先去哪里" : "Where money goes next" },
      { label: isZh ? "确认" : "Review", sub: isZh ? "生成计划" : "Generate your plan" },
    ];
  }

  return [
    { label: isZh ? "工资" : "Paychecks", sub: isZh ? "谁发工资、金额是多少" : "Who gets paid and how much" },
    { label: isZh ? "共同支出" : "Shared Expenses", sub: isZh ? "两个人每月一起承担的开销" : "Your joint monthly costs" },
    { label: isZh ? "个人空间" : "Personal Space", sub: isZh ? "每个人留下多少钱" : "What each person keeps" },
    { label: isZh ? "共同目标" : "Shared Goals", sub: isZh ? "剩下的钱优先去哪里" : "Where money goes next" },
    { label: isZh ? "确认" : "Review", sub: isZh ? "生成计划" : "Generate your plan" },
  ];
}

export default function BuilderShell({
  language,
  model,
  state,
  setState,
  step,
  setStep,
  onSelectModel,
  onChangeModel,
  onGenerate,
}: Props) {
  const isZh = language === "zh";

  if (!model) {
    return (
      <div className="builderWrap">
        <div className="model-step-card">
          <div className="card-header">
            <div className="card-title">
              {isZh ? "第 1 步 · 选择你们的规划方式" : "STEP 1 · CHOOSE YOUR PLANNING STYLE"}
            </div>
            <div className="planningQuestion">
              {isZh ? "你们想怎么一起管理钱？" : "How do you want to manage money together?"}
            </div>
          </div>
          <ModelSelection language={language} model={null} onSelect={onSelectModel} />
        </div>
      </div>
    );
  }

  const steps = getSteps(model, language);
  const modelCopy = getModelCopy(language);

  return (
    <div className="builderWrap">
      <div className="selected-model-banner">
        <div>
          <div className="kicker" style={{ marginBottom: 4 }}>
            {isZh ? "已选择方案" : "Selected setup"}
          </div>
          <div className="selected-model-title">{modelCopy[model].systemName}</div>
        </div>
        <button className="btn-next" onClick={onChangeModel}>
          {isZh ? "更换方案" : "Change setup"}
        </button>
      </div>

      <div className="step-flow">
        {steps.map((item, idx) => (
          <button
            key={item.label}
            className={`step-tab ${step === idx ? "active" : ""}`}
            onClick={() => setStep(idx)}
            title={item.sub}
          >
            <span className="step-num">{idx + 1}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {step === 0 ? <PaychecksSection language={language} state={state} setState={setState} /> : null}
      {step === 1 ? (
        model === "personal_first" ? (
          <PersonalSection language={language} model={model} state={state} setState={setState} />
        ) : (
          <SharedExpensesSection language={language} model={model} state={state} setState={setState} />
        )
      ) : null}
      {step === 2 ? (
        model === "shared_first" ? (
          <PersonalSection language={language} model={model} state={state} setState={setState} />
        ) : model === "personal_first" ? (
          <SharedExpensesSection language={language} model={model} state={state} setState={setState} />
        ) : (
          <PersonalSection language={language} model={model} state={state} setState={setState} />
        )
      ) : null}
      {step === 3 ? <AccountsSection language={language} model={model} state={state} setState={setState} /> : null}
      {step === 4 ? <ReviewSection language={language} model={model} state={state} /> : null}

      <div className="builderNavActions">
        <div>
          {step > 0 ? (
            <button className="btn-next" onClick={() => setStep((prev) => Math.max(prev - 1, 0))}>
              {isZh ? "上一步" : "Back"}
            </button>
          ) : null}
        </div>
        <div>
          {step < steps.length - 1 ? (
            <button className="btn-next builder-next-solid" onClick={() => setStep((prev) => Math.min(prev + 1, steps.length - 1))}>
              {isZh ? "下一步" : "Next"}
            </button>
          ) : (
            <button className="btn-generate" onClick={onGenerate}>
              {isZh ? "生成我的月度计划" : "Generate My Monthly Plan"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
