import type { BuilderState } from "../types/planner";

export const createInitialState = (): BuilderState => ({
  names: { a: "Emma", b: "James" },
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
    { id: 1, name: "Rent", amount: 1800 },
    { id: 2, name: "Groceries", amount: 600 }
  ],
  accounts: [
    { id: 1, name: "Shared buffer fund", target: 500, partial: true, sweep: false },
    { id: 2, name: "Emergency fund", target: 300, partial: false, sweep: false },
    { id: 3, name: "Joint savings", target: 500, partial: false, sweep: true }
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
