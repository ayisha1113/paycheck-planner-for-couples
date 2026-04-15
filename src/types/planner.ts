export type ModelKey = "shared_first" | "personal_first" | "proportional";
export type PersonKey = "a" | "b";

export type Paycheck = {
  id: number;
  amount: number;
};

export type Expense = {
  id: number;
  name: string;
  amount: number;
};

export type Account = {
  id: number;
  name: string;
  target: number;
  partial: boolean;
  sweep: boolean;
};

export type BuilderState = {
  names: { a: string; b: string };
  paychecks: Record<PersonKey, Paycheck[]>;
  expenses: Expense[];
  accounts: Account[];
  expenseOverrideEnabled: boolean;
  expenseOverrideValue: number;
  personalTotal: number;
  personalRatio: number;
  personalIncomePercent: number;
  personalMode: "p1" | "split";
  personalReserveMode: "fixed" | "income" | "custom";
  fixedReserve: { a: number; b: number };
  sharedRatioMode: "income" | "custom";
  sharedRatio: number;
};

export type PlanStep = {
  label: string;
  amount: number;
  kind: "keep" | "transfer" | "surplus";
};

export type PlanBlock = {
  who: PersonKey;
  title: string;
  gross: number;
  steps: PlanStep[];
};

export type PlanWarning = {
  type: "warning" | "error";
  message: string;
};

export type PlanStat = {
  label: string;
  value: string;
  sub?: string;
};

export type PlanSummary = {
  warnings: PlanWarning[];
  totalIncome: number;
  sharedExpenses: number;
  personalAmount: number;
  modelLabel: string;
  sharedRuleText: string;
  stats: PlanStat[];
  blocks: PlanBlock[];
};
