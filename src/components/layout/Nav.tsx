import { languageLabels, type Language } from "../../lib/i18n";

type NavProps = {
  language: Language;
  onLanguageChange: (language: Language) => void;
  onBuild: () => void;
};

export default function Nav({ language, onLanguageChange, onBuild }: NavProps) {
  const isZh = language === "zh";

  return (
    <nav className="nav">
      <div className="nav-logo">
        <div className="nav-mark">♡</div>
        <span className="nav-name">{isZh ? "双人发薪规划器" : "Paycheck Planner"}</span>
        <span className="nav-badge">{isZh ? "伴侣版" : "For Couples"}</span>
      </div>
      <div className="nav-actions">
        <div className="language-toggle" aria-label={isZh ? "切换语言" : "Change language"}>
          {(["en", "zh"] as Language[]).map((item) => (
            <button
              key={item}
              type="button"
              className={language === item ? "active" : ""}
              onClick={() => onLanguageChange(item)}
            >
              {languageLabels[item]}
            </button>
          ))}
        </div>
        <button className="nav-cta" onClick={onBuild}>
          {isZh ? "开始规划" : "Build My Plan"}
        </button>
      </div>
    </nav>
  );
}
