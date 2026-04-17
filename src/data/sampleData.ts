import type { BuilderState } from "../types/planner";
import type { Language } from "../lib/i18n";

export const createInitialState = (language: Language = "en"): BuilderState => ({
  names: language === "zh" ? { a: "小林", b: "小周" } : { a: "Emma", b: "James" },
  paychecks: {
    a: [
      { id: 1, amount: 2500 },
      { id: 2, amount: 2500 }
    ],
    b: [
      { id: 3, amount: 3000 },
      { id: 4, amount: 3000 }
    ]
  },
  expenses: [
    { id: 1, name: language === "zh" ? "房租" : "Rent", amount: 1800 },
    { id: 2, name: language === "zh" ? "买菜和日用品" : "Groceries", amount: 600 }
  ],
  accounts: [
    { id: 1, name: language === "zh" ? "共同备用金" : "Shared buffer fund", target: 500, partial: true, sweep: false },
    { id: 2, name: language === "zh" ? "应急金" : "Emergency fund", target: 300, partial: false, sweep: false },
    { id: 3, name: language === "zh" ? "共同储蓄" : "Joint savings", target: 500, partial: false, sweep: true }
  ],
  expenseOverrideEnabled: false,
  expenseOverrideValue: 0,
  personalTotal: 2000,
  personalRatio: 40,
  personalIncomePercent: 20,
  personalMode: "p1",
  personalReserveMode: "fixed",
  fixedReserve: { a: 800, b: 1200 },
  sharedRatioMode: "income",
  sharedRatio: 50
});

const defaultTextByLanguage = {
  en: {
    names: { a: "Emma", b: "James" },
    expenses: {
      Rent: "Rent",
      Groceries: "Groceries",
      "房租": "Rent",
      "买菜和日用品": "Groceries",
    },
    accounts: {
      "Shared buffer fund": "Shared buffer fund",
      "Emergency fund": "Emergency fund",
      "Joint savings": "Joint savings",
      "共同备用金": "Shared buffer fund",
      "应急金": "Emergency fund",
      "共同储蓄": "Joint savings",
    },
  },
  zh: {
    names: { a: "小林", b: "小周" },
    expenses: {
      Rent: "房租",
      Groceries: "买菜和日用品",
      "房租": "房租",
      "买菜和日用品": "买菜和日用品",
    },
    accounts: {
      "Shared buffer fund": "共同备用金",
      "Emergency fund": "应急金",
      "Joint savings": "共同储蓄",
      "共同备用金": "共同备用金",
      "应急金": "应急金",
      "共同储蓄": "共同储蓄",
    },
  },
} satisfies Record<Language, {
  names: BuilderState["names"];
  expenses: Record<string, string>;
  accounts: Record<string, string>;
}>;

const defaultNameValues = new Set([
  "Emma",
  "James",
  "小林",
  "小周",
]);

function translateDefaultText(value: string, map: Record<string, string>) {
  return map[value] ?? value;
}

export function localizeDefaultStateText(state: BuilderState, language: Language): BuilderState {
  const copy = defaultTextByLanguage[language];

  return {
    ...state,
    names: {
      a: defaultNameValues.has(state.names.a) ? copy.names.a : state.names.a,
      b: defaultNameValues.has(state.names.b) ? copy.names.b : state.names.b,
    },
    expenses: state.expenses.map((expense) => ({
      ...expense,
      name: translateDefaultText(expense.name, copy.expenses),
    })),
    accounts: state.accounts.map((account) => ({
      ...account,
      name: translateDefaultText(account.name, copy.accounts),
    })),
  };
}
