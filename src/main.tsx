import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initPerformanceMonitoring } from './utils/performanceInit'

// 初始化性能监控
initPerformanceMonitoring();

// 处理GitHub Pages路由
// 检查URL中是否有路由参数
const handleGitHubPagesRouting = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const path = queryParams.get('p');
  
  if (path) {
    // 移除查询参数并设置正确的路径
    window.history.replaceState(null, '', path);
  }
};

// 在渲染前处理路由
handleGitHubPagesRouting();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)