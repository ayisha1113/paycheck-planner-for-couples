import type { Dispatch, SetStateAction } from "react";
import { fmtCurrency } from "../../lib/format";
import { getPersonalAmounts, totalExpenses, totalIncome } from "../../lib/plannerMath";
import type { BuilderState, ModelKey } from "../../types/planner";

type Props = {
  model: ModelKey;
  state: BuilderState;
  setState: Dispatch<SetStateAction<BuilderState>>;
};

export default function AccountsSection({ model, state, setState }: Props) {
  const income = totalIncome(state);
  const expenses = totalExpenses(state);
  const personal = getPersonalAmounts(model, state);
  const availableAtSharedGoalsStep = Math.max(
    0,
    income - expenses - personal.total,
  );

  return (
    <div className="card">
      <div className="paneHeader">
        <div className="kicker">Shared goals</div>
        <h3 className="cardTitleSerif">Where money goes next</h3>
        <div className="muted">
          After the core rules of your selected model are applied, the rest of
          your money can flow into shared goals in priority order.
        </div>
      </div>

      <div className="availabilityNote">
        <span>Available at this step</span>
        <strong>{fmtCurrency(availableAtSharedGoalsStep)}</strong>
      </div>

      <div className="stack">
        <div className="rowCard" style={{ opacity: 0.75 }}>
          <div className="inlineRow priorityRow">
            <span className="modelTag">Priority 1</span>
            <strong>Shared Expense Account</strong>
          </div>
        </div>

        {state.accounts.map((account, idx) => (
          <div key={account.id} className="rowCard">
            <div className="twoCol">
              <div className="field">
                <label>Account name</label>
                <input
                  value={account.name}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      accounts: prev.accounts.map((item, i) =>
                        i === idx ? { ...item, name: e.target.value } : item,
                      ),
                    }))
                  }
                />
              </div>

              <div className="field">
                <label>Monthly target</label>
                <input
                  type="number"
                  step={100}
                  disabled={account.sweep}
                  className="accountTargetInput"
                  placeholder={account.sweep ? "Remaining" : ""}
                  value={account.sweep ? "" : account.target}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      accounts: prev.accounts.map((item, i) =>
                        i === idx ? { ...item, target: Number(e.target.value || 0) } : item,
                      ),
                    }))
                  }
                />
                {account.sweep ? (
                  <div className="helperText" style={{ marginTop: 8 }}>
                    This account receives all remaining money.
                  </div>
                ) : null}
              </div>
            </div>

            <div className="inlineRow" style={{ flexWrap: "wrap" }}>
              <span className="modelTag">Priority {idx + 2}</span>

              {idx === 0 ? (
                <label className="toggleRow" style={{ flex: 1 }}>
                  <input
                    type="checkbox"
                    checked={account.partial}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        accounts: prev.accounts.map((item, i) =>
                          i === idx ? { ...item, partial: e.target.checked } : item,
                        ),
                      }))
                    }
                  />
                  <span className="helperText">Allow partial fund</span>
                </label>
              ) : null}

              {idx === state.accounts.length - 1 ? (
                <label className="toggleRow" style={{ flex: 1 }}>
                  <input
                    type="checkbox"
                    checked={account.sweep}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        accounts: prev.accounts.map((item, i) => ({
                          ...item,
                          sweep: i === idx ? e.target.checked : false,
                        })),
                      }))
                    }
                  />
                  <span className="helperText">Send all remaining money here</span>
                </label>
              ) : null}
            </div>

            <div>
              <button
                className="dangerBtn"
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    accounts: prev.accounts.filter((_, i) => i !== idx),
                  }))
                }
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12 }}>
        <button
          className="ghostBtn"
          onClick={() =>
            setState((prev) => ({
              ...prev,
              accounts: [
                ...prev.accounts.map((account) => ({ ...account, sweep: false })),
                {
                  id: Date.now() + Math.floor(Math.random() * 1000),
                  name: "",
                  target: 0,
                  partial: false,
                  sweep: true,
                },
              ],
            }))
          }
        >
          + Add savings account
        </button>
      </div>
    </div>
  );
}
