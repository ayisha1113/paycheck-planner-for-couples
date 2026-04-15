import { MODEL_COPY } from "../data/modelCopy";
import { fmtCurrency } from "./format";
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

export function getSharedSplit(model: ModelKey, state: BuilderState, expenseTotal: number) {
  if (model === "proportional") {
    const ratio = state.sharedRatioMode === "income" ? getIncomeRatio(state) : state.sharedRatio;
    const aTarget = Math.round((expenseTotal * ratio) / 100);
    return {
      ratio,
      aTarget,
      bTarget: expenseTotal - aTarget,
      label:
        state.sharedRatioMode === "income"
          ? `Income-based split · ${ratio}% / ${100 - ratio}%`
          : `Custom shared split · ${ratio}% / ${100 - ratio}%`,
    };
  }

  const aTarget = Math.round(expenseTotal / 2);
  return {
    ratio: 50,
    aTarget,
    bTarget: expenseTotal - aTarget,
    label:
      model === "shared_first"
        ? "Shared expenses split 50/50 by default"
        : "Shared expenses are handled after personal space is set aside",
  };
}

type MutablePlanBlock = PlanBlock & { remaining: number };

function createBlocks(state: BuilderState): MutablePlanBlock[] {
  const aBlocks: MutablePlanBlock[] = state.paychecks.a.map((paycheck, idx) => ({
    who: "a",
    title: `${state.names.a} — Paycheck ${idx + 1}`,
    gross: paycheck.amount,
    steps: [],
    remaining: paycheck.amount,
  }));

  const bBlocks: MutablePlanBlock[] = state.paychecks.b.map((paycheck, idx) => ({
    who: "b",
    title: `${state.names.b} — Paycheck ${idx + 1}`,
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
  label = "Keep for personal space",
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

function allocateAccount(blocks: MutablePlanBlock[], account: Account, warnings: PlanWarning[]) {
  const available = blocks.reduce((sum, block) => sum + block.remaining, 0);

  if (account.sweep) {
    allocateAcrossAllBlocks(blocks, available, `Transfer to ${account.name}`);
    return;
  }

  if (!account.partial && available < account.target) {
    warnings.push({
      type: "warning",
      message: `Not enough left for ${account.name}. Need ${fmtCurrency(account.target)}, available ${fmtCurrency(available)}.`,
    });
    return;
  }

  const target = account.partial ? Math.min(account.target, available) : account.target;
  const funded = allocateAcrossAllBlocks(blocks, target, `Transfer to ${account.name}`);

  if (funded < target) {
    warnings.push({
      type: "warning",
      message: `${account.name} funded ${fmtCurrency(funded)} of ${fmtCurrency(target)}.`,
    });
  }
}

function finalizeBlocks(blocks: MutablePlanBlock[]): PlanBlock[] {
  return blocks.map((block) => {
    if (block.remaining > 0) {
      pushStep(block, { label: "Unallocated", amount: block.remaining, kind: "surplus" });
      block.remaining = 0;
    }
    const { remaining: _remaining, ...finalBlock } = block;
    return finalBlock;
  });
}

export function buildPlan(model: ModelKey, state: BuilderState): PlanSummary {
  const expenseTotal = totalExpenses(state);
  const income = totalIncome(state);
  const personal = getPersonalAmounts(model, state);
  const shared = getSharedSplit(model, state, expenseTotal);
  const sharedGoalsTarget = state.accounts.reduce((sum, account) => sum + (account.sweep ? 0 : account.target), 0);
  const warnings: PlanWarning[] = [];
  const blocks = createBlocks(state);

  if (model === "personal_first") {
    const aKept = takeFromBlocks(blocks, "a", personal.a, "Keep for personal space", "keep");
    const bKept = takeFromBlocks(blocks, "b", personal.b, "Keep for personal space", "keep");

    if (aKept < personal.a) {
      warnings.push({
        type: "warning",
        message: `${state.names.a} is ${fmtCurrency(personal.a - aKept)} short of the intended personal reserve.`,
      });
    }
    if (bKept < personal.b) {
      warnings.push({
        type: "warning",
        message: `${state.names.b} is ${fmtCurrency(personal.b - bKept)} short of the intended personal reserve.`,
      });
    }

    const sharedFunded = allocateAcrossAllBlocks(blocks, expenseTotal, "Transfer to Shared Expense Account");
    if (sharedFunded < expenseTotal) {
      warnings.push({
        type: "error",
        message: `Shared expenses are short by ${fmtCurrency(expenseTotal - sharedFunded)} after personal space is reserved.`,
      });
    }

    for (const account of state.accounts) allocateAccount(blocks, account, warnings);

    return {
      warnings,
      totalIncome: income,
      sharedExpenses: expenseTotal,
      personalAmount: personal.total,
      modelLabel: MODEL_COPY[model].title,
      sharedRuleText: shared.label,
      stats: [
        { label: "Total income", value: fmtCurrency(income) },
        {
          label: "Personal space",
          value: fmtCurrency(personal.total),
          sub: `${state.names.a}: ${fmtCurrency(personal.a)} · ${state.names.b}: ${fmtCurrency(personal.b)}`,
        },
        { label: "Shared expenses", value: fmtCurrency(expenseTotal) },
        {
          label: "Shared goals",
          value: fmtCurrency(sharedGoalsTarget),
          sub: "After bills and personal space",
        },
      ],
      blocks: finalizeBlocks(blocks),
    };
  }

  const aSharedFunded = takeFromBlocks(blocks, "a", shared.aTarget, "Transfer to Shared Expense Account", "transfer");
  const bSharedFunded = takeFromBlocks(blocks, "b", shared.bTarget, "Transfer to Shared Expense Account", "transfer");

  if (aSharedFunded < shared.aTarget) {
    warnings.push({
      type: "warning",
      message: `${state.names.a} funded ${fmtCurrency(aSharedFunded)} toward a ${fmtCurrency(shared.aTarget)} shared target.`,
    });
  }
  if (bSharedFunded < shared.bTarget) {
    warnings.push({
      type: "warning",
      message: `${state.names.b} funded ${fmtCurrency(bSharedFunded)} toward a ${fmtCurrency(shared.bTarget)} shared target.`,
    });
  }

  const personalStepLabel = model === "proportional" ? "Keep for personal savings" : "Keep for personal space";
  const aPersonalFunded = allocatePersonalByMode(blocks, "a", personal.a, state.personalMode, personalStepLabel);
  const bPersonalFunded = allocatePersonalByMode(blocks, "b", personal.b, state.personalMode, personalStepLabel);

  if (aPersonalFunded < personal.a) {
    warnings.push({
      type: "warning",
      message: `${state.names.a} is ${fmtCurrency(personal.a - aPersonalFunded)} short for personal space.`,
    });
  }
  if (bPersonalFunded < personal.b) {
    warnings.push({
      type: "warning",
      message: `${state.names.b} is ${fmtCurrency(personal.b - bPersonalFunded)} short for personal space.`,
    });
  }

  for (const account of state.accounts) allocateAccount(blocks, account, warnings);

  return {
    warnings,
    totalIncome: income,
    sharedExpenses: expenseTotal,
    personalAmount: personal.total,
    modelLabel: MODEL_COPY[model].title,
    sharedRuleText: shared.label,
    stats: [
      { label: "Total income", value: fmtCurrency(income) },
      {
        label: "Personal space",
        value: fmtCurrency(personal.total),
        sub: `${state.names.a}: ${fmtCurrency(personal.a)} · ${state.names.b}: ${fmtCurrency(personal.b)}`,
      },
      { label: "Shared expenses", value: fmtCurrency(expenseTotal), sub: shared.label },
      {
        label: "Shared goals",
        value: fmtCurrency(sharedGoalsTarget),
        sub: "After bills and personal space",
      },
    ],
    blocks: finalizeBlocks(blocks),
  };
}
