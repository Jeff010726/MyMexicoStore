#!/usr/bin/env node

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
    { name: 'Cart', url: '/cart' },
    { name: 'Login', url: '/login' }
  ],
  concurrentUsers: 10,
  iterations: 5
};

async function performanceTest(url, iterations = 5) {
  const results = [];
  
  for (let i = 0; i < iterations; i++) {
    const startTime = Date.now();
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Performance-Test-Bot/1.0'
        }
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      results.push({
        iteration: i + 1,
        responseTime,
        status: response.status,
        success: response.ok,
        timestamp: new Date().toISOString()
      });
      
      console.log(`  第 ${i + 1} 次请求: ${responseTime}ms (${response.status})`);
      
    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      results.push({
        iteration: i + 1,
        responseTime,
        error: error.message,
        success: false,
        timestamp: new Date().toISOString()
      });
      
      console.log(`  第 ${i + 1} 次请求失败: ${error.message}`);
    }
    
    // 间隔100ms避免过于频繁的请求
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
}

async function concurrentTest(url, concurrentUsers = 10) {
  console.log(`\n🚀 并发测试 ${concurrentUsers} 个用户访问: ${url}`);
  
  const promises = [];
  const startTime = Date.now();
  
  for (let i = 0; i < concurrentUsers; i++) {
    promises.push(
      fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': `Concurrent-Test-User-${i + 1}/1.0`
        }
      }).then(response => ({
        userId: i + 1,
        responseTime: Date.now() - startTime,
        status: response.status,
        success: response.ok
      })).catch(error => ({
        userId: i + 1,
        responseTime: Date.now() - startTime,
        error: error.message,
        success: false
      }))
    );
  }
  
  const results = await Promise.all(promises);
  const totalTime = Date.now() - startTime;
  
  const successCount = results.filter(r => r.success).length;
  const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
  
  console.log(`  总耗时: ${totalTime}ms`);
  console.log(`  成功率: ${successCount}/${concurrentUsers} (${(successCount/concurrentUsers*100).toFixed(1)}%)`);
  console.log(`  平均响应时间: ${avgResponseTime.toFixed(2)}ms`);
  
  return {
    totalTime,
    successRate: successCount / concurrentUsers,
    avgResponseTime,
    results
  };
}

async function runSimplePerformanceTest() {
  console.log('🚀 开始简化版性能测试...');
  console.log(`测试目标: ${config.baseUrl}`);
  
  const testResults = {
    testConfig: config,
    testTime: new Date().toISOString(),
    pageTests: [],
    concurrentTests: [],
    summary: {},
    recommendations: []
  };
  
  // 单页面性能测试
  for (const page of config.pages) {
    console.log(`\n📊 测试页面: ${page.name} (${page.url})`);
    
    const fullUrl = `${config.baseUrl}${page.url}`;
    const results = await performanceTest(fullUrl, config.iterations);
    
    const successResults = results.filter(r => r.success);
    const avgResponseTime = successResults.length > 0 
      ? successResults.reduce((sum, r) => sum + r.responseTime, 0) / successResults.length 
      : 0;
    
    const pageResult = {
      name: page.name,
      url: page.url,
      fullUrl,
      iterations: results,
      avgResponseTime,
      successRate: successResults.length / results.length,
      minResponseTime: successResults.length > 0 ? Math.min(...successResults.map(r => r.responseTime)) : 0,
      maxResponseTime: successResults.length > 0 ? Math.max(...successResults.map(r => r.responseTime)) : 0
    };
    
    testResults.pageTests.push(pageResult);
    
    console.log(`  平均响应时间: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`  成功率: ${(pageResult.successRate * 100).toFixed(1)}%`);
    
    // 并发测试
    const concurrentResult = await concurrentTest(fullUrl, config.concurrentUsers);
    testResults.concurrentTests.push({
      page: page.name,
      ...concurrentResult
    });
  }
  
  // 生成总结和建议
  testResults.summary = generateSummary(testResults);
  testResults.recommendations = generateRecommendations(testResults);
  
  // 保存报告
  const reportPath = path.join(process.cwd(), 'simple-performance-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  
  console.log(`\n📋 性能报告已保存: ${reportPath}`);
  
  // 输出总结
  console.log('\n📊 性能测试总结:');
  testResults.summary.pages.forEach(item => {
    console.log(`  ${item.page}: ${item.status} (平均 ${item.avgTime}ms, 成功率 ${item.successRate}%)`);
  });
  
  console.log('\n🔥 并发测试结果:');
  testResults.summary.concurrent.forEach(item => {
    console.log(`  ${item.page}: ${item.concurrentUsers}用户并发 - 成功率 ${item.successRate}%, 平均 ${item.avgTime}ms`);
  });
  
  console.log('\n💡 优化建议:');
  testResults.recommendations.forEach((rec, index) => {
    console.log(`  ${index + 1}. ${rec}`);
  });
  
  console.log('\n✅ 简化版性能测试完成!');
  
  return testResults;
}

function generateSummary(testResults) {
  const pages = testResults.pageTests.map(result => {
    let status = '✅ 良好';
    if (result.avgResponseTime > 2000) status = '❌ 需要优化';
    else if (result.avgResponseTime > 1000) status = '⚠️ 可以改进';
    
    return {
      page: result.name,
      status,
      avgTime: result.avgResponseTime.toFixed(2),
      successRate: (result.successRate * 100).toFixed(1)
    };
  });
  
  const concurrent = testResults.concurrentTests.map(result => ({
    page: result.page,
    concurrentUsers: config.concurrentUsers,
    successRate: (result.successRate * 100).toFixed(1),
    avgTime: result.avgResponseTime.toFixed(2)
  }));
  
  return { pages, concurrent };
}

function generateRecommendations(testResults) {
  const recommendations = [];
  
  // 分析页面性能
  testResults.pageTests.forEach(result => {
    if (result.avgResponseTime > 2000) {
      recommendations.push(`${result.name}页面响应时间过长 (${result.avgResponseTime.toFixed(2)}ms)，需要优化`);
    }
    
    if (result.successRate < 0.95) {
      recommendations.push(`${result.name}页面成功率较低 (${(result.successRate * 100).toFixed(1)}%)，需要检查稳定性`);
    }
  });
  
  // 分析并发性能
  const avgConcurrentSuccessRate = testResults.concurrentTests.reduce((sum, r) => sum + r.successRate, 0) / testResults.concurrentTests.length;
  if (avgConcurrentSuccessRate < 0.9) {
    recommendations.push(`并发测试成功率较低 (${(avgConcurrentSuccessRate * 100).toFixed(1)}%)，需要提升服务器处理能力`);
  }
  
  // 通用建议
  if (recommendations.length === 0) {
    recommendations.push('性能表现良好，继续保持！');
    recommendations.push('建议定期进行性能监控');
  } else {
    recommendations.push('启用CDN加速静态资源');
    recommendations.push('实施服务端缓存策略');
    recommendations.push('优化数据库查询性能');
    recommendations.push('考虑使用负载均衡');
  }
  
  return recommendations;
}

// 运行测试
runSimplePerformanceTest().catch(console.error);

export { runSimplePerformanceTest };