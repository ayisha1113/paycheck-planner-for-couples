import type { ModelKey } from "../types/planner";

export type ModelCopy = {
  tag: string;
  systemName: string;
  title: string;
  summary: string;
  description: string;
  bestFor: string[];
  flow: string;
  setupTitle: string;
  setupDesc: string;
};

export const MODEL_COPY: Record<ModelKey, ModelCopy> = {
  shared_first: {
    tag: "Stability Model",
    systemName: "Shared First",
    title: "Let's take care of us first - then everything else.",
    summary: "Shared bills come first.",
    description:
      "A calm place to start for most couples.",
    bestFor: [
      "Most couples can start here"
    ],
    flow: "Income → Shared expenses → Personal space → Shared goals",
    setupTitle: "Set up your monthly plan",
    setupDesc:
      "Enter your paychecks, shared expenses, and personal space. We’ll cover shared life first, then build the rest of the plan."
  },
  personal_first: {
    tag: "Autonomy Model",
    systemName: "Personal Space First",
    title: "I want to know I'm okay - before I give to us.",
    summary: "Personal money comes first.",
    description:
      "Helpful when personal boundaries around money need to feel clear.",
    bestFor: [
      "Useful when personal boundaries need to be clear"
    ],
    flow: "Income → Personal space → Shared expenses → Shared goals",
    setupTitle: "Set aside personal space first",
    setupDesc:
      "Start by deciding how much personal space each person needs. Then we’ll check what is left for shared expenses and shared goals."
  },
  proportional: {
    tag: "Fair Share Model",
    systemName: "Income-Based Split",
    title: "We don't have to be equal - just fair.",
    summary: "Split shared costs by income.",
    description:
      "Best when equal does not feel fair.",
    bestFor: [
      "Good when equal does not feel fair"
    ],
    flow: "Income → Shared split rule → Personal space → Shared goals",
    setupTitle: "Set up a more tailored shared split",
    setupDesc:
      "Choose how shared expenses should be split, then we’ll build the rest of your plan around that rule."
  }
};
