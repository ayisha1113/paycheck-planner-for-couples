import { fmtCurrency } from "../../lib/format";
import { getPersonalAmounts, getSharedSplit, totalExpenses, totalIncome } from "../../lib/plannerMath";
import type { BuilderState, ModelKey } from "../../types/planner";

type Props = {
  model: ModelKey;
  state: BuilderState;
};

export default function ReviewSection({ model, state }: Props) {
  const expenseTotal = totalExpenses(state);
  const income = totalIncome(state);
  const personal = getPersonalAmounts(model, state);
  const split = getSharedSplit(model, state, expenseTotal);

  return (
    <div className="card">
      <div className="paneHeader">
        <div className="kicker">Review</div>
        <h3 className="cardTitleSerif">Ready to generate your plan</h3>
        <div className="muted">
          Review your setup, then generate a monthly guide based on your
          selected money model.
        </div>
      </div>

      <div className="stack">
        <div className="rowCard">
          <div className="inlineRow" style={{ justifyContent: "space-between" }}>
            <span>Total income</span>
            <strong>{fmtCurrency(income)}</strong>
          </div>
        </div>

        <div className="rowCard">
          <div className="inlineRow" style={{ justifyContent: "space-between" }}>
            <span>Shared expense target</span>
            <strong>{fmtCurrency(expenseTotal)}</strong>
          </div>
          <div className="helperText">{split.label}</div>
        </div>

        <div className="rowCard">
          <div className="inlineRow" style={{ justifyContent: "space-between" }}>
            <span>
              {model === "personal_first"
                ? "Personal space"
                : model === "proportional"
                  ? "Personal savings"
                  : "Personal space"}
            </span>
            <strong>{fmtCurrency(personal.total)}</strong>
          </div>
          <div className="helperText">
            {state.names.a}: {fmtCurrency(personal.a)} · {state.names.b}: {fmtCurrency(personal.b)}
          </div>
        </div>

        <div className="rowCard">
          <div className="inlineRow" style={{ justifyContent: "space-between" }}>
            <span>Funding accounts</span>
            <strong>{state.accounts.length + 1} accounts</strong>
          </div>

          <div className="stack" style={{ marginTop: 8 }}>
            <div className="helperText">
              Shared Expense Account · Priority 1 · {fmtCurrency(expenseTotal)}
            </div>
            {state.accounts.map((account, idx) => (
              <div className="helperText" key={account.id}>
                {account.name || `Account ${idx + 2}`} · Priority {idx + 2} · {account.sweep ? "Remaining" : fmtCurrency(account.target)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
