import { InvestOption } from "./types/invest";
import { OptionData, Data } from "./types/data";

const calculateOptionData = (option: InvestOption): OptionData => {
    const optionData: OptionData = {
        id: option.id,
        name: option.name,
        fortunePerYear: [],
        totalInvestment: option.initialAmount, // 初始投入
        totalProfit: 0
    };
    
    // 从初始投入开始
    let fortune = option.initialAmount;
    let totalInvestment = option.initialAmount;
    let totalProfit = 0;
    
    for (let year = option.startYear; year <= option.endYear; year++) {
        let yearlyProfit = 0;
        let yearlyInvestment = option.amount;
        
        // 第一年不计算收益，只有初始投入
        if (year !== option.startYear) {
            // 计算当年收益
            yearlyProfit = fortune * (option.rate / 100);
            fortune = fortune + yearlyProfit;
            totalProfit += yearlyProfit;
        }
        
        // 添加当年投入
        fortune += yearlyInvestment;
        totalInvestment += yearlyInvestment;
        
        optionData.fortunePerYear.push({ 
            year, 
            fortune,
            investment: yearlyInvestment,
            profit: yearlyProfit,
            totalInvestment: totalInvestment,
            totalProfit: totalProfit
        });
    }
    
    optionData.totalInvestment = totalInvestment;
    optionData.totalProfit = totalProfit;

    return optionData;
};

export const calculateData = (investOptions: InvestOption[]): Data => {
    const data: Data = {
        OptionData: [],
        sumOfFortunePerYear: [],
        totalInvestment: 0,
        totalProfit: 0
    };
    
    // 计算每个投资选项的数据
    data.OptionData = investOptions.map(option => calculateOptionData(option));
    
    // 计算总资产
    const allYears = new Set<number>();
    data.OptionData.forEach(option => {
        option.fortunePerYear.forEach(item => {
            allYears.add(item.year);
        });
    });
    
    const sortedYears = Array.from(allYears).sort((a, b) => a - b);
    
    // 用于跟踪每个投资选项的最终财富值
    const finalFortunes = new Map<string, number>();
    const finalInvestments = new Map<string, number>();
    const finalProfits = new Map<string, number>();
    
    // 计算每年的总资产、总投入和总利润
    let totalInvestment = 0;
    let totalProfit = 0;
    
    sortedYears.forEach(year => {
        let yearTotalFortune = 0;
        let yearTotalInvestment = 0;
        let yearTotalProfit = 0;
        let yearlyInvestment = 0;
        let yearlyProfit = 0;
        
        data.OptionData.forEach(option => {
            const yearData = option.fortunePerYear.find(item => item.year === year);
            if (yearData) {
                yearTotalFortune += yearData.fortune;
                yearTotalInvestment += yearData.totalInvestment || 0;
                yearTotalProfit += yearData.totalProfit || 0;
                yearlyInvestment += yearData.investment || 0;
                yearlyProfit += yearData.profit || 0;
                
                // 如果是该选项的结束年份，记录最终值
                const investOption = investOptions.find(opt => opt.id === option.id);
                if (investOption && year === investOption.endYear) {
                    finalFortunes.set(option.id, yearData.fortune);
                    finalInvestments.set(option.id, yearData.totalInvestment || 0);
                    finalProfits.set(option.id, yearData.totalProfit || 0);
                }
            } else {
                // 检查是否是已结束的投资选项
                const finalFortune = finalFortunes.get(option.id);
                const finalInvestment = finalInvestments.get(option.id);
                const finalProfit = finalProfits.get(option.id);
                
                if (finalFortune !== undefined) {
                    yearTotalFortune += finalFortune;
                    yearTotalInvestment += finalInvestment || 0;
                    yearTotalProfit += finalProfit || 0;
                }
            }
        });
        
        totalInvestment += yearlyInvestment;
        totalProfit += yearlyProfit;
        
        data.sumOfFortunePerYear.push({ 
            year, 
            fortune: yearTotalFortune,
            investment: yearlyInvestment,
            profit: yearlyProfit,
            totalInvestment: yearTotalInvestment,
            totalProfit: yearTotalProfit
        });
    });
    
    data.totalInvestment = totalInvestment;
    data.totalProfit = totalProfit;
    
    return data;
};









