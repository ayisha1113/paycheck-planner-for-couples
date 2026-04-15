import { useEffect, useMemo, useRef, useState } from "react";
import BuilderShell from "./components/builder/BuilderShell";
import DecisionSections from "./components/layout/DecisionSections";
import Hero from "./components/layout/Hero";
import Nav from "./components/layout/Nav";
import PreviewSection from "./components/layout/PreviewSection";
import PlanOutput from "./components/plan/PlanOutput";
import { MODEL_COPY } from "./data/modelCopy";
import { createInitialState } from "./data/sampleData";
import { buildPlan } from "./lib/plannerMath";
import { getSharedPlanFromUrl } from "./lib/shareTools";
import type { BuilderState, ModelKey } from "./types/planner";

export default function App() {
  const sharedPlan = useMemo(() => getSharedPlanFromUrl(), []);
  const [model, setModel] = useState<ModelKey | null>(sharedPlan?.model ?? null);
  const [state, setState] = useState<BuilderState>(sharedPlan?.state ?? createInitialState);
  const [step, setStep] = useState(0);
  const [showPlan, setShowPlan] = useState(Boolean(sharedPlan));
  const builderRef = useRef<HTMLElement | null>(null);

  const effectiveModel = model ?? "shared_first";
  const plan = useMemo(() => buildPlan(effectiveModel, state), [effectiveModel, state]);
  const copy = model ? MODEL_COPY[model] : null;

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
    setState(createInitialState());
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
      <Nav onBuild={handleBuild} />

      {!showPlan ? (
        <>
          <Hero onSample={handleLoadSample} onBuild={handleBuild} />
          <PreviewSection onBuild={handleBuild} />
          <DecisionSections />

          <section className="builder-section reveal-on-scroll" id="builder" ref={builderRef}>
            <div className="builder-inner">
              <div className="builder-intro">
                <span className="section-eyebrow">BUILD YOUR PLAN</span>
                <h2 className="section-heading" style={{ marginBottom: 8 }}>
                  {model ? copy?.setupTitle : "Your monthly money plan starts here."}
                </h2>
                <p className="builder-intro-copy">
                  {model
                    ? copy?.setupDesc
                    : "Start with the option that feels closest. The setup will adapt from there, and you can change it later."}
                </p>
              </div>

              <BuilderShell
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
              <h2 className="section-heading">Make your next paycheck simple</h2>
              <p>No spreadsheets. No stress. No second-guessing.</p>
              <button className="btn-hero-primary" onClick={handleBuild}>
                Start here
              </button>
            </div>
          </section>
        </>
      ) : (
        <PlanOutput plan={plan} state={state} model={effectiveModel} onEdit={() => setShowPlan(false)} />
      )}

      <footer className="footer">
        <strong>Paycheck Planner</strong> · A simple shared money planning tool for couples · All calculations run locally — no data is stored or sent anywhere.
      </footer>
    </div>
  );
}
