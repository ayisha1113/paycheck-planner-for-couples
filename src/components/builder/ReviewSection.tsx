import { fmtCurrency } from "../../lib/format";
import type { Language } from "../../lib/i18n";
import { getPersonalAmounts, getSharedSplit, totalExpenses, totalIncome } from "../../lib/plannerMath";
import type { BuilderState, ModelKey } from "../../types/planner";

type Props = {
  language: Language;
  model: ModelKey;
  state: BuilderState;
};

export default function ReviewSection({ language, model, state }: Props) {
  const isZh = language === "zh";
  const expenseTotal = totalExpenses(state);
  const income = totalIncome(state);
  const personal = getPersonalAmounts(model, state);
  const split = getSharedSplit(model, state, expenseTotal, language);

  return (
    <div className="card">
      <div className="paneHeader">
        <div className="kicker">{isZh ? "确认" : "Review"}</div>
        <h3 className="cardTitleSerif">{isZh ? "可以生成你们的计划了" : "Ready to generate your plan"}</h3>
        <div className="muted">
          {isZh
            ? "确认一下当前设置，然后生成一份月度执行指南。"
            : "Review your setup, then generate a monthly guide based on your selected money model."}
        </div>
      </div>

      <div className="stack">
        <div className="rowCard">
          <div className="inlineRow" style={{ justifyContent: "space-between" }}>
            <span>{isZh ? "总收入" : "Total income"}</span>
            <strong>{fmtCurrency(income)}</strong>
          </div>
        </div>

        <div className="rowCard">
          <div className="inlineRow" style={{ justifyContent: "space-between" }}>
            <span>{isZh ? "共同支出目标" : "Shared expense target"}</span>
            <strong>{fmtCurrency(expenseTotal)}</strong>
          </div>
          <div className="helperText">{split.label}</div>
        </div>

        <div className="rowCard">
          <div className="inlineRow" style={{ justifyContent: "space-between" }}>
            <span>
              {model === "proportional"
                ? isZh ? "个人储蓄" : "Personal savings"
                : isZh ? "个人空间" : "Personal space"}
            </span>
            <strong>{fmtCurrency(personal.total)}</strong>
          </div>
          <div className="helperText">
            {state.names.a}: {fmtCurrency(personal.a)} · {state.names.b}: {fmtCurrency(personal.b)}
          </div>
        </div>

        <div className="rowCard">
          <div className="inlineRow" style={{ justifyContent: "space-between" }}>
            <span>{isZh ? "资金去向账户" : "Funding accounts"}</span>
            <strong>{isZh ? `${state.accounts.length + 1} 个账户` : `${state.accounts.length + 1} accounts`}</strong>
          </div>

          <div className="stack" style={{ marginTop: 8 }}>
            <div className="helperText">
              {isZh ? "共同支出账户" : "Shared Expense Account"} · {isZh ? "优先级 1" : "Priority 1"} · {fmtCurrency(expenseTotal)}
            </div>
            {state.accounts.map((account, idx) => (
              <div className="helperText" key={account.id}>
                {account.name || (isZh ? `账户 ${idx + 2}` : `Account ${idx + 2}`)} · {isZh ? `优先级 ${idx + 2}` : `Priority ${idx + 2}`} · {account.sweep ? (isZh ? "剩余全部" : "Remaining") : fmtCurrency(account.target)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
