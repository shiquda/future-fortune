import React, { useState, useEffect, useRef } from 'react';
import { Button, Typography, Space, Divider, Row, Col } from 'antd';
import { calculateData } from '@/calculate';
import { InvestOption } from '@/types/invest';
import { Data } from '@/types/data';
import ReactECharts from 'echarts-for-react';
import { ExportOutlined } from '@ant-design/icons';
import type { EChartsInstance } from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

const { Text, Title } = Typography;

interface GraphProps {
  investOptions: InvestOption[];
}

const Graph: React.FC<GraphProps> = ({ investOptions }) => {
  const [data, setData] = useState<Data | null>(null);
  const chartRef = useRef<ReactECharts>(null);

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

  // 导出计算结果为CSV
  const handleExportCSV = () => {
    if (!data) return;

    // 创建总资产CSV内容
    const totalHeaders = ['年份', '总资产'];
    let csvContent = totalHeaders.join(',') + '\n';
    
    data.sumOfFortunePerYear.forEach(item => {
      csvContent += `${item.year},${item.fortune.toFixed(2)}\n`;
    });
    
    // 添加各投资选项的数据
    csvContent += '\n各投资选项详情\n';
    
    data.OptionData.forEach(option => {
      csvContent += `\n${option.name || '未命名投资'}\n`;
      csvContent += '年份,资产\n';
      
      option.fortunePerYear.forEach(item => {
        csvContent += `${item.year},${item.fortune.toFixed(2)}\n`;
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
          dataZoom: {},
          restore: {}
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: years,
        name: '年份'
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
          >
            导出
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
          
          <div style={{ height: '400px', width: '100%' }}>
            <ReactECharts 
              ref={chartRef}
              option={getChartOption(data) as EChartsOption}
              style={{ height: '100%', width: '100%' }}
              opts={{ renderer: 'svg' }}
              notMerge={true}
            />
          </div>
          
          <Divider>计算结果</Divider>
          
          <Title level={4}>总资产</Title>
          <Row gutter={[16, 8]}>
            {data.sumOfFortunePerYear.map((item) => (
              <Col key={item.year} span={8}>
                <Text>
                  {item.year}年: ¥{item.fortune.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                </Text>
              </Col>
            ))}
          </Row>
          
          <Divider>各投资详情</Divider>
          
          {data.OptionData.map((option) => (
            <div key={option.id}>
              <Title level={5}>{option.name || '未命名投资'}</Title>
              <Row gutter={[16, 8]}>
                {option.fortunePerYear.map((item) => (
                  <Col key={item.year} span={8}>
                    <Text>
                      {item.year}年: ¥{item.fortune.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                  </Col>
                ))}
              </Row>
            </div>
          ))}
        </Space>
      )}
    </>
  );
};

export default Graph; 