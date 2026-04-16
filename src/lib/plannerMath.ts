import { getModelCopy } from "../data/modelCopy";
import type {
  Account,
  BuilderState,
  ModelKey,
  PersonKey,
  PlanBlock,
  PlanStep,
  PlanSummary,
  PlanWarning,
} from "../types/planner";
import { fmtCurrency } from "./format";
import { paycheckTitle, type Language } from "./i18n";

export function totalIncome(state: BuilderState): number {
  return [...state.paychecks.a, ...state.paychecks.b].reduce(
    (sum, paycheck) => sum + Number(paycheck.amount || 0),
    0,
  );
}

export function totalExpenses(state: BuilderState): number {
  if (state.expenseOverrideEnabled && state.expenseOverrideValue > 0) {
    return state.expenseOverrideValue;
  }
  return state.expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
}

export function getIncomeRatio(state: BuilderState): number {
  const aIncome = state.paychecks.a.reduce((sum, paycheck) => sum + Number(paycheck.amount || 0), 0);
  const bIncome = state.paychecks.b.reduce((sum, paycheck) => sum + Number(paycheck.amount || 0), 0);
  const total = aIncome + bIncome;
  if (!total) return 50;
  return Math.round((aIncome / total) * 100);
}

export function incomeByPerson(state: BuilderState): Record<PersonKey, number> {
  return {
    a: state.paychecks.a.reduce((sum, paycheck) => sum + Number(paycheck.amount || 0), 0),
    b: state.paychecks.b.reduce((sum, paycheck) => sum + Number(paycheck.amount || 0), 0),
  };
}

export function getPersonalAmounts(model: ModelKey, state: BuilderState) {
  if (model === "personal_first") {
    if (state.personalReserveMode === "fixed") {
      return {
        a: state.fixedReserve.a,
        b: state.fixedReserve.b,
        total: state.fixedReserve.a + state.fixedReserve.b,
      };
    }
    const ratio = state.personalReserveMode === "income" ? getIncomeRatio(state) : state.personalRatio;
    const a = Math.round((state.personalTotal * ratio) / 100);
    return { a, b: state.personalTotal - a, total: state.personalTotal };
  }

  if (model === "proportional") {
    const incomes = incomeByPerson(state);
    const a = Math.round((incomes.a * state.personalIncomePercent) / 100);
    const b = Math.round((incomes.b * state.personalIncomePercent) / 100);
    return { a, b, total: a + b };
  }

  const a = Math.round((state.personalTotal * state.personalRatio) / 100);
  return { a, b: state.personalTotal - a, total: state.personalTotal };
}

export function getSharedSplit(model: ModelKey, state: BuilderState, expenseTotal: number, language: Language = "en") {
  const isZh = language === "zh";

  if (model === "proportional") {
    const ratio = state.sharedRatioMode === "income" ? getIncomeRatio(state) : state.sharedRatio;
    const aTarget = Math.round((expenseTotal * ratio) / 100);
    return {
      ratio,
      aTarget,
      bTarget: expenseTotal - aTarget,
      label:
        state.sharedRatioMode === "income"
          ? isZh ? `按收入比例分摊 · ${ratio}% / ${100 - ratio}%` : `Income-based split · ${ratio}% / ${100 - ratio}%`
          : isZh ? `自定义分摊比例 · ${ratio}% / ${100 - ratio}%` : `Custom shared split · ${ratio}% / ${100 - ratio}%`,
    };
  }

  const aTarget = Math.round(expenseTotal / 2);
  return {
    ratio: 50,
    aTarget,
    bTarget: expenseTotal - aTarget,
    label:
      model === "shared_first"
        ? isZh ? "共同支出默认 50/50 分摊" : "Shared expenses split 50/50 by default"
        : isZh ? "先留出个人空间，再安排共同支出" : "Shared expenses are handled after personal space is set aside",
  };
}

type MutablePlanBlock = PlanBlock & { remaining: number };

function createBlocks(state: BuilderState, language: Language): MutablePlanBlock[] {
  const aBlocks: MutablePlanBlock[] = state.paychecks.a.map((paycheck, idx) => ({
    who: "a",
    title: paycheckTitle(state.names.a, idx + 1, language),
    gross: paycheck.amount,
    steps: [],
    remaining: paycheck.amount,
  }));

  const bBlocks: MutablePlanBlock[] = state.paychecks.b.map((paycheck, idx) => ({
    who: "b",
    title: paycheckTitle(state.names.b, idx + 1, language),
    gross: paycheck.amount,
    steps: [],
    remaining: paycheck.amount,
  }));

  return [...aBlocks, ...bBlocks];
}

function pushStep(block: MutablePlanBlock, step: PlanStep) {
  block.steps.push(step);
}

function takeFromBlocks(
  blocks: MutablePlanBlock[],
  who: PersonKey,
  needed: number,
  label: string,
  kind: PlanStep["kind"],
): number {
  let remainingNeed = needed;
  for (const block of blocks.filter((item) => item.who === who)) {
    if (remainingNeed <= 0) break;
    const amount = Math.min(block.remaining, remainingNeed);
    if (amount > 0) {
      pushStep(block, { label, amount, kind });
      block.remaining -= amount;
      remainingNeed -= amount;
    }
  }
  return needed - remainingNeed;
}

function allocateAcrossAllBlocks(blocks: MutablePlanBlock[], needed: number, label: string): number {
  let remainingNeed = needed;
  for (const block of blocks) {
    if (remainingNeed <= 0) break;
    const amount = Math.min(block.remaining, remainingNeed);
    if (amount > 0) {
      pushStep(block, { label, amount, kind: "transfer" });
      block.remaining -= amount;
      remainingNeed -= amount;
    }
  }
  return needed - remainingNeed;
}

function allocatePersonalByMode(
  blocks: MutablePlanBlock[],
  who: PersonKey,
  needed: number,
  mode: BuilderState["personalMode"],
  label: string,
): number {
  if (mode === "p1") {
    return takeFromBlocks(blocks, who, needed, label, "keep");
  }

  const personBlocks = blocks.filter((block) => block.who === who);
  const count = Math.max(personBlocks.length, 1);
  const base = Math.floor(needed / count);
  let remainder = needed - base * count;
  let funded = 0;

  for (const block of personBlocks) {
    const target = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
    const amount = Math.min(block.remaining, target);
    if (amount > 0) {
      pushStep(block, { label, amount, kind: "keep" });
      block.remaining -= amount;
      funded += amount;
    }
  }

  return funded;
}

function allocateAccount(blocks: MutablePlanBlock[], account: Account, warnings: PlanWarning[], language: Language) {
  const isZh = language === "zh";
  const available = blocks.reduce((sum, block) => sum + block.remaining, 0);

  if (account.sweep) {
    allocateAcrossAllBlocks(blocks, available, isZh ? `转入${account.name}` : `Transfer to ${account.name}`);
    return;
  }

  if (!account.partial && available < account.target) {
    warnings.push({
      type: "warning",
      message: isZh
        ? `${account.name} 不够存满。目标 ${fmtCurrency(account.target)}，当前可用 ${fmtCurrency(available)}。`
        : `Not enough left for ${account.name}. Need ${fmtCurrency(account.target)}, available ${fmtCurrency(available)}.`,
    });
    return;
  }

  const target = account.partial ? Math.min(account.target, available) : account.target;
  const funded = allocateAcrossAllBlocks(blocks, target, isZh ? `转入${account.name}` : `Transfer to ${account.name}`);

  if (funded < target) {
    warnings.push({
      type: "warning",
      message: isZh
        ? `${account.name} 已存入 ${fmtCurrency(funded)}，目标是 ${fmtCurrency(target)}。`
        : `${account.name} funded ${fmtCurrency(funded)} of ${fmtCurrency(target)}.`,
    });
  }
}

function finalizeBlocks(blocks: MutablePlanBlock[], language: Language): PlanBlock[] {
  return blocks.map((block) => {
    if (block.remaining > 0) {
      pushStep(block, { label: language === "zh" ? "未分配" : "Unallocated", amount: block.remaining, kind: "surplus" });
      block.remaining = 0;
    }
    const { remaining: _remaining, ...finalBlock } = block;
    return finalBlock;
  });
}

export function buildPlan(model: ModelKey, state: BuilderState, language: Language = "en"): PlanSummary {
  const isZh = language === "zh";
  const modelCopy = getModelCopy(language);
  const expenseTotal = totalExpenses(state);
  const income = totalIncome(state);
  const personal = getPersonalAmounts(model, state);
  const shared = getSharedSplit(model, state, expenseTotal, language);
  const sharedGoalsTarget = state.accounts.reduce((sum, account) => sum + (account.sweep ? 0 : account.target), 0);
  const warnings: PlanWarning[] = [];
  const blocks = createBlocks(state, language);
  const personalSpaceLabel = isZh ? "留作个人空间" : "Keep for personal space";
  const sharedExpenseLabel = isZh ? "转入共同支出账户" : "Transfer to Shared Expense Account";

  if (model === "personal_first") {
    const aKept = takeFromBlocks(blocks, "a", personal.a, personalSpaceLabel, "keep");
    const bKept = takeFromBlocks(blocks, "b", personal.b, personalSpaceLabel, "keep");

    if (aKept < personal.a) {
      warnings.push({
        type: "warning",
        message: isZh
          ? `${state.names.a} 的个人空间还差 ${fmtCurrency(personal.a - aKept)}。`
          : `${state.names.a} is ${fmtCurrency(personal.a - aKept)} short of the intended personal reserve.`,
      });
    }
    if (bKept < personal.b) {
      warnings.push({
        type: "warning",
        message: isZh
          ? `${state.names.b} 的个人空间还差 ${fmtCurrency(personal.b - bKept)}。`
          : `${state.names.b} is ${fmtCurrency(personal.b - bKept)} short of the intended personal reserve.`,
      });
    }

    const sharedFunded = allocateAcrossAllBlocks(blocks, expenseTotal, sharedExpenseLabel);
    if (sharedFunded < expenseTotal) {
      warnings.push({
        type: "error",
        message: isZh
          ? `留出个人空间后，共同支出还差 ${fmtCurrency(expenseTotal - sharedFunded)}。`
          : `Shared expenses are short by ${fmtCurrency(expenseTotal - sharedFunded)} after personal space is reserved.`,
      });
    }

    for (const account of state.accounts) allocateAccount(blocks, account, warnings, language);

    return {
      warnings,
      totalIncome: income,
      sharedExpenses: expenseTotal,
      personalAmount: personal.total,
      modelLabel: modelCopy[model].title,
      sharedRuleText: shared.label,
      stats: [
        { label: isZh ? "总收入" : "Total income", value: fmtCurrency(income) },
        {
          label: isZh ? "个人空间" : "Personal space",
          value: fmtCurrency(personal.total),
          sub: `${state.names.a}: ${fmtCurrency(personal.a)} · ${state.names.b}: ${fmtCurrency(personal.b)}`,
        },
        { label: isZh ? "共同支出" : "Shared expenses", value: fmtCurrency(expenseTotal) },
        {
          label: isZh ? "共同目标" : "Shared goals",
          value: fmtCurrency(sharedGoalsTarget),
          sub: isZh ? "扣除账单和个人空间后" : "After bills and personal space",
        },
      ],
      blocks: finalizeBlocks(blocks, language),
    };
  }

  const aSharedFunded = takeFromBlocks(blocks, "a", shared.aTarget, sharedExpenseLabel, "transfer");
  const bSharedFunded = takeFromBlocks(blocks, "b", shared.bTarget, sharedExpenseLabel, "transfer");

  if (aSharedFunded < shared.aTarget) {
    warnings.push({
      type: "warning",
      message: isZh
        ? `${state.names.a} 已转入 ${fmtCurrency(aSharedFunded)}，目标是 ${fmtCurrency(shared.aTarget)}。`
        : `${state.names.a} funded ${fmtCurrency(aSharedFunded)} toward a ${fmtCurrency(shared.aTarget)} shared target.`,
    });
  }
  if (bSharedFunded < shared.bTarget) {
    warnings.push({
      type: "warning",
      message: isZh
        ? `${state.names.b} 已转入 ${fmtCurrency(bSharedFunded)}，目标是 ${fmtCurrency(shared.bTarget)}。`
        : `${state.names.b} funded ${fmtCurrency(bSharedFunded)} toward a ${fmtCurrency(shared.bTarget)} shared target.`,
    });
  }

  const personalStepLabel = model === "proportional"
    ? isZh ? "留作个人储蓄" : "Keep for personal savings"
    : personalSpaceLabel;
  const aPersonalFunded = allocatePersonalByMode(blocks, "a", personal.a, state.personalMode, personalStepLabel);
  const bPersonalFunded = allocatePersonalByMode(blocks, "b", personal.b, state.personalMode, personalStepLabel);

  if (aPersonalFunded < personal.a) {
    warnings.push({
      type: "warning",
      message: isZh
        ? `${state.names.a} 的个人空间还差 ${fmtCurrency(personal.a - aPersonalFunded)}。`
        : `${state.names.a} is ${fmtCurrency(personal.a - aPersonalFunded)} short for personal space.`,
    });
  }
  if (bPersonalFunded < personal.b) {
    warnings.push({
      type: "warning",
      message: isZh
        ? `${state.names.b} 的个人空间还差 ${fmtCurrency(personal.b - bPersonalFunded)}。`
        : `${state.names.b} is ${fmtCurrency(personal.b - bPersonalFunded)} short for personal space.`,
    });
  }

  for (const account of state.accounts) allocateAccount(blocks, account, warnings, language);

  return {
    warnings,
    totalIncome: income,
    sharedExpenses: expenseTotal,
    personalAmount: personal.total,
    modelLabel: modelCopy[model].title,
    sharedRuleText: shared.label,
    stats: [
      { label: isZh ? "总收入" : "Total income", value: fmtCurrency(income) },
      {
        label: isZh ? "个人空间" : "Personal space",
        value: fmtCurrency(personal.total),
        sub: `${state.names.a}: ${fmtCurrency(personal.a)} · ${state.names.b}: ${fmtCurrency(personal.b)}`,
      },
      { label: isZh ? "共同支出" : "Shared expenses", value: fmtCurrency(expenseTotal), sub: shared.label },
      {
        label: isZh ? "共同目标" : "Shared goals",
        value: fmtCurrency(sharedGoalsTarget),
        sub: isZh ? "扣除账单和个人空间后" : "After bills and personal space",
      },
    ],
    blocks: finalizeBlocks(blocks, language),
  };
}
