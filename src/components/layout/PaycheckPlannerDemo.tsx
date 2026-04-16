import { useEffect, useState } from "react";
import type { Language } from "../../lib/i18n";

const steps = ["Model", "Numbers", "Plan"];

type Props = {
  language: Language;
};

export default function PaycheckPlannerDemo({ language }: Props) {
  const [step, setStep] = useState(0);
  const isZh = language === "zh";

  useEffect(() => {
    const duration = step === 2 ? 3400 : 1800;
    const timer = window.setTimeout(() => {
      setStep((current) => (current + 1) % steps.length);
    }, duration);

    return () => window.clearTimeout(timer);
  }, [step]);

  return (
    <div className="demo-shell" aria-label={isZh ? "发薪规划器示例" : "Paycheck Planner demo"}>
      <div className="demo-progress" aria-label={isZh ? "示例步骤" : "Demo steps"}>
        {steps.map((label, index) => (
          <button
            type="button"
            key={label}
            className={`demo-progress-dot ${index <= step ? "active" : ""}`}
            onClick={() => setStep(index)}
            aria-label={isZh ? `查看第 ${index + 1} 步` : `Show ${label} step`}
            aria-pressed={step === index}
          />
        ))}
      </div>

      <div className="demo-stage">
        <div className={`demo-step ${step === 0 ? "active" : ""}`}>
          <span className="demo-label">{isZh ? "先选一种你们觉得公平的方式" : "Choose what feels fair"}</span>
          <div className="demo-model-panel">
            <div className="demo-model-option">
              <span>{isZh ? "稳定" : "Stability"}</span>
              <small>{isZh ? "共同支出优先" : "Shared first"}</small>
            </div>
            <div className="demo-model-option">
              <span>{isZh ? "边界" : "Autonomy"}</span>
              <small>{isZh ? "个人空间优先" : "Personal space"}</small>
            </div>
            <div className="demo-model-option selected">
              <span>{isZh ? "公平分摊" : "Fair Share"}</span>
              <small>{isZh ? "按收入比例" : "Income-based"}</small>
            </div>
          </div>
        </div>

        <div className={`demo-step ${step === 1 ? "active" : ""}`}>
          <span className="demo-label">{isZh ? "填入你们的数字" : "Enter your numbers"}</span>
          <div className="demo-input-list">
            <div className="demo-income-line">
              <span>{isZh ? "小林 $3,500" : "Emma $3,500"}</span>
              <span>{isZh ? "小周 $5,000" : "James $5,000"}</span>
            </div>
            <div className="demo-expense-line">
              {isZh ? "共同支出" : "Shared expenses"} <strong>$2,800</strong>
            </div>
          </div>
        </div>

        <div className={`demo-step demo-result-step ${step === 2 ? "active" : ""}`}>
          <span className="demo-label">{isZh ? "生成可以照做的计划" : "This is what you'll get"}</span>
          <div className="demo-result-card">
            <span>{isZh ? "公平分摊方案" : "Fair Share Model"}</span>
            <strong>{isZh ? "留 $900 · 转 $1,600" : "Keep $900 · Move $1,600"}</strong>
            <p>{isZh ? "账单后还能存 $1,450，下个月继续沿用。" : "Save $1450 after bills. Use the same plan next month."}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
