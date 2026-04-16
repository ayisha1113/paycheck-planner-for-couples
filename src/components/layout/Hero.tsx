import type { Language } from "../../lib/i18n";

type HeroProps = {
  language: Language;
  onSample: () => void;
  onBuild: () => void;
};

export default function Hero({ language, onSample, onBuild }: HeroProps) {
  const isZh = language === "zh";

  return (
    <section className="hero">
      <div className="hero-inner">
        <span className="hero-eyebrow">
          {isZh ? "给两个人一起用的发薪规划器" : "A simple paycheck planner for couples"}
        </span>
        <h1>
          {isZh ? (
            <>
              每一笔工资，
              <br />
              下一步怎么用都清楚。
            </>
          ) : (
            <>
              Know exactly what to do
              <br />
              with <em>every paycheck.</em>
            </>
          )}
        </h1>
        <p className="hero-sub">
          {isZh ? (
            <>
              共同账单、个人空间、储蓄目标，
              <br />
              一次算明白。
            </>
          ) : (
            <>
              Clear. Fair.
              <br />
              And one less thing to think about every month.
            </>
          )}
        </p>
        <div className="hero-actions">
          <button className="btn-hero-primary" onClick={onBuild}>
            {isZh ? "开始做计划" : "Build My Plan"}
          </button>
          <button className="btn-hero-secondary" onClick={onSample}>
            {isZh ? "用示例试试看" : "Try with Sample Data"}
          </button>
        </div>
        <p className="hero-privacy">
          {isZh
            ? "所有计算都在你的设备上完成，不会保存或上传你的数据。"
            : "All calculations happen locally on your device. No data is stored or shared."}
        </p>
      </div>
    </section>
  );
}
