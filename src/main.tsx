import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1890ff',      // 主色调
          colorBgLayout: '#1890ff',     // 布局背景色
          colorTextLightSolid: '#fff',  // 亮色背景上的文本颜色
          colorBgContainer: '#fff',     // 内容容器背景
          borderRadius: 6,              // 统一圆角
          colorLink: '#ffffff',         // 链接颜色
        },
        components: {
          Card: {
            colorBgContainer: '#f9f9f9', // 卡片默认背景色
            boxShadowTertiary: '0 1px 2px rgba(0, 0, 0, 0.1)' // 轻微阴影
          }
        }
      }}
    >
      <App />
    </ConfigProvider>
  </StrictMode>
)
