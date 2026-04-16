import type { ModelKey } from "../types/planner";
import type { Language } from "../lib/i18n";

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

export const MODEL_COPY_ZH: Record<ModelKey, ModelCopy> = {
  shared_first: {
    tag: "稳定优先",
    systemName: "先管共同开销",
    title: "先把两个人的生活安顿好，再安排各自的钱。",
    summary: "共同账单先到位。",
    description: "适合大多数伴侣作为起点，清楚、稳妥、不绕。",
    bestFor: [
      "想先把房租、日常开销这些共同支出安排清楚"
    ],
    flow: "收入 -> 共同支出 -> 个人空间 -> 共同目标",
    setupTitle: "设置你们的月度发薪计划",
    setupDesc:
      "填入两个人的工资、共同支出和个人可支配金额。我们会先安排共同生活，再把剩下的钱分配到个人和共同目标。"
  },
  personal_first: {
    tag: "个人边界优先",
    systemName: "先留个人空间",
    title: "我想先确认自己够用，再投入到我们。",
    summary: "个人可支配先留好。",
    description: "适合想把个人边界说清楚、减少金钱压力的伴侣。",
    bestFor: [
      "两个人都希望保留清楚的个人可支配空间"
    ],
    flow: "收入 -> 个人空间 -> 共同支出 -> 共同目标",
    setupTitle: "先留出各自的个人空间",
    setupDesc:
      "先决定每个人每月需要留多少钱。接着我们会检查共同支出是否够覆盖，并把剩余金额安排到共同目标。"
  },
  proportional: {
    tag: "按收入公平分摊",
    systemName: "收入比例分摊",
    title: "不一定要一人一半，但要让两个人都觉得公平。",
    summary: "共同支出按收入或约定比例分摊。",
    description: "适合两个人收入差距比较明显，或不想简单 50/50 的情况。",
    bestFor: [
      "收入不同，想按能力分摊共同支出"
    ],
    flow: "收入 -> 分摊规则 -> 个人空间 -> 共同目标",
    setupTitle: "设置更贴合你们的分摊方式",
    setupDesc:
      "先选择共同支出怎么分摊，再围绕这个规则生成每笔工资该怎么转、该留多少的计划。"
  }
};

export function getModelCopy(language: Language): Record<ModelKey, ModelCopy> {
  return language === "zh" ? MODEL_COPY_ZH : MODEL_COPY;
}
