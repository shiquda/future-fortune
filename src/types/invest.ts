export interface InvestOptionSetting {
  name: string;
  amount: number;
  initialAmount: number;
  rate: number;
  volatility: number;
  startYear: number;
  endYear: number;
}

export interface InvestOption extends InvestOptionSetting {
  id: string;
  isEditing: boolean;
}