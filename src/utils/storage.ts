import { InvestOption } from "@/types/invest";

const STORAGE_KEY = "future_fortune_invest_options";

export const saveInvestOptionsToStorage = (options: InvestOption[]): void => {
  try {
    const serializedOptions = JSON.stringify(options);
    localStorage.setItem(STORAGE_KEY, serializedOptions);
  } catch (error) {
    console.error("保存投资选项到本地存储失败:", error);
  }
};

export const loadInvestOptionsFromStorage = (): InvestOption[] | null => {
  try {
    const serializedOptions = localStorage.getItem(STORAGE_KEY);
    if (serializedOptions === null) {
      return null;
    }
    return JSON.parse(serializedOptions);
  } catch (error) {
    console.error("从本地存储加载投资选项失败:", error);
    return null;
  }
};

export const clearInvestOptionsFromStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("清除本地存储中的投资选项失败:", error);
  }
}; 