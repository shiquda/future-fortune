import React, { useState, useEffect, useRef } from 'react';
import { Button, Typography, Space, Divider, Row, Col, Card, Tabs, Radio } from 'antd';
import { calculateData } from '@/calculate';
import { InvestOption } from '@/types/invest';
import { UserInfo } from '@/types/user';
import { Data } from '@/types/data';
import ReactECharts from 'echarts-for-react';
import { ExportOutlined } from '@ant-design/icons';
import type { EChartsInstance } from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

const { Text, Title } = Typography;

interface GraphProps {
  investOptions: InvestOption[];
  userInfo: UserInfo | null;
}

const Graph: React.FC<GraphProps> = ({ investOptions, userInfo }) => {
  const [data, setData] = useState<Data | null>(null);
  const chartRef = useRef<ReactECharts>(null);
  const investmentChartRef = useRef<ReactECharts>(null);
  const profitChartRef = useRef<ReactECharts>(null);
  const [investmentMode, setInvestmentMode] = useState<'yearly' | 'cumulative'>('yearly');
  const [profitMode, setProfitMode] = useState<'yearly' | 'cumulative'>('yearly');
  const [profitDisplayMode, setProfitDisplayMode] = useState<'amount' | 'rate'>('amount');

  // 计算数据并更新图表
  const handleCalculate = () => {
    const calculatedData = calculateData(investOptions);
    setData(calculatedData);
  };

  // 当数据变化或组件挂载后，更新图表
  useEffect(() => {
    if (data && chartRef.current) {
      const echartsInstance: EChartsInstance = chartRef.current.getEchartsInstance();
      echartsInstance.setOption(getChartOption(data), true);
    }
  }, [data]);

  // 计算特定年份用户的年龄
  const calculateAge = (year: number): number | null => {
    if (!userInfo) return null;
    return year - userInfo.birthYear;
  };

  // 导出计算结果为CSV
  const handleExportCSV = () => {
    if (!data) return;

    // 创建总资产CSV内容
    const totalHeaders = ['年份', '年龄', '总资产'];
    let csvContent = totalHeaders.join(',') + '\n';
    
    data.sumOfFortunePerYear.forEach(item => {
      const age = calculateAge(item.year);
      csvContent += `${item.year},${age !== null ? age + '岁' : ''},${item.fortune.toFixed(2)}\n`;
    });
    
    // 添加各投资选项的数据
    csvContent += '\n各投资选项详情\n';
    
    data.OptionData.forEach(option => {
      csvContent += `\n${option.name || '未命名投资'}\n`;
      csvContent += '年份,年龄,资产\n';
      
      option.fortunePerYear.forEach(item => {
        const age = calculateAge(item.year);
        csvContent += `${item.year},${age !== null ? age + '岁' : ''},${item.fortune.toFixed(2)}\n`;
      });
    });

    // 创建Blob对象
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // 创建下载链接
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // 设置下载属性
    link.setAttribute('href', url);
    link.setAttribute('download', `计算结果_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    
    // 添加到DOM并触发下载
    document.body.appendChild(link);
    link.click();
    
    // 清理
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 投资图表配置
  const getInvestmentChartOption = (data: Data, mode: 'yearly' | 'cumulative') => {
    const years = data.sumOfFortunePerYear.map(item => item.year);
    
    // 准备总投资数据
    const totalSeries = {
      name: mode === 'cumulative' ? '累计总投入' : '逐年投入',
      type: 'line',
      data: data.sumOfFortunePerYear.map(item => 
        mode === 'cumulative' ? item.totalInvestment : item.investment
      ),
      lineStyle: {
        width: 3
      },
      emphasis: {
        focus: 'series'
      },
      symbol: 'circle',
      symbolSize: 8
    };
    
    // 准备各投资选项的数据
    const optionSeries = data.OptionData.map(option => {
      // 确保数据点与年份对齐，并处理缺失数据
      const seriesData = years.map((year, index) => {
        const yearData = option.fortunePerYear.find(item => item.year === year);
        if (yearData) {
          return mode === 'cumulative' ? yearData.totalInvestment : yearData.investment;
        } else {
          // 如果当前年份没有数据，查找左边最近的有效数据
          for (let i = index - 1; i >= 0; i--) {
            const prevYear = years[i];
            const prevYearData = option.fortunePerYear.find(item => item.year === prevYear);
            if (prevYearData) {
              // 对于累计模式，使用前一个有效值
              // 对于逐年模式，返回0（因为该年没有新投资）
              return mode === 'cumulative' ? prevYearData.totalInvestment : 0;
            }
          }
          // 如果左边没有有效数据，则返回0
          return 0;
        }
      });
      
      return {
        name: option.name || '未命名投资',
        type: 'line',
        data: seriesData,
        emphasis: {
          focus: 'series'
        },
        symbol: 'circle',
        symbolSize: 6
      };
    });
    
    return {
      title: {
        text: mode === 'cumulative' ? '累计投资金额' : '逐年投资金额',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        },
        formatter: function(params: any) {
          const year = params[0].axisValue;
          const age = calculateAge(parseInt(year));
          let result = `${year}年${age !== null ? ` (${age}岁)` : ''}<br/>`;
          
          params.forEach((item: any) => {
            if (item.value !== null) {
              result += item.marker + ' ' + item.seriesName + ': ' + 
                      item.value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '<br/>';
            }
          });
          return result;
        }
      },
      legend: {
        data: [mode === 'cumulative' ? '累计总投入' : '逐年投入', 
              ...data.OptionData.map(option => option.name || '未命名投资')],
        top: 30
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      },
      toolbox: {
        feature: {
          saveAsImage: {},
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: years,
        name: '年份',
        axisLabel: {
          formatter: function(value: number) {
            return value;
          }
        }
      },
      yAxis: {
        type: 'value',
        name: '金额 (¥)',
        axisLabel: {
          formatter: function(value: number) {
            if (value >= 10000) {
              return (value / 10000) + '万';
            }
            return value;
          }
        }
      },
      dataZoom: [
        {
          type: 'slider',
          show: true,
          xAxisIndex: [0],
          start: 0,
          end: 100,
          bottom: 10
        },
        {
          type: 'inside',
          xAxisIndex: [0],
          start: 0,
          end: 100
        }
      ],
      series: [totalSeries, ...optionSeries]
    };
  };

  // 利润图表配置
  const getProfitChartOption = (data: Data, mode: 'yearly' | 'cumulative', displayMode: 'amount' | 'rate') => {
    const years = data.sumOfFortunePerYear.map(item => item.year);
    
    // 准备总利润数据
    const totalSeries = {
      name: displayMode === 'amount' 
        ? (mode === 'cumulative' ? '累计总利润' : '逐年利润') 
        : (mode === 'cumulative' ? '累计总回报率' : '逐年回报率'),
      type: 'line',
      data: data.sumOfFortunePerYear.map(item => {
        if (displayMode === 'amount') {
          return mode === 'cumulative' ? item.totalProfit : item.profit;
        } else {
          // 计算回报率 = 利润 / 投资 * 100%
          const investment = mode === 'cumulative' ? item.totalInvestment : item.investment;
          const profit = mode === 'cumulative' ? item.totalProfit : item.profit;
          if (profit === undefined) {
            return 0;
          }
          return investment && investment > 0 ? (profit / investment * 100) : 0;
        }
      }),
      lineStyle: {
        width: 3
      },
      emphasis: {
        focus: 'series'
      },
      symbol: 'circle',
      symbolSize: 8
    };
    
    // 准备各投资选项的数据
    const optionSeries = data.OptionData.map(option => {
      // 确保数据点与年份对齐，并处理缺失数据
      const seriesData = years.map((year, index) => {
        const yearData = option.fortunePerYear.find(item => item.year === year);
        if (yearData) {
          if (displayMode === 'amount') {
            return mode === 'cumulative' ? yearData.totalProfit : yearData.profit;
          } else {
            // 计算回报率
            const investment = mode === 'cumulative' ? yearData.totalInvestment : yearData.investment;
            const profit = mode === 'cumulative' ? yearData.totalProfit : yearData.profit;
            if (profit === undefined) {
              return 0;
            }
            return investment && investment > 0 ? (profit / investment * 100) : 0;
          }
        } else {
          // 如果当前年份没有数据，查找左边最近的有效数据
          for (let i = index - 1; i >= 0; i--) {
            const prevYear = years[i];
            const prevYearData = option.fortunePerYear.find(item => item.year === prevYear);
            if (prevYearData) {
              if (displayMode === 'amount') {
                return mode === 'cumulative' ? prevYearData.totalProfit : 0;
              } else {
                if (mode === 'cumulative') {
                  const investment = prevYearData.totalInvestment;
                  const profit = prevYearData.totalProfit;
                  if (profit === undefined) {
                    return 0;
                  }
                  return investment && investment > 0 ? (profit / investment * 100) : 0;
                } else {
                  return 0;
                }
              }
            }
          }
          // 如果左边没有有效数据，则返回0
          return 0;
        }
      });
      
      return {
        name: option.name || '未命名投资',
        type: 'line',
        data: seriesData,
        emphasis: {
          focus: 'series'
        },
        symbol: 'circle',
        symbolSize: 6
      };
    });

    return {
      title: {
        text: displayMode === 'amount' 
          ? (mode === 'cumulative' ? '累计利润金额' : '逐年利润金额')
          : (mode === 'cumulative' ? '累计回报率' : '逐年回报率'),
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        },
        formatter: function(params: any) {
          const year = params[0].axisValue;
          const age = calculateAge(parseInt(year));
          let result = `${year}年${age !== null ? ` (${age}岁)` : ''}<br/>`;
          
          params.forEach((item: any) => {
            if (item.value !== null) {
              let valueDisplay = item.value;
              if (displayMode === 'rate') {
                valueDisplay = item.value.toFixed(2) + '%';
              } else {
                valueDisplay = item.value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
              }
              result += item.marker + ' ' + item.seriesName + ': ' + valueDisplay + '<br/>';
            }
          });
          return result;
        }
      },
      legend: {
        data: [
          displayMode === 'amount' 
            ? (mode === 'cumulative' ? '累计总利润' : '逐年利润')
            : (mode === 'cumulative' ? '累计总回报率' : '逐年回报率'), 
          ...data.OptionData.map(option => option.name || '未命名投资')
        ],
        top: 30
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      },
      toolbox: {
        feature: {
          saveAsImage: {},
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: years,
        name: '年份',
        axisLabel: {
          formatter: function(value: number) {
            return value;
          }
        }
      },
      yAxis: {
        type: 'value',
        name: displayMode === 'amount' ? '金额 (¥)' : '回报率 (%)',
        axisLabel: {
          formatter: function(value: number) {
            if (displayMode === 'amount') {
              if (value >= 10000) {
                return (value / 10000) + '万';
              }
              return value;
            } else {
              return value + '%';
            }
          }
        }
      },
      dataZoom: [
        {
          type: 'slider',
          show: true,
          xAxisIndex: [0],
          start: 0,
          end: 100,
          bottom: 10
        },
        {
          type: 'inside',
          xAxisIndex: [0],
          start: 0,
          end: 100
        }
      ],
      series: [totalSeries, ...optionSeries]
    };
  };

  // 更新图表配置
  const getChartOption = (data: Data) => {
    // 准备 x 轴数据（年份）
    const years = data.sumOfFortunePerYear.map(item => item.year);
    
    // 准备总资产数据
    const totalSeries = {
      name: '总资产',
      type: 'line',
      data: data.sumOfFortunePerYear.map(item => item.fortune),
      lineStyle: {
        width: 3
      },
      emphasis: {
        focus: 'series'
      },
      symbol: 'circle',
      symbolSize: 8
    };
    
    // 准备各投资选项的数据
    const optionSeries = data.OptionData.map(option => {
      // 确保数据点与年份对齐，并处理缺失数据
      const seriesData = years.map((year, index) => {
        const yearData = option.fortunePerYear.find(item => item.year === year);
        if (yearData) {
          return yearData.fortune;
        } else {
          // 如果当前年份没有数据，查找左边最近的有效数据
          for (let i = index - 1; i >= 0; i--) {
            const prevYear = years[i];
            const prevYearData = option.fortunePerYear.find(item => item.year === prevYear);
            if (prevYearData) {
              return prevYearData.fortune;
            }
          }
          // 如果左边没有有效数据，则返回0
          return 0;
        }
      });
      
      return {
        name: option.name || '未命名投资',
        type: 'line',
        data: seriesData,
        emphasis: {
          focus: 'series'
        },
        symbol: 'circle',
        symbolSize: 6
      };
    });
    
    // 设置图表选项
    return {
      title: {
        text: '投资收益增长图表',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        },
        formatter: function(params: any) {
          const year = params[0].axisValue;
          const age = calculateAge(parseInt(year));
          let result = `${year}年${age !== null ? ` (${age}岁)` : ''}<br/>`;
          
          params.forEach((item: any) => {
            result += item.marker + ' ' + item.seriesName + ': ' + 
                     item.value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '<br/>';
          });
          return result;
        }
      },
      legend: {
        data: ['总资产', ...data.OptionData.map(option => option.name || '未命名投资')],
        top: 30
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      },
      toolbox: {
        feature: {
          saveAsImage: {},
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: years,
        name: '年份',
        axisLabel: {
          formatter: function(value: number) {
            return value;
          }
        }
      },
      yAxis: {
        type: 'value',
        name: '金额 (¥)',
        axisLabel: {
          formatter: function(value: number) {
            if (value >= 10000) {
              return (value / 10000) + '万';
            }
            return value;
          }
        }
      },
      dataZoom: [
        {
          type: 'slider',
          show: true,
          xAxisIndex: [0],
          start: 0,
          end: 100,
          bottom: 10
        },
        {
          type: 'inside',
          xAxisIndex: [0],
          start: 0,
          end: 100
        }
      ],
      series: [totalSeries, ...optionSeries]
    };
  };

  return (
    <>
      {data && (
        <Button 
          type="primary" 
          size="large" 
          icon={<ExportOutlined />}
          onClick={handleExportCSV}
          style={{ marginRight: '10px' }}
        >
          导出数据
        </Button>
      )}
      <Space style={{ float: 'right' }}>
        <Button 
          type="primary" 
          size="large" 
          onClick={handleCalculate}
        >
          计算
        </Button>
      </Space>
      
      {data && (
        <Space direction="vertical" style={{ width: '100%', marginTop: '20px' }}>
          <Divider>图表展示</Divider>
          
          <Tabs defaultActiveKey="1">
            <Tabs.TabPane tab="总资产" key="1">
              <div style={{ height: '400px', width: '100%' }}>
                <ReactECharts 
                  ref={chartRef}
                  option={getChartOption(data) as EChartsOption}
                  style={{ height: '100%', width: '100%' }}
                  opts={{ renderer: 'svg' }}
                  notMerge={true}
                />
              </div>
            </Tabs.TabPane>
            
            <Tabs.TabPane tab="投资金额" key="2">
              <Card>
                <Radio.Group 
                  value={investmentMode} 
                  onChange={e => setInvestmentMode(e.target.value)}
                  style={{ marginBottom: '20px' }}
                >
                  <Radio.Button value="yearly">逐年投入</Radio.Button>
                  <Radio.Button value="cumulative">累计投入</Radio.Button>
                </Radio.Group>
                
                <div style={{ height: '400px', width: '100%' }}>
                  <ReactECharts 
                    ref={investmentChartRef}
                    option={getInvestmentChartOption(data, investmentMode) as EChartsOption}
                    style={{ height: '100%', width: '100%' }}
                    opts={{ renderer: 'svg' }}
                    notMerge={true}
                  />
                </div>
              </Card>
            </Tabs.TabPane>
            
            <Tabs.TabPane tab="利润分析" key="3">
              <Card>
                <Space direction="vertical" style={{ width: '100%', marginBottom: '20px' }}>
                  <Radio.Group 
                    value={profitMode} 
                    onChange={e => setProfitMode(e.target.value)}
                    style={{ marginBottom: '10px' }}
                  >
                    <Radio.Button value="yearly">逐年利润</Radio.Button>
                    <Radio.Button value="cumulative">累计利润</Radio.Button>
                  </Radio.Group>
                  
                  <Radio.Group 
                    value={profitDisplayMode} 
                    onChange={e => setProfitDisplayMode(e.target.value)}
                  >
                    <Radio.Button value="amount">利润金额</Radio.Button>
                    <Radio.Button value="rate">回报率</Radio.Button>
                  </Radio.Group>
                </Space>
                
                <div style={{ height: '400px', width: '100%' }}>
                  <ReactECharts 
                    ref={profitChartRef}
                    option={getProfitChartOption(data, profitMode, profitDisplayMode) as EChartsOption}
                    style={{ height: '100%', width: '100%' }}
                    opts={{ renderer: 'svg' }}
                    notMerge={true}
                  />
                </div>
              </Card>
            </Tabs.TabPane>
          </Tabs>
          
          <Divider>计算结果</Divider>
          
          <Title level={4}>总资产</Title>
          <Row gutter={[16, 8]}>
            {data.sumOfFortunePerYear.map((item) => {
              const age = calculateAge(item.year);
              return (
                <Col key={item.year} span={8}>
                  <Text>
                    {item.year}年{age !== null ? ` (${age}岁)` : ''}: ¥{item.fortune.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                  </Text>
                </Col>
              );
            })}
          </Row>
          
          <Divider>投资与利润总览</Divider>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card title="总投入">
                <Title level={5}>¥{data.totalInvestment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Title>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="总利润">
                <Title level={5}>¥{data.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Title>
              </Card>
            </Col>
          </Row>
          
          <Divider>各投资详情</Divider>
          
          {data.OptionData.map(option => (
            <div key={option.id}>
              <Title level={5}>{option.name || '未命名投资'}</Title>
              <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
                <Col span={8}>
                  <Card title="总资产">
                    <Text>¥{option.fortunePerYear[option.fortunePerYear.length - 1].fortune.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card title="总投入">
                    <Text>¥{option.totalInvestment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card title="总利润">
                    <Text>¥{option.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                  </Card>
                </Col>
              </Row>
              <Row gutter={[16, 8]}>
                {option.fortunePerYear.map((item) => {
                  const age = calculateAge(item.year);
                  return (
                    <Col key={item.year} span={8}>
                      <Text>
                        {item.year}年{age !== null ? ` (${age}岁)` : ''}: ¥{item.fortune.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Text>
                    </Col>
                  );
                })}
              </Row>
            </div>
          ))}
        </Space>
      )}
    </>
  );
};

export default Graph; 