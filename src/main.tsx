import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initPerformanceMonitoring } from './utils/performanceInit'
import ErrorHandler from './utils/errorHandling'

// 初始化性能监控
initPerformanceMonitoring();

// 初始化错误处理器
ErrorHandler.init();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)