import { AppstoreOutlined, LineChartOutlined } from '@ant-design/icons'
import { Layout, Typography, Space, Card, message } from 'antd'
import { createFromIconfontCN } from '@ant-design/icons'
import { theme } from 'antd'
import InvestSettings from './components/invest/InvestSettings'
import Graph from './components/Graph'
import React, { useState, useEffect, useRef } from 'react'
import { InvestOption } from './types/invest'
import { saveInvestOptionsToStorage, loadInvestOptionsFromStorage } from './utils/storage'

const IconFont = createFromIconfontCN({
  scriptUrl: ['//at.alicdn.com/t/c/font_4850965_42avixu03ue.js'],
})

const { Header, Content, Footer } = Layout
const { Title } = Typography

const App: React.FC = () => {
  const { token } = theme.useToken()
  const [investOptions, setInvestOptions] = useState<InvestOption[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const hasShownMessage = useRef(false);

  // 组件加载时从本地存储加载数据
  useEffect(() => {
    const savedOptions = loadInvestOptionsFromStorage();
    if (savedOptions && savedOptions.length > 0) {
      setInvestOptions(savedOptions);
    
      if (!hasShownMessage.current) {
        messageApi.success('已加载保存的投资设置');
        hasShownMessage.current = true;
      }
    }
  }, [messageApi]);

  const handleInvestOptionsChange = (newInvestOptions: InvestOption[]) => {
    setInvestOptions(newInvestOptions);
    // 当投资选项变化时保存到本地存储
    saveInvestOptionsToStorage(newInvestOptions);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {contextHolder}
      <Header style={{ background: token.colorBgLayout, padding: '0 24px', margin: 0 }}>
        <Title level={3} style={{ color: token.colorTextLightSolid, margin: 0 }}>
          <AppstoreOutlined style={{ color: token.colorTextLightSolid, fontSize: 24, marginRight: 8 }} /> Future Fortune
        </Title>
      </Header>
      <Content style={{ padding: '24px 50px', background: token.colorBgLayout, margin: 0 }}>
        <Card style={{ background: token.colorBgContainer, padding: '24px', margin: 0, maxWidth: 1200, marginLeft: 'auto', marginRight: 'auto' }}>
          <Title level={2}>计算你的未来财富</Title>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card>
              <Title level={3}>
                投资 <IconFont type="icon-investment" />
              </Title>
              <InvestSettings
                investOptions={investOptions}
                onInvestOptionsChange={handleInvestOptionsChange}
              />
            </Card>
            <Card>
              <Title level={3}>
                图表 <LineChartOutlined />
              </Title>
              <Graph investOptions={investOptions} />
            </Card>
          </Space>
        </Card>
      </Content>
      <Footer style={{ textAlign: 'center', background: token.colorBgLayout, color: token.colorText, margin: 0, padding: '24px 0' }}>
        Future Fortune ©2024 Created by shiquda
      </Footer>
    </Layout>
  )
}

export default App