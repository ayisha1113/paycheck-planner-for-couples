import type { Dispatch, SetStateAction } from "react";
import { useEffect } from "react";
import { fmtCurrency } from "../../lib/format";
import type { Language } from "../../lib/i18n";
import { getIncomeRatio, getPersonalAmounts, totalExpenses, totalIncome } from "../../lib/plannerMath";
import type { BuilderState, ModelKey } from "../../types/planner";
import CustomSelect from "../common/CustomSelect";

type Props = {
  language: Language;
  model: ModelKey;
  state: BuilderState;
  setState: Dispatch<SetStateAction<BuilderState>>;
};

export default function PersonalSection({ language, model, state, setState }: Props) {
  const isZh = language === "zh";
  const personal = getPersonalAmounts(model, state);
  const income = totalIncome(state);
  const expenses = totalExpenses(state);
  const maxPersonalForPersonalFirst = Math.max(0, income - expenses);
  const availableAtPersonalStep = Math.max(0, income - expenses);
  const maxIncomeSavingsPercent = income > 0
    ? Math.min(100, Math.max(0, Math.floor(((income - expenses) / income) * 100)))
    : 0;
  const isIncomePercentTooHigh = model === "proportional" && state.personalIncomePercent > maxIncomeSavingsPercent;
  const isOverPersonalLimit = model === "personal_first" && personal.total > maxPersonalForPersonalFirst;
  const incomeRatio = getIncomeRatio(state);

  useEffect(() => {
    if (model !== "proportional") return;
    if (state.personalIncomePercent <= maxIncomeSavingsPercent) return;

    setState((prev) => ({
      ...prev,
      personalIncomePercent: maxIncomeSavingsPercent,
    }));
  }, [maxIncomeSavingsPercent, model, setState, state.personalIncomePercent]);

  return (
    <div className="card">
      <div className="paneHeader">
        <div className="kicker">{isZh ? "个人空间" : "Personal space"}</div>
        <h3 className="cardTitleSerif">
          {model === "personal_first"
            ? isZh ? "先留出各自够用的钱" : "Set aside personal room"
            : isZh ? "每月个人可支配金额" : "Monthly personal space"}
        </h3>
        <div className="muted">
          {model === "personal_first"
            ? isZh
              ? "先确定每个人需要留下多少钱。下一步会检查共同支出是否还能覆盖。"
              : "Start with the personal room each person needs. Next, we'll check whether shared expenses are still covered."
            : model === "proportional"
              ? isZh
                ? "选择一个储蓄比例。每个人先从自己的收入里留下这个比例，再安排共同目标。"
                : "Choose one savings percentage. Each person keeps that percentage of their own income before shared goals."
              : isZh
                ? "这是每个人每月自己留用的钱，让共同钱和个人钱分得更清楚。"
                : "This is money each of you keeps for yourselves each month so shared money and personal money stay clear."}
        </div>
      </div>

      <div className="availabilityNote">
        <span>{isZh ? "这一步可分配金额" : "Available at this step"}</span>
        <strong>{fmtCurrency(availableAtPersonalStep)}</strong>
      </div>

      {model === "personal_first" ? (
        <div className="stack">
          <div className="field">
            <label>{isZh ? "个人空间设置方式" : "Personal setup method"}</label>
            <CustomSelect
              value={state.personalReserveMode}
              onChange={(value) =>
                setState((prev) => ({
                  ...prev,
                  personalReserveMode: value as "fixed" | "income" | "custom",
                }))
              }
              options={[
                { value: "fixed", label: isZh ? "分别填写每个人的固定金额" : "Set fixed amount for each person" },
                { value: "income", label: isZh ? "把总金额按收入比例分配" : "Split combined amount based on income ratio" },
                { value: "custom", label: isZh ? "把总金额按自定义比例分配" : "Split combined amount by custom ratio" },
              ]}
            />
          </div>

          {state.personalReserveMode === "fixed" ? (
            <div className="twoCol">
              <div className="field">
                <label>{isZh ? `${state.names.a} 的个人空间` : `${state.names.a}'s personal reserve`}</label>
                <input
                  type="number"
                  step={100}
                  value={state.fixedReserve.a}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      fixedReserve: { ...prev.fixedReserve, a: Number(e.target.value || 0) },
                    }))
                  }
                />
              </div>

              <div className="field">
                <label>{isZh ? `${state.names.b} 的个人空间` : `${state.names.b}'s personal reserve`}</label>
                <input
                  type="number"
                  step={100}
                  value={state.fixedReserve.b}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      fixedReserve: { ...prev.fixedReserve, b: Number(e.target.value || 0) },
                    }))
                  }
                />
              </div>
            </div>
          ) : (
            <>
              <div className="field">
                <label>{isZh ? "两个人合计的个人空间" : "Combined monthly personal amount"}</label>
                <input
                  type="number"
                  step={100}
                  value={state.personalTotal}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      personalTotal: Number(e.target.value || 0),
                    }))
                  }
                />
                <div className="helperText" style={{ marginTop: 8 }}>
                  {isZh ? "还能覆盖共同支出的最高金额：" : "Maximum that still covers shared expenses:"}{" "}
                  <strong>{fmtCurrency(maxPersonalForPersonalFirst)}</strong>
                </div>
              </div>

              {state.personalReserveMode === "income" ? (
                <div className="helperText">
                  {isZh ? "收入比例预览：" : "Income ratio preview:"} <strong>{incomeRatio}% / {100 - incomeRatio}%</strong>
                </div>
              ) : (
                <div className="inlineRow" style={{ flexWrap: "wrap" }}>
                  <span style={{ minWidth: 120, color: "var(--pink-deep)", fontWeight: 700 }}>
                    {isZh ? `${state.names.a} 的比例` : `${state.names.a}'s share`}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={state.personalRatio}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        personalRatio: Number(e.target.value || 0),
                      }))
                    }
                  />
                  <span className="splitPill">{state.personalRatio}% / {100 - state.personalRatio}%</span>
                </div>
              )}
            </>
          )}

          {state.personalReserveMode === "fixed" ? (
            <div className="helperText">
              {isZh ? "还能覆盖共同支出的个人空间合计上限：" : "Maximum combined personal room that still covers shared expenses:"}{" "}
              <strong>{fmtCurrency(maxPersonalForPersonalFirst)}</strong>
            </div>
          ) : null}

          {isOverPersonalLimit ? (
            <div className="errorBox">
              {isZh
                ? `当前个人空间比安全上限多 ${fmtCurrency(personal.total - maxPersonalForPersonalFirst)}，计划可能无法完全覆盖共同支出。`
                : `Your personal space is ${fmtCurrency(personal.total - maxPersonalForPersonalFirst)} over the safe maximum. The plan will not fully cover monthly shared expenses.`}
            </div>
          ) : null}
        </div>
      ) : model === "proportional" ? (
        <div className="stack">
          <div className="field">
            <label>{isZh ? "个人储蓄比例" : "Personal savings percentage"}</label>
            <div className="rangeControl">
              <input
                type="range"
                min={0}
                max={maxIncomeSavingsPercent}
                step={1}
                value={state.personalIncomePercent}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    personalIncomePercent: Number(e.target.value || 0),
                  }))
                }
              />
              <strong>{state.personalIncomePercent}%</strong>
            </div>
            <div className="helperText" style={{ marginTop: 8 }}>
              {isZh ? "每个人从自己的收入里留下这个比例。" : "Each person saves this percentage of their own income."}
            </div>
            <div className="helperText" style={{ marginTop: 4 }}>
              {isZh ? "安排共同目标前的最高比例：" : "Maximum before shared goals:"}{" "}
              <strong>{maxIncomeSavingsPercent}%</strong>
            </div>
          </div>

          {isIncomePercentTooHigh ? (
            <div className="errorBox">
              {isZh
                ? `${state.personalIncomePercent}% 超过当前收入和共同支出能支持的范围。请降低比例，或先减少共同支出。`
                : `${state.personalIncomePercent}% is above what the current income and shared expenses can safely support. Lower the percentage or reduce shared expenses before funding shared goals.`}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="stack">
          <div className="field">
            <label>{isZh ? "两个人合计的个人空间" : "Combined monthly personal space"}</label>
            <input
              type="number"
              step={100}
              value={state.personalTotal}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  personalTotal: Number(e.target.value || 0),
                }))
              }
            />
          </div>

          <div className="inlineRow" style={{ flexWrap: "wrap" }}>
            <span style={{ minWidth: 120, color: "var(--pink-deep)", fontWeight: 700 }}>
              {isZh ? `${state.names.a} 的比例` : `${state.names.a}'s share`}
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={state.personalRatio}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  personalRatio: Number(e.target.value || 0),
                }))
              }
            />
            <span className="splitPill">{state.personalRatio}% / {100 - state.personalRatio}%</span>
          </div>

          <div className="field">
            <label>{isZh ? "个人空间从哪里扣" : "When to deduct personal space"}</label>
            <CustomSelect
              value={state.personalMode}
              onChange={(value) =>
                setState((prev) => ({
                  ...prev,
                  personalMode: value as "p1" | "split",
                }))
              }
              options={[
                { value: "p1", label: isZh ? "只从第一笔工资扣" : "From first paycheck only" },
                { value: "split", label: isZh ? "平均分摊到所有工资" : "Split evenly across all paychecks" },
              ]}
            />
          </div>
        </div>
      )}

      <div className="metricBar" style={{ marginTop: 16 }}>
        <div>
          <div className="kicker" style={{ marginBottom: 4 }}>
            {model === "personal_first"
              ? isZh ? "已预留个人空间" : "Personal room reserved"
              : isZh ? "个人空间合计" : "Personal space total"}
          </div>
          <div className="helperText">
            {state.names.a}: {fmtCurrency(personal.a)} · {state.names.b}: {fmtCurrency(personal.b)}
          </div>
        </div>
        <strong>{fmtCurrency(personal.total)}</strong>
      </div>
    </div>
  );
}
