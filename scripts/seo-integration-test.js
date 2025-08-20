#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔍 开始SEO集成测试...');

// SEO集成测试
async function runSEOIntegrationTest() {
  const testResults = {
    timestamp: new Date().toISOString(),
    tests: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0
    }
  };

  // 测试1: 检查SEO配置文件
  console.log('\n📋 测试1: SEO配置文件检查');
  try {
    const seoConfigPath = path.join(process.cwd(), 'src/config/seo.ts');
    const seoConfig = fs.readFileSync(seoConfigPath, 'utf8');
    
    const requiredConfigs = [
      'SEO_CONFIG',
      'PAGES',
      'generateTitle',
      'generateDescription',
      'generateKeywords'
    ];
    
    const missingConfigs = requiredConfigs.filter(config => !seoConfig.includes(config));
    
    if (missingConfigs.length === 0) {
      console.log('  ✅ SEO配置文件完整');
      testResults.tests.push({
        name: 'SEO配置文件检查',
        status: 'passed',
        details: '所有必需配置项都存在'
      });
      testResults.summary.passed++;
    } else {
      console.log(`  ❌ 缺少配置: ${missingConfigs.join(', ')}`);
      testResults.tests.push({
        name: 'SEO配置文件检查',
        status: 'failed',
        details: `缺少配置: ${missingConfigs.join(', ')}`
      });
      testResults.summary.failed++;
    }
  } catch (error) {
    console.log('  ❌ SEO配置文件不存在或无法读取');
    testResults.tests.push({
      name: 'SEO配置文件检查',
      status: 'failed',
      details: '文件不存在或无法读取'
    });
    testResults.summary.failed++;
  }
  testResults.summary.total++;

  // 测试2: 检查SEO组件
  console.log('\n🧩 测试2: SEO组件功能检查');
  try {
    const seoHeadPath = path.join(process.cwd(), 'src/components/SEOHead.tsx');
    const seoHead = fs.readFileSync(seoHeadPath, 'utf8');
    
    const requiredFeatures = [
      'useEffect',
      'document.title',
      'og:title',
      'og:description',
      'twitter:card',
      'application/ld+json',
      'structuredData'
    ];
    
    const missingFeatures = requiredFeatures.filter(feature => !seoHead.includes(feature));
    
    if (missingFeatures.length === 0) {
      console.log('  ✅ SEO组件功能完整');
      testResults.tests.push({
        name: 'SEO组件功能检查',
        status: 'passed',
        details: '所有必需功能都存在'
      });
      testResults.summary.passed++;
    } else {
      console.log(`  ❌ 缺少功能: ${missingFeatures.join(', ')}`);
      testResults.tests.push({
        name: 'SEO组件功能检查',
        status: 'failed',
        details: `缺少功能: ${missingFeatures.join(', ')}`
      });
      testResults.summary.failed++;
    }
  } catch (error) {
    console.log('  ❌ SEO组件文件不存在或无法读取');
    testResults.tests.push({
      name: 'SEO组件功能检查',
      status: 'failed',
      details: '文件不存在或无法读取'
    });
    testResults.summary.failed++;
  }
  testResults.summary.total++;

  // 测试3: 检查robots.txt
  console.log('\n🤖 测试3: robots.txt检查');
  try {
    const robotsPath = path.join(process.cwd(), 'public/robots.txt');
    const robots = fs.readFileSync(robotsPath, 'utf8');
    
    const requiredRules = [
      'User-agent: *',
      'Disallow: /admin/',
      'Allow: /products/',
      'Sitemap:'
    ];
    
    const missingRules = requiredRules.filter(rule => !robots.includes(rule));
    
    if (missingRules.length === 0) {
      console.log('  ✅ robots.txt配置正确');
      testResults.tests.push({
        name: 'robots.txt检查',
        status: 'passed',
        details: '所有必需规则都存在'
      });
      testResults.summary.passed++;
    } else {
      console.log(`  ❌ 缺少规则: ${missingRules.join(', ')}`);
      testResults.tests.push({
        name: 'robots.txt检查',
        status: 'failed',
        details: `缺少规则: ${missingRules.join(', ')}`
      });
      testResults.summary.failed++;
    }
  } catch (error) {
    console.log('  ❌ robots.txt文件不存在或无法读取');
    testResults.tests.push({
      name: 'robots.txt检查',
      status: 'failed',
      details: '文件不存在或无法读取'
    });
    testResults.summary.failed++;
  }
  testResults.summary.total++;

  // 测试4: 检查sitemap.xml
  console.log('\n🗺️  测试4: sitemap.xml检查');
  try {
    const sitemapPath = path.join(process.cwd(), 'public/sitemap.xml');
    const sitemap = fs.readFileSync(sitemapPath, 'utf8');
    
    const requiredElements = [
      '<?xml version="1.0"',
      '<urlset xmlns=',
      '<url>',
      '<loc>',
      '<lastmod>',
      '<changefreq>',
      '<priority>'
    ];
    
    const missingElements = requiredElements.filter(element => !sitemap.includes(element));
    
    if (missingElements.length === 0) {
      const urlCount = (sitemap.match(/<url>/g) || []).length;
      console.log(`  ✅ sitemap.xml格式正确，包含 ${urlCount} 个URL`);
      testResults.tests.push({
        name: 'sitemap.xml检查',
        status: 'passed',
        details: `格式正确，包含 ${urlCount} 个URL`
      });
      testResults.summary.passed++;
    } else {
      console.log(`  ❌ 缺少元素: ${missingElements.join(', ')}`);
      testResults.tests.push({
        name: 'sitemap.xml检查',
        status: 'failed',
        details: `缺少元素: ${missingElements.join(', ')}`
      });
      testResults.summary.failed++;
    }
  } catch (error) {
    console.log('  ❌ sitemap.xml文件不存在或无法读取');
    testResults.tests.push({
      name: 'sitemap.xml检查',
      status: 'failed',
      details: '文件不存在或无法读取'
    });
    testResults.summary.failed++;
  }
  testResults.summary.total++;

  // 测试5: 检查页面SEO集成
  console.log('\n📄 测试5: 页面SEO集成检查');
  try {
    const pagesToCheck = [
      'src/pages/Home.tsx',
      'src/pages/Products.tsx',
      'src/pages/ProductDetail.tsx',
      'src/pages/Cart.tsx'
    ];
    
    let integratedPages = 0;
    let totalPages = pagesToCheck.length;
    
    for (const pagePath of pagesToCheck) {
      const fullPath = path.join(process.cwd(), pagePath);
      if (fs.existsSync(fullPath)) {
        const pageContent = fs.readFileSync(fullPath, 'utf8');
        if (pageContent.includes('SEOHead') || pageContent.includes('import SEOHead')) {
          integratedPages++;
          console.log(`    ✅ ${pagePath.split('/').pop()} - SEO已集成`);
        } else {
          console.log(`    ⚠️  ${pagePath.split('/').pop()} - SEO未集成`);
        }
      } else {
        console.log(`    ❌ ${pagePath.split('/').pop()} - 文件不存在`);
      }
    }
    
    if (integratedPages === totalPages) {
      console.log(`  ✅ 所有页面都已集成SEO (${integratedPages}/${totalPages})`);
      testResults.tests.push({
        name: '页面SEO集成检查',
        status: 'passed',
        details: `所有页面都已集成SEO (${integratedPages}/${totalPages})`
      });
      testResults.summary.passed++;
    } else {
      console.log(`  ⚠️  部分页面未集成SEO (${integratedPages}/${totalPages})`);
      testResults.tests.push({
        name: '页面SEO集成检查',
        status: 'failed',
        details: `部分页面未集成SEO (${integratedPages}/${totalPages})`
      });
      testResults.summary.failed++;
    }
  } catch (error) {
    console.log('  ❌ 页面SEO集成检查失败');
    testResults.tests.push({
      name: '页面SEO集成检查',
      status: 'failed',
      details: '检查过程中发生错误'
    });
    testResults.summary.failed++;
  }
  testResults.summary.total++;

  // 生成测试报告
  console.log('\n📊 生成SEO集成测试报告...');
  const reportPath = path.join(process.cwd(), 'seo-integration-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  
  // 显示测试结果摘要
  console.log('\n🔍 SEO集成测试结果摘要:');
  console.log(`  总测试数: ${testResults.summary.total}`);
  console.log(`  通过: ${testResults.summary.passed} ✅`);
  console.log(`  失败: ${testResults.summary.failed} ❌`);
  console.log(`  成功率: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(1)}%`);
  
  if (testResults.summary.failed === 0) {
    console.log('\n🎉 所有SEO测试通过！SEO优化已完成。');
  } else {
    console.log('\n⚠️  部分SEO测试失败，需要进一步优化。');
  }
  
  console.log(`\n📋 详细报告已保存: ${reportPath}`);
  
  // SEO优化建议
  console.log('\n💡 SEO优化建议:');
  console.log('  1. 定期更新sitemap.xml');
  console.log('  2. 监控搜索引擎收录情况');
  console.log('  3. 优化页面加载速度');
  console.log('  4. 添加更多结构化数据');
  console.log('  5. 优化图片alt标签');
  console.log('  6. 建立内部链接策略');
  console.log('  7. 创建高质量内容');
  console.log('  8. 监控关键词排名');
  console.log('  9. 优化移动端体验');
  console.log('  10. 建立外部链接');
  
  return testResults;
}

// 运行测试
runSEOIntegrationTest().catch(console.error);