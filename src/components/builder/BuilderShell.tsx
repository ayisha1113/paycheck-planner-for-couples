import type { Dispatch, SetStateAction } from "react";
import type { BuilderState, ModelKey } from "../../types/planner";
import ModelSelection from "../model-selection/ModelSelection";
import AccountsSection from "./AccountsSection";
import PaychecksSection from "./PaychecksSection";
import PersonalSection from "./PersonalSection";
import ReviewSection from "./ReviewSection";
import SharedExpensesSection from "./SharedExpensesSection";

type Props = {
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

function getSteps(model: ModelKey): StepConfig[] {
  if (model === "personal_first") {
    return [
      { label: "Paychecks", sub: "Who gets paid and how much" },
      { label: "Personal Space", sub: "What each person keeps first" },
      { label: "Shared Expenses", sub: "Check what is left to cover" },
      { label: "Shared Goals", sub: "Where remaining money goes" },
      { label: "Review", sub: "Generate your plan" },
    ];
  }

  if (model === "proportional") {
    return [
      { label: "Paychecks", sub: "Who gets paid and how much" },
      { label: "Shared Setup", sub: "Shared costs and split rule" },
      { label: "Personal Space", sub: "What each person keeps" },
      { label: "Shared Goals", sub: "Where money goes next" },
      { label: "Review", sub: "Generate your plan" },
    ];
  }

  return [
    { label: "Paychecks", sub: "Who gets paid and how much" },
    { label: "Shared Expenses", sub: "Your joint monthly costs" },
    { label: "Personal Space", sub: "What each person keeps" },
    { label: "Shared Goals", sub: "Where money goes next" },
    { label: "Review", sub: "Generate your plan" },
  ];
}

export default function BuilderShell({
  model,
  state,
  setState,
  step,
  setStep,
  onSelectModel,
  onChangeModel,
  onGenerate,
}: Props) {
  if (!model) {
    return (
      <div className="builderWrap">
        <div className="model-step-card">
          <div className="card-header">
            <div className="card-title">STEP 1 · CHOOSE YOUR PLANNING STYLE</div>
            <div className="planningQuestion">
              How do you want to manage money together?
            </div>
          </div>
          <ModelSelection model={null} onSelect={onSelectModel} />
        </div>
      </div>
    );
  }

  const steps = getSteps(model);

  return (
    <div className="builderWrap">
      <div className="selected-model-banner">
        <div>
          <div className="kicker" style={{ marginBottom: 4 }}>
            Selected setup
          </div>
          <div className="selected-model-title">
            {model === "shared_first"
              ? "Shared-First"
              : model === "personal_first"
                ? "Personal-First"
                : "Income-Based Split"}
          </div>
        </div>
        <button className="btn-next" onClick={onChangeModel}>
          Change setup
        </button>
      </div>

      <div className="step-flow">
        {steps.map((item, idx) => (
          <button
            key={item.label}
            className={`step-tab ${step === idx ? "active" : ""}`}
            onClick={() => setStep(idx)}
          >
            <span className="step-num">{idx + 1}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {step === 0 ? <PaychecksSection state={state} setState={setState} /> : null}
      {step === 1 ? (
        model === "personal_first" ? (
          <PersonalSection model={model} state={state} setState={setState} />
        ) : (
          <SharedExpensesSection model={model} state={state} setState={setState} />
        )
      ) : null}
      {step === 2 ? (
        model === "shared_first" ? (
          <PersonalSection model={model} state={state} setState={setState} />
        ) : model === "personal_first" ? (
          <SharedExpensesSection model={model} state={state} setState={setState} />
        ) : (
          <PersonalSection model={model} state={state} setState={setState} />
        )
      ) : null}
      {step === 3 ? (
        model === "shared_first" ? (
          <AccountsSection model={model} state={state} setState={setState} />
        ) : (
          <AccountsSection model={model} state={state} setState={setState} />
        )
      ) : null}
      {step === 4 ? <ReviewSection model={model} state={state} /> : null}

      <div className="builderNavActions">
        <div>
          {step > 0 ? (
            <button className="btn-next" onClick={() => setStep((prev) => Math.max(prev - 1, 0))}>
              Back
            </button>
          ) : null}
        </div>
        <div>
          {step < steps.length - 1 ? (
            <button className="btn-next builder-next-solid" onClick={() => setStep((prev) => Math.min(prev + 1, steps.length - 1))}>
              Next
            </button>
          ) : (
            <button className="btn-generate" onClick={onGenerate}>
              Generate My Monthly Plan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
