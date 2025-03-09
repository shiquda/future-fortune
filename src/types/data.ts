interface FortuneAtYear {
    year: number;
    fortune: number;
    investment?: number; // 当年投入
    profit?: number;     // 当年利润
    totalInvestment?: number; // 累计投入
    totalProfit?: number;     // 累计利润
}

export interface OptionData {
    id: string;
    name: string;
    fortunePerYear: FortuneAtYear[];
    totalInvestment: number; // 总投入
    totalProfit: number;     // 总利润
}

export interface Data {
    OptionData: OptionData[];
    sumOfFortunePerYear: FortuneAtYear[];
    totalInvestment: number; // 总投入
    totalProfit: number;     // 总利润
}
