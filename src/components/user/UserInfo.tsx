import React, { useState, useEffect } from 'react';
import { Card, DatePicker, Typography, Space, Button } from 'antd';
import { UserOutlined, SaveOutlined } from '@ant-design/icons';
import { UserInfo } from '@/types/user';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface UserInfoProps {
  userInfo: UserInfo | null;
  onUserInfoChange: (userInfo: UserInfo) => void;
}

const UserInfoComponent: React.FC<UserInfoProps> = ({ userInfo, onUserInfoChange }) => {
  const [isEditing, setIsEditing] = useState<boolean>(!userInfo);
  const [birthYear, setBirthYear] = useState<number>(userInfo?.birthYear || new Date().getFullYear() - 30);

  useEffect(() => {
    if (userInfo) {
      setBirthYear(userInfo.birthYear);
    }
  }, [userInfo]);

  const handleSave = () => {
    onUserInfoChange({ birthYear });
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  return (
    <Card style={{ background: '#f5f8ff' }}>
      <Title level={3}>
        关于你 <UserOutlined />
      </Title>
      {isEditing ? (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text type="secondary">出生年份</Text>
            <DatePicker
              picker="year"
              style={{ width: '100%' }}
              value={dayjs().year(birthYear)}
              onChange={(date) => date && setBirthYear(date.year())}
            />
          </div>
          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={handleSave}
          >
            保存
          </Button>
        </Space>
      ) : (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text type="secondary">出生年份：</Text>
            <Text strong>{birthYear}</Text>
          </div>
          <div>
            <Text type="secondary">当前年龄：</Text>
            <Text strong>{new Date().getFullYear() - birthYear}岁</Text>
          </div>
          <Button 
            type="primary" 
            onClick={handleEdit}
          >
            编辑
          </Button>
        </Space>
      )}
    </Card>
  );
};

export default UserInfoComponent; 