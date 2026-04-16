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
