import type { Dispatch, SetStateAction } from "react";
import { fmtCurrency } from "../../lib/format";
import type { Language } from "../../lib/i18n";
import { getPersonalAmounts, getSharedSplit, totalExpenses, totalIncome } from "../../lib/plannerMath";
import type { BuilderState, ModelKey } from "../../types/planner";
import CustomSelect from "../common/CustomSelect";

type Props = {
  language: Language;
  model: ModelKey;
  state: BuilderState;
  setState: Dispatch<SetStateAction<BuilderState>>;
};

export default function SharedExpensesSection({ language, model, state, setState }: Props) {
  const isZh = language === "zh";
  const expenseTotal = totalExpenses(state);
  const income = totalIncome(state);
  const personal = getPersonalAmounts(model, state);
  const split = getSharedSplit(model, state, expenseTotal, language);
  const sharedShortfallAfterPersonal = Math.max(0, expenseTotal - Math.max(0, income - personal.total));

  return (
    <div className="card">
      <div className="paneHeader">
        <div className="kicker">{model === "proportional" ? (isZh ? "共同设置" : "Shared setup") : (isZh ? "共同支出" : "Shared expenses")}</div>
        <h3 className="cardTitleSerif">{isZh ? "每月共同支出" : "Monthly shared expenses"}</h3>
        <div className="muted">
          {isZh
            ? "把两个人一起承担的开销放在这里，比如房租、买菜、保险、水电、交通和其他共同账单。"
            : "Everything you both pay together - rent, groceries, insurance, utilities, transportation, and other joint costs."}
        </div>
      </div>

      <div className="stack">
        {state.expenses.map((expense, idx) => (
          <div key={expense.id} className="rowCard">
            <div className="twoCol">
              <div className="field">
                <label>{isZh ? "支出名称" : "Expense name"}</label>
                <input
                  value={expense.name}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      expenses: prev.expenses.map((item, i) =>
                        i === idx ? { ...item, name: e.target.value } : item,
                      ),
                    }))
                  }
                />
              </div>

              <div className="field">
                <label>{isZh ? "金额" : "Amount"}</label>
                <input
                  type="number"
                  step={100}
                  value={expense.amount}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      expenses: prev.expenses.map((item, i) =>
                        i === idx
                          ? { ...item, amount: Number(e.target.value || 0) }
                          : item,
                      ),
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <button
                className="dangerBtn"
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    expenses: prev.expenses.filter((_, i) => i !== idx),
                  }))
                }
              >
                {isZh ? "删除" : "Remove"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="inlineRow" style={{ marginTop: 12 }}>
        <button
          className="ghostBtn"
          onClick={() =>
            setState((prev) => ({
              ...prev,
              expenses: [
                ...prev.expenses,
                {
                  id: Date.now() + Math.floor(Math.random() * 1000),
                  name: "",
                  amount: 0,
                },
              ],
            }))
          }
        >
          {isZh ? "+ 添加共同支出" : "+ Add expense"}
        </button>
      </div>

      <div className="toggleRow" style={{ marginTop: 16 }}>
        <input
          type="checkbox"
          checked={state.expenseOverrideEnabled}
          onChange={(e) =>
            setState((prev) => ({
              ...prev,
              expenseOverrideEnabled: e.target.checked,
            }))
          }
        />
        <span className="muted" style={{ flex: 1 }}>
          {isZh ? "直接填写一个共同支出总额" : "Use one total instead of adding every shared expense"}
        </span>
        {state.expenseOverrideEnabled ? (
          <input
            type="number"
            step={100}
            className="numberInput overrideInput"
            placeholder={isZh ? "估算总额" : "Estimated total"}
            value={state.expenseOverrideValue || ""}
            onChange={(e) =>
              setState((prev) => ({
                ...prev,
                expenseOverrideValue: Number(e.target.value || 0),
              }))
            }
            style={{ maxWidth: 160 }}
          />
        ) : null}
      </div>
      <div className="helperText" style={{ marginTop: 8 }}>
        {isZh
          ? "如果你只知道大概金额，或者想用最终总额覆盖上面的明细，就勾选这里。"
          : "Choose this if you only know an estimate, or if you want to replace the itemized total with a final monthly amount."}
      </div>

      {model === "proportional" ? (
        <div className="card" style={{ marginTop: 16, padding: 18 }}>
          <div className="kicker">{isZh ? "共同支出分摊规则" : "Shared split rule"}</div>

          <div className="stack">
            <div className="field">
              <label>{isZh ? "分摊方式" : "Split method"}</label>
              <CustomSelect
                value={state.sharedRatioMode}
                onChange={(value) =>
                  setState((prev) => ({
                    ...prev,
                    sharedRatioMode: value as "income" | "custom",
                  }))
                }
                options={[
                  { value: "income", label: isZh ? "按收入比例自动计算" : "Based on income" },
                  { value: "custom", label: isZh ? "使用自定义比例" : "Use a custom ratio" },
                ]}
              />
            </div>

            {state.sharedRatioMode === "income" ? (
              <div className="helperText">
                {isZh ? "自动计算的比例预览：" : "Auto-calculated ratio preview:"} <strong>{split.ratio}% / {100 - split.ratio}%</strong>
              </div>
            ) : (
              <>
                <div className="inlineRow" style={{ flexWrap: "wrap" }}>
                  <span style={{ minWidth: 120, color: "var(--pink-deep)", fontWeight: 700 }}>
                    {isZh ? `${state.names.a} 的比例` : `${state.names.a}'s share`}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={state.sharedRatio}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        sharedRatio: Number(e.target.value || 0),
                      }))
                    }
                  />
                  <span className="splitPill">
                    {state.sharedRatio}% / {100 - state.sharedRatio}%
                  </span>
                </div>

                <div className="helperText">
                  {isZh
                    ? "我们会尽量让整体分摊接近这个比例，同时保持计划清楚、可执行。"
                    : "We'll aim to keep the overall split close to this ratio while keeping the plan readable and practical."}
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}

      <div className="metricBar" style={{ marginTop: 16 }}>
        <div>
          <div className="kicker" style={{ marginBottom: 4 }}>
            {isZh ? "共同支出总额" : "Total shared expenses"}
          </div>
          <div className="helperText">{split.label}</div>
        </div>
        <strong>{fmtCurrency(expenseTotal)}</strong>
      </div>

      {model === "personal_first" && sharedShortfallAfterPersonal > 0 ? (
        <div className="errorBox" style={{ marginTop: 12 }}>
          {isZh
            ? `需要把个人空间至少减少 ${fmtCurrency(sharedShortfallAfterPersonal)}，才能覆盖共同支出。`
            : `Reduce personal space by at least ${fmtCurrency(sharedShortfallAfterPersonal)} to cover shared expenses.`}
        </div>
      ) : null}
    </div>
  );
}
