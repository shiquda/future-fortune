import React, { useState, useEffect, useRef } from 'react'
import { Card, Typography, Space, Affix, Button, Tooltip } from 'antd'
import { UnorderedListOutlined, MenuFoldOutlined } from '@ant-design/icons'
import { theme } from 'antd'

const { Text } = Typography

interface TocItem {
  id: string
  text: string
  level: number
}

const TableOfContents: React.FC = () => {
  const { token } = theme.useToken()
  const [tocItems, setTocItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [collapsed, setCollapsed] = useState<boolean>(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const mutationObserverRef = useRef<MutationObserver | null>(null)

  // 生成目录项的唯一ID
  const generateId = (text: string): string => {
    return `toc-${text
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')}`
  }

  // 更新目录内容
  const updateTocItems = () => {
    // 查找所有标题元素
    const headings = Array.from(document.querySelectorAll('h3, h4'))

    // 为没有id的标题添加id
    headings.forEach((heading) => {
      if (!heading.id) {
        heading.id = generateId(heading.textContent || '')
      }
    })

    // 创建目录项
    const items: TocItem[] = headings.map((heading) => ({
      id: heading.id,
      text: heading.textContent || '',
      level: parseInt(heading.tagName.substring(1), 10),
    }))

    setTocItems(items)

    // 如果有新的标题元素，需要为它们添加观察器
    if (observerRef.current) {
      headings.forEach((heading) => {
        if (heading.id) {
          observerRef.current?.observe(heading)
        }
      })
    }
  }

  // 初始化目录和观察器
  useEffect(() => {
    // 设置交叉观察器来监听标题元素的可见性
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-100px 0px -80% 0px' },
    )
    observerRef.current = intersectionObserver

    // 设置 MutationObserver 来监听 DOM 变化
    const mutationObserver = new MutationObserver((mutations) => {
      let shouldUpdate = false

      mutations.forEach((mutation) => {
        // 检查是否有新增或删除的节点
        if (mutation.type === 'childList') {
          // 检查新增的节点中是否包含标题元素
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element
              if (element.tagName && /^H[1-5]$/i.test(element.tagName)) {
                shouldUpdate = true
              } else if (element.querySelector && element.querySelector('h1, h2, h3, h4, h5')) {
                shouldUpdate = true
              }
            }
          })

          // 检查删除的节点中是否包含标题元素
          mutation.removedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element
              if (element.tagName && /^H[1-5]$/i.test(element.tagName)) {
                shouldUpdate = true
              } else if (element.querySelector && element.querySelector('h1, h2, h3, h4, h5')) {
                shouldUpdate = true
              }
            }
          })
        }
        // 检查属性变化，特别是 id 属性
        else if (mutation.type === 'attributes' && mutation.attributeName === 'id') {
          const element = mutation.target as Element
          if (element.tagName && /^H[1-5]$/i.test(element.tagName)) {
            shouldUpdate = true
          }
        }
      })

      // 如果需要更新，则更新目录
      if (shouldUpdate) {
        updateTocItems()
      }
    })

    // 配置 MutationObserver 监听整个文档
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['id'],
    })

    mutationObserverRef.current = mutationObserver

    // 初始化目录
    updateTocItems()

    // 清理函数
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
      if (mutationObserverRef.current) {
        mutationObserverRef.current.disconnect()
      }
    }
  }, [])

  // 处理点击目录项
  const handleItemClick = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setActiveId(id)
    }
  }

  // 切换折叠状态
  const toggleCollapsed = () => {
    setCollapsed(!collapsed)
  }

  // 如果没有目录项，不显示组件
  if (tocItems.length === 0) {
    return null
  }

  // 折叠状态下只显示图标
  if (collapsed) {
    return (
      <Affix style={{ position: 'fixed', left: 20, top: 100, zIndex: 1000 }}>
        <Tooltip title="显示目录" placement="right">
          <Button
            type="primary"
            shape="circle"
            icon={<UnorderedListOutlined />}
            onClick={toggleCollapsed}
            size="large"
            style={{
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            }}
          />
        </Tooltip>
      </Affix>
    )
  }

  return (
    <Affix style={{ position: 'fixed', left: 20, top: 100, zIndex: 1000 }}>
      <Card
        title={
          <Space>
            <UnorderedListOutlined style={{ color: token.colorPrimary }} />
            <Text strong style={{ color: token.colorPrimary }}>
              目录
            </Text>
          </Space>
        }
        extra={
          <Tooltip title="隐藏目录">
            <Button type="text" icon={<MenuFoldOutlined />} onClick={toggleCollapsed} size="small" />
          </Tooltip>
        }
        style={{
          width: 200,
          maxHeight: '80vh',
          overflowY: 'auto',
          background: '#ffffff',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        }}
        bodyStyle={{ padding: '8px 12px' }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          {tocItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              style={{
                paddingLeft: `${(item.level - 1) * 12}px`,
                cursor: 'pointer',
                borderLeft: activeId === item.id ? `2px solid ${token.colorPrimary}` : '2px solid transparent',
                paddingTop: 4,
                paddingBottom: 4,
                paddingRight: 4,
                borderRadius: 2,
                backgroundColor: activeId === item.id ? token.colorBgTextHover : 'transparent',
                transition: 'all 0.3s',
              }}
            >
              <Text
                style={{
                  color: activeId === item.id ? token.colorPrimary : token.colorText,
                  fontWeight: activeId === item.id ? 'bold' : 'normal',
                }}
              >
                {item.text}
              </Text>
            </div>
          ))}
        </Space>
      </Card>
    </Affix>
  )
}

export default TableOfContents
