#!/usr/bin/env node

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 性能测试配置
const config = {
  baseUrl: 'http://localhost:5177',
  pages: [
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' },
    { name: 'Product Detail', url: '/products/1' },
    { name: 'Cart', url: '/cart' },
    { name: 'Login', url: '/login' }
  ],
  iterations: 3,
  timeout: 30000
};

async function runPerformanceTest() {
  console.log('🚀 开始性能测试...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const results = [];
  
  for (const page of config.pages) {
    console.log(`\n📊 测试页面: ${page.name} (${page.url})`);
    
    const pageResults = {
      name: page.name,
      url: page.url,
      iterations: [],
      average: {}
    };
    
    for (let i = 0; i < config.iterations; i++) {
      console.log(`  第 ${i + 1} 次测试...`);
      
      const testPage = await browser.newPage();
      
      // 启用性能监控
      await testPage.setCacheEnabled(false);
      await testPage.setViewport({ width: 1920, height: 1080 });
      
      // 开始性能测量
      const startTime = Date.now();
      
      try {
        // 导航到页面
        const response = await testPage.goto(`${config.baseUrl}${page.url}`, {
          waitUntil: 'networkidle0',
          timeout: config.timeout
        });
        
        if (!response.ok()) {
          throw new Error(`HTTP ${response.status()}: ${response.statusText()}`);
        }
        
        // 等待页面完全加载
        await testPage.waitForTimeout(2000);
        
        // 获取性能指标
        const metrics = await testPage.evaluate(() => {
          const navigation = performance.getEntriesByType('navigation')[0];
          const paint = performance.getEntriesByType('paint');
          
          return {
            // 导航时间
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            
            // 网络时间
            dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
            tcpConnect: navigation.connectEnd - navigation.connectStart,
            requestResponse: navigation.responseEnd - navigation.requestStart,
            
            // 渲染时间
            domProcessing: navigation.domComplete - navigation.domLoading,
            
            // Paint时间
            firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
            firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
            
            // 资源统计
            totalResources: performance.getEntriesByType('resource').length,
            
            // DOM统计
            domNodes: document.querySelectorAll('*').length,
            
            // 内存使用（如果可用）
            memoryUsed: performance.memory ? performance.memory.usedJSHeapSize : 0
          };
        });
        
        const totalTime = Date.now() - startTime;
        
        const iteration = {
          iteration: i + 1,
          totalTime,
          ...metrics,
          timestamp: new Date().toISOString()
        };
        
        pageResults.iterations.push(iteration);
        
        console.log(`    总时间: ${totalTime}ms`);
        console.log(`    DOM加载: ${metrics.domContentLoaded.toFixed(2)}ms`);
        console.log(`    首次绘制: ${metrics.firstPaint.toFixed(2)}ms`);
        console.log(`    首次内容绘制: ${metrics.firstContentfulPaint.toFixed(2)}ms`);
        
      } catch (error) {
        console.error(`    ❌ 测试失败: ${error.message}`);
        pageResults.iterations.push({
          iteration: i + 1,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
      
      await testPage.close();
    }
    
    // 计算平均值
    const validIterations = pageResults.iterations.filter(iter => !iter.error);
    if (validIterations.length > 0) {
      const avg = (field) => {
        const values = validIterations.map(iter => iter[field]).filter(v => v !== undefined);
        return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
      };
      
      pageResults.average = {
        totalTime: avg('totalTime'),
        domContentLoaded: avg('domContentLoaded'),
        loadComplete: avg('loadComplete'),
        dnsLookup: avg('dnsLookup'),
        tcpConnect: avg('tcpConnect'),
        requestResponse: avg('requestResponse'),
        domProcessing: avg('domProcessing'),
        firstPaint: avg('firstPaint'),
        firstContentfulPaint: avg('firstContentfulPaint'),
        totalResources: avg('totalResources'),
        domNodes: avg('domNodes'),
        memoryUsed: avg('memoryUsed')
      };
      
      console.log(`\n  📈 平均性能指标:`);
      console.log(`    总时间: ${pageResults.average.totalTime.toFixed(2)}ms`);
      console.log(`    DOM加载: ${pageResults.average.domContentLoaded.toFixed(2)}ms`);
      console.log(`    首次绘制: ${pageResults.average.firstPaint.toFixed(2)}ms`);
      console.log(`    首次内容绘制: ${pageResults.average.firstContentfulPaint.toFixed(2)}ms`);
      console.log(`    资源数量: ${pageResults.average.totalResources.toFixed(0)}`);
      console.log(`    DOM节点: ${pageResults.average.domNodes.toFixed(0)}`);
    }
    
    results.push(pageResults);
  }
  
  await browser.close();
  
  // 生成性能报告
  const report = {
    testConfig: config,
    testTime: new Date().toISOString(),
    results,
    summary: generateSummary(results),
    recommendations: generateRecommendations(results)
  };
  
  // 保存报告
  const reportPath = path.join(process.cwd(), 'performance-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n📋 性能报告已保存: ${reportPath}`);
  
  // 输出总结
  console.log('\n📊 性能测试总结:');
  report.summary.forEach(item => {
    console.log(`  ${item.page}: ${item.status} (平均 ${item.avgTime}ms)`);
  });
  
  console.log('\n💡 优化建议:');
  report.recommendations.forEach((rec, index) => {
    console.log(`  ${index + 1}. ${rec}`);
  });
  
  console.log('\n✅ 性能测试完成!');
}

function generateSummary(results) {
  return results.map(result => {
    const validIterations = result.iterations.filter(iter => !iter.error);
    const avgTime = validIterations.length > 0 ? 
      validIterations.reduce((sum, iter) => sum + iter.totalTime, 0) / validIterations.length : 0;
    
    let status = '✅ 良好';
    if (avgTime > 3000) status = '❌ 需要优化';
    else if (avgTime > 1500) status = '⚠️ 可以改进';
    
    return {
      page: result.name,
      status,
      avgTime: avgTime.toFixed(2),
      successRate: `${validIterations.length}/${result.iterations.length}`
    };
  });
}

function generateRecommendations(results) {
  const recommendations = [];
  
  results.forEach(result => {
    if (result.average) {
      const avg = result.average;
      
      if (avg.totalTime > 3000) {
        recommendations.push(`${result.name}页面加载时间过长 (${avg.totalTime.toFixed(2)}ms)，需要优化`);
      }
      
      if (avg.firstContentfulPaint > 2500) {
        recommendations.push(`${result.name}页面首次内容绘制时间过长，建议优化关键渲染路径`);
      }
      
      if (avg.totalResources > 50) {
        recommendations.push(`${result.name}页面资源数量过多 (${avg.totalResources.toFixed(0)})，建议合并资源`);
      }
      
      if (avg.domNodes > 1500) {
        recommendations.push(`${result.name}页面DOM节点过多 (${avg.domNodes.toFixed(0)})，建议简化DOM结构`);
      }
      
      if (avg.requestResponse > 1000) {
        recommendations.push(`${result.name}页面网络请求时间过长，建议优化API响应时间`);
      }
    }
  });
  
  // 通用建议
  if (recommendations.length === 0) {
    recommendations.push('性能表现良好，继续保持！');
  } else {
    recommendations.push('启用Gzip压缩和浏览器缓存');
    recommendations.push('使用CDN加速静态资源');
    recommendations.push('实施代码分割和懒加载');
    recommendations.push('优化图片格式和大小');
  }
  
  return recommendations;
}

// 运行测试
runPerformanceTest().catch(console.error);

export { runPerformanceTest };