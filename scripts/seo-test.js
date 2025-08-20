#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔍 开始SEO优化测试...');

// SEO测试配置
const seoTestConfig = {
  requiredFiles: [
    'public/robots.txt',
    'public/sitemap.xml',
    'src/components/SEOHead.tsx',
    'src/config/seo.ts'
  ],
  testPages: [
    { name: '首页', path: '/', expectedTitle: 'MyMexico Store' },
    { name: '商品页', path: '/products', expectedTitle: '商品列表' },
    { name: '购物车', path: '/cart', expectedTitle: '购物车' },
    { name: '登录页', path: '/login', expectedTitle: '用户登录' }
  ]
};

// 检查SEO相关文件
function checkSEOFiles() {
  console.log('\n📁 检查SEO相关文件...');
  
  const missingFiles = [];
  const existingFiles = [];
  
  for (const file of seoTestConfig.requiredFiles) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      existingFiles.push(file);
      console.log(`  ✅ ${file}`);
    } else {
      missingFiles.push(file);
      console.log(`  ❌ ${file} - 文件不存在`);
    }
  }
  
  return {
    total: seoTestConfig.requiredFiles.length,
    existing: existingFiles.length,
    missing: missingFiles.length,
    missingFiles
  };
}

// 检查robots.txt内容
function checkRobotsTxt() {
  console.log('\n🤖 检查robots.txt内容...');
  
  const robotsPath = path.join(process.cwd(), 'public/robots.txt');
  
  if (!fs.existsSync(robotsPath)) {
    console.log('  ❌ robots.txt文件不存在');
    return false;
  }
  
  const content = fs.readFileSync(robotsPath, 'utf8');
  
  const requiredRules = [
    'User-agent: *',
    'Disallow: /admin/',
    'Allow: /products/',
    'Sitemap:'
  ];
  
  const missingRules = requiredRules.filter(rule => !content.includes(rule));
  
  if (missingRules.length === 0) {
    console.log('  ✅ robots.txt内容完整');
    return true;
  } else {
    console.log(`  ⚠️  缺少规则: ${missingRules.join(', ')}`);
    return false;
  }
}

// 检查sitemap.xml内容
function checkSitemapXml() {
  console.log('\n🗺️  检查sitemap.xml内容...');
  
  const sitemapPath = path.join(process.cwd(), 'public/sitemap.xml');
  
  if (!fs.existsSync(sitemapPath)) {
    console.log('  ❌ sitemap.xml文件不存在');
    return false;
  }
  
  const content = fs.readFileSync(sitemapPath, 'utf8');
  
  const requiredElements = [
    '<?xml version="1.0"',
    '<urlset xmlns=',
    '<url>',
    '<loc>',
    '<lastmod>',
    '<changefreq>',
    '<priority>'
  ];
  
  const missingElements = requiredElements.filter(element => !content.includes(element));
  
  if (missingElements.length === 0) {
    console.log('  ✅ sitemap.xml格式正确');
    
    // 统计URL数量
    const urlCount = (content.match(/<url>/g) || []).length;
    console.log(`  📊 包含 ${urlCount} 个URL`);
    
    return true;
  } else {
    console.log(`  ⚠️  缺少元素: ${missingElements.join(', ')}`);
    return false;
  }
}

// 检查SEO组件
function checkSEOComponent() {
  console.log('\n🧩 检查SEO组件...');
  
  const seoHeadPath = path.join(process.cwd(), 'src/components/SEOHead.tsx');
  
  if (!fs.existsSync(seoHeadPath)) {
    console.log('  ❌ SEOHead组件不存在');
    return false;
  }
  
  const content = fs.readFileSync(seoHeadPath, 'utf8');
  
  const requiredFeatures = [
    'document.title',
    'og:title',
    'og:description',
    'og:image',
    'twitter:card',
    'application/ld+json'
  ];
  
  const missingFeatures = requiredFeatures.filter(feature => !content.includes(feature));
  
  if (missingFeatures.length === 0) {
    console.log('  ✅ SEO组件功能完整');
    return true;
  } else {
    console.log(`  ⚠️  缺少功能: ${missingFeatures.join(', ')}`);
    return false;
  }
}

// 检查SEO配置
function checkSEOConfig() {
  console.log('\n⚙️  检查SEO配置...');
  
  const seoConfigPath = path.join(process.cwd(), 'src/config/seo.ts');
  
  if (!fs.existsSync(seoConfigPath)) {
    console.log('  ❌ SEO配置文件不存在');
    return false;
  }
  
  const content = fs.readFileSync(seoConfigPath, 'utf8');
  
  const requiredConfigs = [
    'SEO_CONFIG',
    'PAGES',
    'PRODUCT',
    'CATEGORY',
    'generateTitle',
    'generateDescription'
  ];
  
  const missingConfigs = requiredConfigs.filter(config => !content.includes(config));
  
  if (missingConfigs.length === 0) {
    console.log('  ✅ SEO配置完整');
    return true;
  } else {
    console.log(`  ⚠️  缺少配置: ${missingConfigs.join(', ')}`);
    return false;
  }
}

// 生成SEO测试报告
function generateSEOTestReport() {
  console.log('\n📊 生成SEO测试报告...');
  
  const fileCheck = checkSEOFiles();
  const robotsCheck = checkRobotsTxt();
  const sitemapCheck = checkSitemapXml();
  const componentCheck = checkSEOComponent();
  const configCheck = checkSEOConfig();
  
  const report = {
    timestamp: new Date().toISOString(),
    testResults: {
      files: {
        total: fileCheck.total,
        existing: fileCheck.existing,
        missing: fileCheck.missing,
        missingFiles: fileCheck.missingFiles,
        passed: fileCheck.missing === 0
      },
      robotsTxt: {
        exists: fs.existsSync(path.join(process.cwd(), 'public/robots.txt')),
        valid: robotsCheck,
        passed: robotsCheck
      },
      sitemapXml: {
        exists: fs.existsSync(path.join(process.cwd(), 'public/sitemap.xml')),
        valid: sitemapCheck,
        passed: sitemapCheck
      },
      seoComponent: {
        exists: fs.existsSync(path.join(process.cwd(), 'src/components/SEOHead.tsx')),
        valid: componentCheck,
        passed: componentCheck
      },
      seoConfig: {
        exists: fs.existsSync(path.join(process.cwd(), 'src/config/seo.ts')),
        valid: configCheck,
        passed: configCheck
      }
    },
    recommendations: []
  };
  
  // 生成建议
  if (!report.testResults.files.passed) {
    report.recommendations.push('创建缺失的SEO相关文件');
  }
  
  if (!report.testResults.robotsTxt.passed) {
    report.recommendations.push('完善robots.txt文件内容');
  }
  
  if (!report.testResults.sitemapXml.passed) {
    report.recommendations.push('修复sitemap.xml格式问题');
  }
  
  if (!report.testResults.seoComponent.passed) {
    report.recommendations.push('完善SEO组件功能');
  }
  
  if (!report.testResults.seoConfig.passed) {
    report.recommendations.push('完善SEO配置文件');
  }
  
  // 通用建议
  report.recommendations.push('定期更新sitemap.xml');
  report.recommendations.push('监控搜索引擎收录情况');
  report.recommendations.push('优化页面加载速度');
  report.recommendations.push('添加结构化数据');
  report.recommendations.push('优化图片alt标签');
  
  // 保存报告
  const reportPath = path.join(process.cwd(), 'seo-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`📋 SEO测试报告已保存: ${reportPath}`);
  
  return report;
}

// 显示测试结果
function displayResults(report) {
  console.log('\n🔍 SEO优化测试结果:');
  
  const allPassed = Object.values(report.testResults).every(result => result.passed === true);
  
  if (allPassed) {
    console.log('  ✅ 所有SEO检查项通过！');
  } else {
    console.log('  ⚠️  部分SEO检查项需要改进');
  }
  
  console.log('\n📋 测试项目:');
  console.log(`  文件检查: ${report.testResults.files.passed ? '✅' : '❌'} (${report.testResults.files.existing}/${report.testResults.files.total})`);
  console.log(`  robots.txt: ${report.testResults.robotsTxt.passed ? '✅' : '❌'}`);
  console.log(`  sitemap.xml: ${report.testResults.sitemapXml.passed ? '✅' : '❌'}`);
  console.log(`  SEO组件: ${report.testResults.seoComponent.passed ? '✅' : '❌'}`);
  console.log(`  SEO配置: ${report.testResults.seoConfig.passed ? '✅' : '❌'}`);
  
  console.log('\n💡 优化建议:');
  report.recommendations.forEach((rec, index) => {
    console.log(`  ${index + 1}. ${rec}`);
  });
  
  console.log('\n🔧 SEO检查清单:');
  console.log('  □ 页面标题优化（50-60字符）');
  console.log('  □ 页面描述优化（150-160字符）');
  console.log('  □ 关键词研究和优化');
  console.log('  □ Open Graph标签设置');
  console.log('  □ Twitter Card设置');
  console.log('  □ 结构化数据添加');
  console.log('  □ 图片alt标签优化');
  console.log('  □ 内部链接优化');
  console.log('  □ 页面加载速度优化');
  console.log('  □ 移动端友好性');
  
  console.log('\n✅ SEO优化测试完成!');
}

// 运行SEO测试
async function runSEOTest() {
  try {
    const report = generateSEOTestReport();
    displayResults(report);
    
    return report;
  } catch (error) {
    console.error('SEO测试失败:', error);
    return null;
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  runSEOTest().catch(console.error);
}

export { runSEOTest };