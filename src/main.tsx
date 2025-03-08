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
          colorLink: '#1890ff',         // 链接颜色
          red: '#ff4d4f'
        },
      }}
    >
      <App />
    </ConfigProvider>
  </StrictMode>
)
