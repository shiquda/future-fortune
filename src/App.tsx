import { AppstoreOutlined, LineChartOutlined, GithubOutlined } from '@ant-design/icons'
import { Layout, Typography, Space, Card, message, Button } from 'antd'
import { createFromIconfontCN } from '@ant-design/icons'
import { theme } from 'antd'
import InvestSettings from './components/invest/InvestSettings'
import UserInfoComponent from './components/user/UserInfo'
import Graph from './components/Graph'
import React, { useState, useEffect, useRef } from 'react'
import { InvestOption } from './types/invest'
import { UserInfo } from './types/user'
import { 
  saveInvestOptionsToStorage, 
  loadInvestOptionsFromStorage,
  saveUserInfoToStorage,
  loadUserInfoFromStorage
} from './utils/storage'

const IconFont = createFromIconfontCN({
  scriptUrl: ['//at.alicdn.com/t/c/font_4850965_42avixu03ue.js'],
})

const { Header, Content, Footer } = Layout
const { Title } = Typography

const App: React.FC = () => {
  const { token } = theme.useToken()
  const [investOptions, setInvestOptions] = useState<InvestOption[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const hasShownMessage = useRef(false);

  // 组件加载时从本地存储加载数据
  useEffect(() => {
    const savedOptions = loadInvestOptionsFromStorage();
    if (savedOptions && savedOptions.length > 0) {
      setInvestOptions(savedOptions);
    
      if (!hasShownMessage.current) {
        // messageApi.success('已加载保存的投资设置');
        hasShownMessage.current = true;
      }
    }

    const savedUserInfo = loadUserInfoFromStorage();
    if (savedUserInfo) {
      setUserInfo(savedUserInfo);
    }
  }, [messageApi]);

  const handleInvestOptionsChange = (newInvestOptions: InvestOption[]) => {
    setInvestOptions(newInvestOptions);
    // 当投资选项变化时保存到本地存储
    saveInvestOptionsToStorage(newInvestOptions);
  };

  const handleUserInfoChange = (newUserInfo: UserInfo) => {
    setUserInfo(newUserInfo);
    // 保存用户信息到本地存储
    saveUserInfoToStorage(newUserInfo);
    messageApi.success('已保存个人信息');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {contextHolder}
      <Header style={{ 
        background: token.colorBgLayout, 
        padding: '0 24px', 
        margin: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Title level={3} style={{ color: token.colorTextLightSolid, margin: 0 }}>
          <AppstoreOutlined style={{ color: token.colorTextLightSolid, fontSize: 24, marginRight: 8 }} /> Future Fortune
        </Title>
        <Button 
          type="link" 
          href="https://github.com/shiquda/future-fortune" 
          target="_blank"
          icon={<GithubOutlined style={{ fontSize: 24, color: token.colorTextLightSolid }} />}
          style={{ color: token.colorTextLightSolid }}
        />
      </Header>
      <Content style={{ padding: '24px 50px', background: token.colorBgLayout, margin: 0 }}>
        <Card style={{ 
          background: token.colorBgContainer, 
          padding: '24px', 
          margin: 0, 
          maxWidth: 1200, 
          marginLeft: 'auto', 
          marginRight: 'auto' 
        }}>
          <Title level={2}>计算你的未来财富</Title>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <UserInfoComponent 
              userInfo={userInfo}
              onUserInfoChange={handleUserInfoChange}
            />
            <Card style={{ background: '#f0f7ff' }}>
              <Title level={3}>
                投资 <IconFont type="icon-investment" />
              </Title>
              <InvestSettings
                investOptions={investOptions}
                onInvestOptionsChange={handleInvestOptionsChange}
              />
            </Card>
            <Card style={{ background: '#f6f6f6' }}>
              <Title level={3}>
                分析 <LineChartOutlined />
              </Title>
              <Graph investOptions={investOptions} userInfo={userInfo} />
            </Card>
          </Space>
        </Card>
      </Content>
      <Footer style={{ textAlign: 'center', color: 'white' }}>
        Future Fortune ©{new Date().getFullYear()} <br/>Created by <a href="https://github.com/shiquda" target="_blank">shiquda</a> with ❤️
      </Footer>
    </Layout>
  );
};

export default App;