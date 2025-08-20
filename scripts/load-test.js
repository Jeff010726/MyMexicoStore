#!/usr/bin/env node

const http = require('http');
const https = require('https');
const { URL } = require('url');

// 压力测试配置
const config = {
  baseUrl: 'http://localhost:5177',
  apiUrl: 'https://ecommerce-api.jeff010726bd.workers.dev',
  concurrent: 50,        // 并发用户数
  duration: 60,          // 测试持续时间（秒）
  rampUp: 10,           // 用户增长时间（秒）
  endpoints: [
    { path: '/', weight: 30, name: '首页' },
    { path: '/products', weight: 25, name: '商品列表' },
    { path: '/products/1', weight: 20, name: '商品详情' },
    { path: '/api/products', weight: 15, name: 'API商品列表' },
    { path: '/api/products/1', weight: 10, name: 'API商品详情' }
  ]
};

class LoadTester {
  constructor() {
    this.results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      errors: [],
      startTime: null,
      endTime: null,
      concurrentUsers: 0,
      maxConcurrentUsers: 0
    };
    
    this.activeRequests = new Set();
    this.isRunning = false;
  }

  // 发送HTTP请求
  async makeRequest(url, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const client = isHttps ? https : http;
      
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        timeout: timeout,
        headers: {
          'User-Agent': 'LoadTester/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive'
        }
      };

      const req = client.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          
          resolve({
            statusCode: res.statusCode,
            responseTime,
            contentLength: data.length,
            success: res.statusCode >= 200 && res.statusCode < 400
          });
        });
      });

      req.on('error', (error) => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        reject({
          error: error.message,
          responseTime,
          success: false
        });
      });

      req.on('timeout', () => {
        req.destroy();
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        reject({
          error: 'Request timeout',
          responseTime,
          success: false
        });
      });

      req.end();
    });
  }

  // 选择测试端点
  selectEndpoint() {
    const totalWeight = config.endpoints.reduce((sum, ep) => sum + ep.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const endpoint of config.endpoints) {
      random -= endpoint.weight;
      if (random <= 0) {
        return endpoint;
      }
    }
    
    return config.endpoints[0];
  }

  // 执行单个用户的测试
  async runUser(userId) {
    while (this.isRunning) {
      const endpoint = this.selectEndpoint();
      const isApi = endpoint.path.startsWith('/api');
      const baseUrl = isApi ? config.apiUrl : config.baseUrl;
      const url = baseUrl + endpoint.path;
      
      const requestId = `${userId}-${Date.now()}`;
      this.activeRequests.add(requestId);
      this.results.concurrentUsers++;
      this.results.maxConcurrentUsers = Math.max(
        this.results.maxConcurrentUsers, 
        this.results.concurrentUsers
      );

      try {
        this.results.totalRequests++;
        
        const result = await this.makeRequest(url);
        
        this.results.successfulRequests++;
        this.results.responseTimes.push(result.responseTime);
        
        console.log(`✅ ${endpoint.name} - ${result.statusCode} - ${result.responseTime}ms`);
        
      } catch (error) {
        this.results.failedRequests++;
        this.results.errors.push({
          endpoint: endpoint.name,
          url,
          error: error.error || error.message,
          time: new Date().toISOString()
        });
        
        console.log(`❌ ${endpoint.name} - ${error.error} - ${error.responseTime}ms`);
      }
      
      this.activeRequests.delete(requestId);
      this.results.concurrentUsers--;
      
      // 随机等待时间，模拟真实用户行为
      const thinkTime = Math.random() * 2000 + 500; // 0.5-2.5秒
      await new Promise(resolve => setTimeout(resolve, thinkTime));
    }
  }

  // 启动压力测试
  async start() {
    console.log('🚀 开始压力测试...');
    console.log(`目标: ${config.concurrent} 并发用户，持续 ${config.duration} 秒`);
    console.log(`前端地址: ${config.baseUrl}`);
    console.log(`API地址: ${config.apiUrl}`);
    console.log('');

    this.results.startTime = Date.now();
    this.isRunning = true;

    // 逐步增加用户数量
    const userPromises = [];
    const rampUpInterval = (config.rampUp * 1000) / config.concurrent;
    
    for (let i = 0; i < config.concurrent; i++) {
      setTimeout(() => {
        if (this.isRunning) {
          const userPromise = this.runUser(i + 1);
          userPromises.push(userPromise);
          console.log(`👤 启动用户 ${i + 1}/${config.concurrent}`);
        }
      }, i * rampUpInterval);
    }

    // 设置测试持续时间
    setTimeout(() => {
      this.stop();
    }, config.duration * 1000);

    // 等待所有用户完成
    await Promise.all(userPromises);
  }

  // 停止测试
  stop() {
    console.log('\n⏹️ 停止压力测试...');
    this.isRunning = false;
    this.results.endTime = Date.now();
    
    // 等待活跃请求完成
    setTimeout(() => {
      this.generateReport();
    }, 2000);
  }

  // 生成测试报告
  generateReport() {
    const duration = (this.results.endTime - this.results.startTime) / 1000;
    const rps = this.results.totalRequests / duration;
    const successRate = (this.results.successfulRequests / this.results.totalRequests) * 100;
    
    // 计算响应时间统计
    const sortedTimes = this.results.responseTimes.sort((a, b) => a - b);
    const avgResponseTime = sortedTimes.reduce((sum, time) => sum + time, 0) / sortedTimes.length;
    const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)];
    const p90 = sortedTimes[Math.floor(sortedTimes.length * 0.9)];
    const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
    const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)];
    const minTime = sortedTimes[0];
    const maxTime = sortedTimes[sortedTimes.length - 1];

    console.log('\n📊 压力测试报告');
    console.log('='.repeat(50));
    console.log(`测试持续时间: ${duration.toFixed(2)} 秒`);
    console.log(`总请求数: ${this.results.totalRequests}`);
    console.log(`成功请求: ${this.results.successfulRequests}`);
    console.log(`失败请求: ${this.results.failedRequests}`);
    console.log(`成功率: ${successRate.toFixed(2)}%`);
    console.log(`请求速率: ${rps.toFixed(2)} RPS`);
    console.log(`最大并发用户: ${this.results.maxConcurrentUsers}`);
    console.log('');
    
    console.log('⏱️ 响应时间统计 (ms)');
    console.log('-'.repeat(30));
    console.log(`平均响应时间: ${avgResponseTime.toFixed(2)}`);
    console.log(`最小响应时间: ${minTime}`);
    console.log(`最大响应时间: ${maxTime}`);
    console.log(`50% 百分位: ${p50}`);
    console.log(`90% 百分位: ${p90}`);
    console.log(`95% 百分位: ${p95}`);
    console.log(`99% 百分位: ${p99}`);
    console.log('');

    // 错误统计
    if (this.results.errors.length > 0) {
      console.log('❌ 错误统计');
      console.log('-'.repeat(30));
      
      const errorCounts = {};
      this.results.errors.forEach(error => {
        const key = `${error.endpoint}: ${error.error}`;
        errorCounts[key] = (errorCounts[key] || 0) + 1;
      });
      
      Object.entries(errorCounts).forEach(([error, count]) => {
        console.log(`${error}: ${count} 次`);
      });
      console.log('');
    }

    // 性能评估
    console.log('📈 性能评估');
    console.log('-'.repeat(30));
    
    if (successRate >= 99.5) {
      console.log('✅ 优秀 - 系统稳定性极佳');
    } else if (successRate >= 99) {
      console.log('✅ 良好 - 系统稳定性良好');
    } else if (successRate >= 95) {
      console.log('⚠️ 一般 - 需要优化系统稳定性');
    } else {
      console.log('❌ 较差 - 系统存在严重问题');
    }
    
    if (avgResponseTime <= 200) {
      console.log('✅ 优秀 - 响应时间很快');
    } else if (avgResponseTime <= 500) {
      console.log('✅ 良好 - 响应时间可接受');
    } else if (avgResponseTime <= 1000) {
      console.log('⚠️ 一般 - 响应时间需要优化');
    } else {
      console.log('❌ 较差 - 响应时间过慢');
    }

    // 优化建议
    console.log('\n💡 优化建议');
    console.log('-'.repeat(30));
    
    if (this.results.failedRequests > 0) {
      console.log('• 检查服务器错误日志，修复导致请求失败的问题');
    }
    
    if (avgResponseTime > 500) {
      console.log('• 启用缓存策略，减少数据库查询');
      console.log('• 优化数据库索引和查询语句');
      console.log('• 考虑使用CDN加速静态资源');
    }
    
    if (p95 > 1000) {
      console.log('• 优化慢查询，提升系统响应速度');
      console.log('• 增加服务器资源或使用负载均衡');
    }
    
    if (rps < 10) {
      console.log('• 系统吞吐量较低，考虑性能优化');
      console.log('• 检查是否存在性能瓶颈');
    }

    // 保存详细报告
    const report = {
      config,
      results: this.results,
      summary: {
        duration,
        rps,
        successRate,
        avgResponseTime,
        percentiles: { p50, p90, p95, p99 },
        minTime,
        maxTime
      },
      timestamp: new Date().toISOString()
    };
    
    const fs = require('fs');
    fs.writeFileSync('load-test-report.json', JSON.stringify(report, null, 2));
    console.log('\n📋 详细报告已保存: load-test-report.json');
  }
}

// 运行压力测试
if (require.main === module) {
  const tester = new LoadTester();
  
  // 处理中断信号
  process.on('SIGINT', () => {
    console.log('\n收到中断信号，正在停止测试...');
    tester.stop();
  });
  
  tester.start().catch(console.error);
}

module.exports = LoadTester;