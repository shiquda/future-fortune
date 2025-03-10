import React from 'react';
import { Space, Button, Row, Col, message, Popconfirm } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import InvestOptionComponent from './InvestOption';
import { InvestOption } from '@/types/invest';
import { clearInvestOptionsFromStorage } from '@/utils/storage';
import { PlusOutlined, DeleteOutlined, ExportOutlined } from '@ant-design/icons';

interface InvestSettingsProps {
  investOptions: InvestOption[];
  onInvestOptionsChange: (options: InvestOption[]) => void;
}

const InvestSettings: React.FC<InvestSettingsProps> = ({ investOptions, onInvestOptionsChange }) => {
  const [messageApi, contextHolder] = message.useMessage();

  const handleAddOption = () => {
    const newOption: InvestOption = {
      id: uuidv4(),
      name: '',
      amount: 0,
      initialAmount: 0,
      rate: 0,
      volatility: 0,
      startYear: new Date().getFullYear(),
      endYear: new Date().getFullYear() + 10,
      isEditing: true,
    };
    onInvestOptionsChange([...investOptions, newOption]);
  };

  const handleDeleteOption = (id: string) => {
    const updatedOptions = investOptions.filter(option => option.id !== id);
    onInvestOptionsChange(updatedOptions);
  };

  const handleClear = () => {
    onInvestOptionsChange([]);
    clearInvestOptionsFromStorage();
    messageApi.success('已清除！');
  };

  const handleChangeOption = (index: number, newOption: InvestOption) => {
    const newOptions = [...investOptions];
    newOptions[index] = newOption;
    onInvestOptionsChange(newOptions);
  };

  const handleCreateDuplicateOption = (option: InvestOption) => {
    const newOption: InvestOption = {
      ...option,
      id: uuidv4(),
      isEditing: true,
    };
    onInvestOptionsChange([...investOptions, newOption]);
  };

  const handleExportCSV = () => {
    if (investOptions.length === 0) {
      messageApi.warning('没有可导出的投资选项！');
      return;
    }

    // 创建CSV内容
    const headers = ['名称', '初始投入金额', '每年投入金额', '预期年化收益率', '开始年份', '结束年份'];
    const csvContent = [
      headers.join(','),
      ...investOptions.map(option => [
        option.name || '未命名投资',
        option.initialAmount,
        option.amount,
        option.rate,
        option.startYear,
        option.endYear
      ].join(','))
    ].join('\n');

    // 创建Blob对象
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // 创建下载链接
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // 设置下载属性
    link.setAttribute('href', url);
    link.setAttribute('download', `投资选项_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    
    // 添加到DOM并触发下载
    document.body.appendChild(link);
    link.click();
    
    // 清理
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    messageApi.success('导出成功！');
  };

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      {contextHolder}
      <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
        <Popconfirm
          title="确认清除"
          description="确定要清除所有投资选项吗？"
          onConfirm={handleClear}
          okText="确定"
          cancelText="取消"
        >
          <Button danger type="primary" size="large" icon={<DeleteOutlined />}>
            清除
          </Button>
        </Popconfirm>
        <Button onClick={handleExportCSV} type="primary" size="large" icon={<ExportOutlined />}>
          导出
        </Button>
        <Button onClick={handleAddOption} type="primary" size="large" icon={<PlusOutlined />}>
          添加
        </Button>
      </Space>
      <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
        <Row gutter={[32, 32]}>
          {investOptions.map((option, index) => (
            <Col key={option.id} span={8}>
              <InvestOptionComponent
                value={option}
                onChange={(newOption) => handleChangeOption(index, newOption)}
                onDelete={handleDeleteOption}
                onCopy={(option) => handleCreateDuplicateOption(option)}
              />
            </Col>
          ))}
        </Row>
      </div>
    </Space>
  );
};

export default InvestSettings; 