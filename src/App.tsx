import { useEffect, useMemo, useRef, useState } from "react";
import BuilderShell from "./components/builder/BuilderShell";
import DecisionSections from "./components/layout/DecisionSections";
import Hero from "./components/layout/Hero";
import Nav from "./components/layout/Nav";
import PreviewSection from "./components/layout/PreviewSection";
import PlanOutput from "./components/plan/PlanOutput";
import { getModelCopy } from "./data/modelCopy";
import { createInitialState } from "./data/sampleData";
import { getSavedLanguage, saveLanguage, type Language } from "./lib/i18n";
import { buildPlan } from "./lib/plannerMath";
import { getSharedPlanFromUrl } from "./lib/shareTools";
import type { BuilderState, ModelKey } from "./types/planner";

export default function App() {
  const sharedPlan = useMemo(() => getSharedPlanFromUrl(), []);
  const [language, setLanguage] = useState<Language>(() => getSavedLanguage());
  const [model, setModel] = useState<ModelKey | null>(sharedPlan?.model ?? null);
  const [state, setState] = useState<BuilderState>(() => sharedPlan?.state ?? createInitialState(language));
  const [step, setStep] = useState(0);
  const [showPlan, setShowPlan] = useState(Boolean(sharedPlan));
  const builderRef = useRef<HTMLElement | null>(null);

  const effectiveModel = model ?? "shared_first";
  const plan = useMemo(() => buildPlan(effectiveModel, state, language), [effectiveModel, language, state]);
  const modelCopy = getModelCopy(language);
  const copy = model ? modelCopy[model] : null;
  const isZh = language === "zh";

  const setAppLanguage = (nextLanguage: Language) => {
    setLanguage(nextLanguage);
    saveLanguage(nextLanguage);
  };

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(".reveal-on-scroll"));

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [showPlan]);

  const scrollToBuilder = () => {
    builderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleLoadSample = () => {
    setState(createInitialState(language));
    setShowPlan(false);
    scrollToBuilder();
  };

  const handleBuild = () => {
    setShowPlan(false);
    scrollToBuilder();
  };

  const handleSelectModel = (nextModel: ModelKey) => {
    setModel(nextModel);
    setStep(0);
    setShowPlan(false);
  };

  const handleChangeModel = () => {
    setModel(null);
    setStep(0);
    setShowPlan(false);
    scrollToBuilder();
  };

  return (
    <div className="app">
      <Nav language={language} onLanguageChange={setAppLanguage} onBuild={handleBuild} />

      {!showPlan ? (
        <>
          <Hero language={language} onSample={handleLoadSample} onBuild={handleBuild} />
          <PreviewSection language={language} onBuild={handleBuild} />
          <DecisionSections language={language} />

          <section className="builder-section reveal-on-scroll" id="builder" ref={builderRef}>
            <div className="builder-inner">
              <div className="builder-intro">
                <span className="section-eyebrow">{isZh ? "开始规划" : "BUILD YOUR PLAN"}</span>
                <h2 className="section-heading" style={{ marginBottom: 8 }}>
                  {model ? copy?.setupTitle : isZh ? "你们的月度发薪计划，从这里开始。" : "Your monthly money plan starts here."}
                </h2>
                <p className="builder-intro-copy">
                  {model
                    ? copy?.setupDesc
                    : isZh
                      ? "先选一个最接近你们相处方式的方案。后面的设置会跟着调整，之后也可以随时改。"
                      : "Start with the option that feels closest. The setup will adapt from there, and you can change it later."}
                </p>
              </div>

              <BuilderShell
                language={language}
                model={model}
                state={state}
                setState={setState}
                step={step}
                setStep={setStep}
                onSelectModel={handleSelectModel}
                onChangeModel={handleChangeModel}
                onGenerate={() => setShowPlan(true)}
              />
            </div>
          </section>

          <section className="final-cta-section reveal-on-scroll">
            <div className="section-inner final-cta-inner">
              <h2 className="section-heading">{isZh ? "让下一笔工资更好安排" : "Make your next paycheck simple"}</h2>
              <p>{isZh ? "不用表格，不用反复算，也不用每个月重新讨论一遍。" : "No spreadsheets. No stress. No second-guessing."}</p>
              <button className="btn-hero-primary" onClick={handleBuild}>
                {isZh ? "开始做计划" : "Start here"}
              </button>
            </div>
          </section>
        </>
      ) : (
        <PlanOutput language={language} plan={plan} state={state} model={effectiveModel} onEdit={() => setShowPlan(false)} />
      )}

      <footer className="footer">
        <strong>{isZh ? "双人发薪规划器" : "Paycheck Planner"}</strong>
        {" "}
        {isZh
          ? "· 给伴侣一起用的简单金钱规划工具 · 所有计算都在你的设备上完成，不会保存或上传数据。"
          : "· A simple shared money planning tool for couples · All calculations run locally - no data is stored or sent anywhere."}
      </footer>
    </div>
  );
}
