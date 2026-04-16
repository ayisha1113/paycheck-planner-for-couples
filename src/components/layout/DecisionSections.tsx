import type { Language } from "../../lib/i18n";
import PaycheckPlannerDemo from "./PaycheckPlannerDemo";

type Props = {
  language: Language;
};

export default function DecisionSections({ language }: Props) {
  const isZh = language === "zh";

  return (
    <section className="pain-section reveal-on-scroll">
      <div className="section-inner pain-inner">
        <div className="pain-content">
          <span className="section-eyebrow">{isZh ? "难点不只是算术" : "IT'S NOT JUST MATH"}</span>
          <h2 className="section-heading">
            {isZh ? "为什么两个人谈钱，总是比想象中麻烦" : "Why this feels harder than it should"}
          </h2>
          <div className="pain-copy">
            <p>{isZh ? "因为这不只是加减法。" : "Because it's not just math."}</p>
            <p>{isZh ? "它还关系到：" : "It's:"}</p>
            <div className="pain-lines">
              <span>{isZh ? "“这样分公平吗？”" : "\"Is this fair?\""}</span>
              <span>{isZh ? "“我们存钱进度还好吗？”" : "\"Are we on track?\""}</span>
              <span>{isZh ? "“为什么每个月都要重新讨论？”" : "\"Why do we keep rethinking this?\""}</span>
            </div>
          </div>
        </div>

        <PaycheckPlannerDemo language={language} />
      </div>
    </section>
  );
}
