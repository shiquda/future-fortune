import React from 'react';
import { Card, Space, Button, Input, InputNumber, DatePicker, Typography } from 'antd';
import { SaveOutlined, EditOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { InvestOption } from '@/types/invest';

const { Title, Text } = Typography;

interface InvestOptionProps {
  value: InvestOption;
  onChange: (newValue: InvestOption) => void;
  onDelete: (id: string) => void;
  onCopy: (option: InvestOption) => void;
}

const InvestOptionComponent: React.FC<InvestOptionProps> = ({ value, onChange, onCopy, onDelete }) => {
  const handleToggleEdit = () => {
    onChange({ 
      ...value, 
      isEditing: !value.isEditing 
    });
  };

  return (
    <Card
      extra={
        <Space>
          <Button
            type="text"
            icon={value.isEditing ? <SaveOutlined /> : <EditOutlined />}
            onClick={handleToggleEdit}
            title={value.isEditing ? "保存" : "编辑"}
          />
          <Button
            type="text"
            icon={<CopyOutlined />}
            onClick={() => onCopy(value)}
            title="复制"
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(value.id)}
            title="删除"
          />
        </Space>
      }
    >
      <Title level={4}>{value.name ? value.name : '未命名投资'}</Title>
      {value.isEditing ? (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text type="secondary">名称</Text>
            <Input
              placeholder="投资名称"
              value={value.name}
              onChange={e => onChange({ ...value, name: e.target.value })}
            />
          </div>
          <div>
            <Text type="secondary">初始投入金额</Text>
            <InputNumber
              prefix="¥"
              style={{ width: '100%' }}
              placeholder="初始投入金额"
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              value={value.initialAmount}
              onChange={v => onChange({ ...value, initialAmount: Number(v) })}
            />
          </div>
          <div>
            <Text type="secondary">每年投入金额</Text>
            <InputNumber
              prefix="¥"
              style={{ width: '100%' }}
              placeholder="每年投入金额"
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              value={value.amount}
              onChange={v => onChange({ ...value, amount: Number(v) })}
            />
          </div>
          <div>
            <Text type="secondary">预期年化收益率</Text>
            <InputNumber
              suffix="%"
              style={{ width: '100%' }}
              placeholder="预期年化收益率"
              min={0}
              max={100}
              precision={2}
              value={value.rate}
              onChange={v => onChange({ ...value, rate: Number(v) })}
            />
          </div>
          {/* <div>
            <Text type="secondary">预期年化收益率波动范围</Text>
            <InputNumber
              suffix="%"
              style={{ width: '100%' }}
              placeholder="预期年化收益率波动范围"
              min={0}
              max={100}
              precision={2}
              value={value.volatility}
              onChange={v => onChange({ ...value, volatility: Number(v) })}
            />
          </div> */}
          <div>
            <Text type="secondary">投资年限</Text>
            <DatePicker.RangePicker
              picker="year"
              style={{ width: '100%' }}
              placeholder={['开始年份', '结束年份']}
              value={[dayjs().year(value.startYear), dayjs().year(value.endYear)]}
              onChange={(_, dateStrings) =>
                onChange({
                  ...value,
                  startYear: parseInt(dateStrings[0]),
                  endYear: parseInt(dateStrings[1]),
                })
              }
            />
          </div>
          
          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={handleToggleEdit}
            block
          >
            保存
          </Button>

        </Space>
      ) : (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text type="secondary">名称：</Text>
            <Text strong>{value.name || '未命名投资'}</Text>
          </div>
          <div>
            <Text type="secondary">每年投入：</Text>
            <Text strong>¥{value.amount.toLocaleString()}</Text>
          </div>
          <div>
            <Text type="secondary">预期收益率：</Text>
            <Text strong>{value.rate}%</Text>
          </div>
          <div>
            <Text type="secondary">投资期限：</Text>
            <Text strong>{value.startYear} - {value.endYear}</Text>
          </div>
          <div>
            <Text type="secondary">初始投入：</Text>
            <Text strong>¥{value.initialAmount.toLocaleString()}</Text>
          </div>
        </Space>
      )}
    </Card>
  );
};

export default InvestOptionComponent; 