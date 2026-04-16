import type { Language } from "../../lib/i18n";

type PreviewSectionProps = {
  language: Language;
  onBuild: () => void;
};

export default function PreviewSection({ language, onBuild }: PreviewSectionProps) {
  const isZh = language === "zh";

  return (
    <section className="preview-section reveal-on-scroll">
      <div className="section-inner">
        <span className="section-eyebrow">{isZh ? "你会得到什么" : "What you'll get"}</span>
        <h2 className="section-heading">
          {isZh ? (
            <>
              一份每个月都能照着做的
              <br />
              发薪计划。
            </>
          ) : (
            <>
              A clear plan you can follow without
              <br />
              rethinking everything every month.
            </>
          )}
        </h2>

        <div className="preview-card">
          <div>
            <span className="preview-label">{isZh ? "月度计划示例" : "Example monthly plan"}</span>

            <div className="preview-block">
              <div className="preview-block-head">
                <div className="preview-dot pd-a" />
                {isZh ? "小林 - 第 1 笔工资" : "Emma - Paycheck 1"}
              </div>
              <div className="preview-step ps-keep">
                <span className="ps-label">{isZh ? "留作个人可支配" : "Keep for personal spending"}</span>
                <span className="ps-amt">$800</span>
              </div>
              <div className="preview-step ps-xfer">
                <span className="ps-label">{isZh ? "-> 转入共同支出账户" : "-> Transfer to Shared Expense Account"}</span>
                <span className="ps-amt">$1,700</span>
              </div>
            </div>

            <div className="preview-block">
              <div className="preview-block-head">
                <div className="preview-dot pd-b" />
                {isZh ? "小周 - 第 1 笔工资" : "James - Paycheck 1"}
              </div>
              <div className="preview-step ps-keep">
                <span className="ps-label">{isZh ? "留作个人可支配" : "Keep for personal spending"}</span>
                <span className="ps-amt">$1,200</span>
              </div>
              <div className="preview-step ps-xfer">
                <span className="ps-label">{isZh ? "-> 转入共同支出账户" : "-> Transfer to Shared Expense Account"}</span>
                <span className="ps-amt">$1,800</span>
              </div>
            </div>

            <div className="preview-block">
              <div className="preview-block-head">
                <div className="preview-dot pd-b" />
                {isZh ? "小周 - 第 2 笔工资" : "James - Paycheck 2"}
              </div>
              <div className="preview-step ps-xfer">
                <span className="ps-label">{isZh ? "-> 转入共同备用金" : "-> Transfer to Shared Buffer"}</span>
                <span className="ps-amt">$500</span>
              </div>
              <div className="preview-step ps-xfer">
                <span className="ps-label">{isZh ? "-> 转入共同储蓄" : "-> Transfer to Joint Savings"}</span>
                <span className="ps-amt">$1,500</span>
              </div>
            </div>
          </div>

          <div className="preview-right">
            <h3>{isZh ? "2 分钟内生成你们的计划。" : "Your plan, ready in under 2 minutes."}</h3>
            <p>
              {isZh
                ? "填入工资、共同支出和想存的钱，我们会帮你算出每笔工资该留多少、转多少、存到哪里。"
                : "Enter your paychecks, your shared expenses, and where you want your money to go. We handle the math and give you a step-by-step transfer guide you can actually follow."}
            </p>
            <ul className="preview-items">
              <li>{isZh ? "每笔工资具体怎么处理" : "Exactly what to do with each paycheck"}</li>
              <li>{isZh ? "该留、该转、该存的金额" : "How much to keep, move, and save"}</li>
              <li>{isZh ? "共同账户和个人空间都安排清楚" : "A plan for both shared and personal money"}</li>
              <li>{isZh ? "可以马上照着执行的步骤" : "Clear steps you can follow right away"}</li>
            </ul>
            <button className="preview-cta" onClick={onBuild}>
              {isZh ? "开始做计划" : "Build My Plan"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
