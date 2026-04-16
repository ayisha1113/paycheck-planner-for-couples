import type { Dispatch, SetStateAction } from "react";
import { fmtCurrency } from "../../lib/format";
import type { Language } from "../../lib/i18n";
import { totalIncome } from "../../lib/plannerMath";
import type { BuilderState, PersonKey } from "../../types/planner";

type Props = {
  language: Language;
  state: BuilderState;
  setState: Dispatch<SetStateAction<BuilderState>>;
};

export default function PaychecksSection({ language, state, setState }: Props) {
  const isZh = language === "zh";

  const updateAmount = (who: PersonKey, idx: number, amount: number) => {
    setState((prev) => ({
      ...prev,
      paychecks: {
        ...prev.paychecks,
        [who]: prev.paychecks[who].map((paycheck, i) =>
          i === idx ? { ...paycheck, amount } : paycheck,
        ),
      },
    }));
  };

  const addPaycheck = (who: PersonKey) => {
    setState((prev) => ({
      ...prev,
      paychecks: {
        ...prev.paychecks,
        [who]: [
          ...prev.paychecks[who],
          {
            id: Date.now() + Math.floor(Math.random() * 1000),
            amount: who === "a" ? 2500 : 3000,
          },
        ],
      },
    }));
  };

  const removePaycheck = (who: PersonKey) => {
    setState((prev) => ({
      ...prev,
      paychecks: {
        ...prev.paychecks,
        [who]:
          prev.paychecks[who].length > 1
            ? prev.paychecks[who].slice(0, -1)
            : prev.paychecks[who],
      },
    }));
  };

  return (
    <div className="stack">
      <div className="twoCol">
        {(["a", "b"] as PersonKey[]).map((who) => (
          <div key={who} className="card">
            <div className="kicker">{who === "a" ? (isZh ? "第一个人" : "Person A") : (isZh ? "第二个人" : "Person B")}</div>

            <div className="field">
              <label>{isZh ? "名字" : "Name"}</label>
              <input
                value={state.names[who]}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    names: { ...prev.names, [who]: e.target.value },
                  }))
                }
              />
            </div>

            <div className="stack" style={{ marginTop: 12 }}>
              {state.paychecks[who].map((paycheck, idx) => (
                <div key={paycheck.id} className="field">
                  <label>{isZh ? `第 ${idx + 1} 笔工资` : `Paycheck ${idx + 1}`}</label>
                  <input
                    type="number"
                    step={100}
                    value={paycheck.amount}
                    onChange={(e) =>
                      updateAmount(who, idx, Number(e.target.value || 0))
                    }
                  />
                </div>
              ))}
            </div>

            <div className="inlineRow" style={{ marginTop: 12, flexWrap: "wrap" }}>
              <button className="ghostBtn" onClick={() => addPaycheck(who)}>
                {isZh ? "+ 添加一笔工资" : "+ Add paycheck"}
              </button>
              <button className="dangerBtn" onClick={() => removePaycheck(who)}>
                {isZh ? "删除最后一笔" : "Remove last"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="metricBar">
        <div>
          <div className="kicker" style={{ marginBottom: 4 }}>
            {isZh ? "本月总收入" : "Total income this month"}
          </div>
          <div className="helperText">
            {isZh ? "两个人本月所有到手工资合计" : "Combined take-home across both people and all paychecks"}
          </div>
        </div>
        <strong>{fmtCurrency(totalIncome(state))}</strong>
      </div>
    </div>
  );
}
