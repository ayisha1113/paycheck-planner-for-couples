import type { Dispatch, SetStateAction } from "react";
import { useEffect } from "react";
import CustomSelect from "../common/CustomSelect";
import { fmtCurrency } from "../../lib/format";
import { getIncomeRatio, getPersonalAmounts, totalExpenses, totalIncome } from "../../lib/plannerMath";
import type { BuilderState, ModelKey } from "../../types/planner";

type Props = {
  model: ModelKey;
  state: BuilderState;
  setState: Dispatch<SetStateAction<BuilderState>>;
};

export default function PersonalSection({ model, state, setState }: Props) {
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
        <div className="kicker">Personal space</div>
        <h3 className="cardTitleSerif">
          {model === "personal_first" ? "Set aside personal room" : "Monthly personal space"}
        </h3>
        <div className="muted">
          {model === "personal_first"
            ? "Start with the personal room each person needs. Next, we’ll check whether shared expenses are still covered."
            : model === "proportional"
              ? "Choose one savings percentage. Each person keeps that percentage of their own income before shared goals."
            : "This is money each of you keeps for yourselves each month so shared money and personal money stay clear."}
        </div>
      </div>

      <div className="availabilityNote">
        <span>Available at this step</span>
        <strong>{fmtCurrency(availableAtPersonalStep)}</strong>
      </div>

      {model === "personal_first" ? (
        <div className="stack">
          <div className="field">
            <label>Personal setup method</label>
            <CustomSelect
              value={state.personalReserveMode}
              onChange={(value) =>
                setState((prev) => ({
                  ...prev,
                  personalReserveMode: value as "fixed" | "income" | "custom",
                }))
              }
              options={[
                { value: "fixed", label: "Set fixed amount for each person" },
                { value: "income", label: "Split combined amount based on income ratio" },
                { value: "custom", label: "Split combined amount by custom ratio" },
              ]}
            />
          </div>

          {state.personalReserveMode === "fixed" ? (
            <div className="twoCol">
              <div className="field">
                <label>{state.names.a}'s personal reserve</label>
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
                <label>{state.names.b}'s personal reserve</label>
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
                <label>Combined monthly personal amount</label>
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
                  Maximum that still covers shared expenses:{" "}
                  <strong>{fmtCurrency(maxPersonalForPersonalFirst)}</strong>
                </div>
              </div>

              {state.personalReserveMode === "income" ? (
                <div className="helperText">
                  Income ratio preview: <strong>{incomeRatio}% / {100 - incomeRatio}%</strong>
                </div>
              ) : (
                <div className="inlineRow" style={{ flexWrap: "wrap" }}>
                  <span style={{ minWidth: 120, color: "var(--pink-deep)", fontWeight: 700 }}>
                    {state.names.a}'s share
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
              Maximum combined personal room that still covers shared expenses:{" "}
              <strong>{fmtCurrency(maxPersonalForPersonalFirst)}</strong>
            </div>
          ) : null}

          {isOverPersonalLimit ? (
            <div className="errorBox">
              Your personal space is {fmtCurrency(personal.total - maxPersonalForPersonalFirst)} over the safe maximum.
              The plan will not fully cover monthly shared expenses.
            </div>
          ) : null}
        </div>
      ) : model === "proportional" ? (
        <div className="stack">
          <div className="field">
            <label>Personal savings percentage</label>
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
              Each person saves this percentage of their own income.
            </div>
            <div className="helperText" style={{ marginTop: 4 }}>
              Maximum before shared goals:{" "}
              <strong>{maxIncomeSavingsPercent}%</strong>
            </div>
          </div>

          {isIncomePercentTooHigh ? (
            <div className="errorBox">
              {state.personalIncomePercent}% is above what the current income and shared expenses can safely support.
              Lower the percentage or reduce shared expenses before funding shared goals.
            </div>
          ) : null}
        </div>
      ) : (
        <div className="stack">
          <div className="field">
            <label>Combined monthly personal space</label>
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
              {state.names.a}'s share
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
            <label>When to deduct personal space</label>
            <CustomSelect
              value={state.personalMode}
              onChange={(value) =>
                setState((prev) => ({
                  ...prev,
                  personalMode: value as "p1" | "split",
                }))
              }
              options={[
                { value: "p1", label: "From first paycheck only" },
                { value: "split", label: "Split evenly across all paychecks" },
              ]}
            />
          </div>
        </div>
      )}

      <div className="metricBar" style={{ marginTop: 16 }}>
        <div>
          <div className="kicker" style={{ marginBottom: 4 }}>
            {model === "personal_first" ? "Personal room reserved" : "Personal space total"}
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
