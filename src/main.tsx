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

// 添加额外的错误捕获
console.log('应用启动中...');

try {
  const root = ReactDOM.createRoot(document.getElementById('root')!);
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  console.log('React 应用渲染成功');
} catch (error) {
  console.error('React 应用启动失败:', error);
  
  // 显示友好的错误页面
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 20px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background-color: #f8f9fa;
      ">
        <div style="
          max-width: 600px;
          text-align: center;
          background: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        ">
          <h1 style="color: #dc3545; margin-bottom: 20px;">应用启动失败</h1>
          <p style="color: #6c757d; margin-bottom: 20px;">
            应用在启动过程中遇到了问题。请尝试以下解决方案：
          </p>
          <ul style="text-align: left; color: #495057; margin-bottom: 30px;">
            <li>刷新页面重试</li>
            <li>清除浏览器缓存</li>
            <li>检查网络连接</li>
            <li>如果问题持续存在，请联系技术支持</li>
          </ul>
          <button onclick="window.location.reload()" style="
            background-color: #007bff;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
          ">
            刷新页面
          </button>
          <div style="margin-top: 20px; font-size: 12px; color: #6c757d;">
            错误详情: ${error instanceof Error ? error.message : String(error)}
          </div>
        </div>
      </div>
    `;
  }
}
