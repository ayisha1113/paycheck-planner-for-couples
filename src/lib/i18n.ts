export type Language = "en" | "zh";

export const DEFAULT_LANGUAGE: Language = "en";

export const languageLabels: Record<Language, string> = {
  en: "EN",
  zh: "中文",
};

export function getSavedLanguage(): Language {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;

  const saved = window.localStorage.getItem("paycheck-planner-language");
  if (saved === "zh" || saved === "en") return saved;

  return DEFAULT_LANGUAGE;
}

export function saveLanguage(language: Language) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("paycheck-planner-language", language);
}

export function joinNames(a: string, b: string, language: Language) {
  return language === "zh" ? `${a} 和 ${b}` : `${a} & ${b}`;
}

export function paycheckTitle(name: string, index: number, language: Language) {
  return language === "zh" ? `${name} - 第 ${index} 笔工资` : `${name} - Paycheck ${index}`;
}
