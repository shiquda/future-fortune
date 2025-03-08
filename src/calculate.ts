import { InvestOption } from "./types/invest";
import { OptionData, Data } from "./types/data";

const calculateOptionData = (option: InvestOption): OptionData => {
    const optionData: OptionData = {
        id: option.id,
        name: option.name,
        fortunePerYear: [],
    };
    
    // 从初始投入开始
    let fortune = option.initialAmount;
    for (let year = option.startYear; year <= option.endYear; year++) {
        // 先计算收益，再加上本年投入
        if (year !== option.startYear) {
            fortune = fortune * (1 + option.rate / 100);
        }
        fortune += option.amount;
        
        // 计算年收益率
        
        optionData.fortunePerYear.push({ 
            year, 
            fortune,
        });
        
    }

    return optionData;
};

export const calculateData = (investOptions: InvestOption[]): Data => {
    const data: Data = {
        OptionData: [],
        sumOfFortunePerYear: [],
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
    
    sortedYears.forEach(year => {
        let totalFortune = 0;
        let totalAmount = 0;
        
        data.OptionData.forEach(option => {
            const yearData = option.fortunePerYear.find(item => item.year === year);
            if (yearData) {
                totalFortune += yearData.fortune;
                // 获取当年投入金额
                const investOption = investOptions.find(opt => opt.id === option.id);
                if (investOption) {
                    totalAmount += investOption.amount;
                }
                // 如果是该选项的结束年份，记录最终财富值
                if (investOption && year === investOption.endYear) {
                    finalFortunes.set(option.id, yearData.fortune);
                }
            } else {
                // 检查是否是已结束的投资选项
                const finalFortune = finalFortunes.get(option.id);
                if (finalFortune !== undefined) {
                    // 将已结束投资的最终财富值加入总资产
                    totalFortune += finalFortune;
                }
            }
        });
        
        data.sumOfFortunePerYear.push({ 
            year, 
            fortune: totalFortune
        });
    });
    
    return data;
};









