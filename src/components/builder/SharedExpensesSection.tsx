import type { Dispatch, SetStateAction } from "react";
import CustomSelect from "../common/CustomSelect";
import { fmtCurrency } from "../../lib/format";
import { getPersonalAmounts, getSharedSplit, totalExpenses, totalIncome } from "../../lib/plannerMath";
import type { BuilderState, ModelKey } from "../../types/planner";

type Props = {
  model: ModelKey;
  state: BuilderState;
  setState: Dispatch<SetStateAction<BuilderState>>;
};

export default function SharedExpensesSection({ model, state, setState }: Props) {
  const expenseTotal = totalExpenses(state);
  const income = totalIncome(state);
  const personal = getPersonalAmounts(model, state);
  const split = getSharedSplit(model, state, expenseTotal);
  const sharedShortfallAfterPersonal = Math.max(0, expenseTotal - Math.max(0, income - personal.total));

  return (
    <div className="card">
      <div className="paneHeader">
        <div className="kicker">{model === "proportional" ? "Shared setup" : "Shared expenses"}</div>
        <h3 className="cardTitleSerif">Monthly shared expenses</h3>
        <div className="muted">
          Everything you both pay together — rent, groceries, insurance,
          utilities, transportation, and other joint costs.
        </div>
      </div>

      <div className="stack">
        {state.expenses.map((expense, idx) => (
          <div key={expense.id} className="rowCard">
            <div className="twoCol">
              <div className="field">
                <label>Expense name</label>
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
                <label>Amount</label>
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
                Remove
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
          + Add expense
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
          Use one total instead of adding every shared expense
        </span>
        {state.expenseOverrideEnabled ? (
          <input
            type="number"
            step={100}
            className="numberInput overrideInput"
            placeholder="Estimated total"
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
        Choose this if you only know an estimate, or if you want to replace
        the itemized total with a final monthly amount.
      </div>

      {model === "proportional" ? (
        <div className="card" style={{ marginTop: 16, padding: 18 }}>
          <div className="kicker">Shared split rule</div>

          <div className="stack">
            <div className="field">
              <label>Split method</label>
              <CustomSelect
                value={state.sharedRatioMode}
                onChange={(value) =>
                  setState((prev) => ({
                    ...prev,
                    sharedRatioMode: value as "income" | "custom",
                  }))
                }
                options={[
                  { value: "income", label: "Based on income" },
                  { value: "custom", label: "Use a custom ratio" },
                ]}
              />
            </div>

            {state.sharedRatioMode === "income" ? (
              <div className="helperText">
                Auto-calculated ratio preview: <strong>{split.ratio}% / {100 - split.ratio}%</strong>
              </div>
            ) : (
              <>
                <div className="inlineRow" style={{ flexWrap: "wrap" }}>
                  <span style={{ minWidth: 120, color: "var(--pink-deep)", fontWeight: 700 }}>
                    {state.names.a}'s share
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
                  We’ll aim to keep the overall split close to this ratio while
                  keeping the plan readable and practical.
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}

      <div className="metricBar" style={{ marginTop: 16 }}>
        <div>
          <div className="kicker" style={{ marginBottom: 4 }}>
            Total shared expenses
          </div>
          <div className="helperText">{split.label}</div>
        </div>
        <strong>{fmtCurrency(expenseTotal)}</strong>
      </div>

      {model === "personal_first" && sharedShortfallAfterPersonal > 0 ? (
        <div className="errorBox" style={{ marginTop: 12 }}>
          Reduce personal space by at least {fmtCurrency(sharedShortfallAfterPersonal)} to cover shared expenses.
        </div>
      ) : null}
    </div>
  );
}
