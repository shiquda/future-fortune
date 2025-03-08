interface FortuneAtYear {
    year: number;
    fortune: number;
}

export interface OptionData {
    id: string;
    name: string;
    fortunePerYear: FortuneAtYear[];
}

export interface Data {
    OptionData: OptionData[];
    sumOfFortunePerYear: FortuneAtYear[];
}
