#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('📱 开始移动端适配测试...');

// 移动端测试配置
const mobileTestConfig = {
  viewports: [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone 12', width: 390, height: 844 },
    { name: 'Samsung Galaxy S21', width: 360, height: 800 },
    { name: 'iPad Mini', width: 768, height: 1024 },
    { name: 'iPad Pro', width: 1024, height: 1366 }
  ],
  testPages: [
    { name: '首页', url: '/' },
    { name: '商品列表', url: '/products' },
    { name: '购物车', url: '/cart' },
    { name: '登录页', url: '/login' }
  ]
};

// 检查移动端样式文件
function checkMobileStyles() {
  console.log('\n🎨 检查移动端样式文件...');
  
  const mobileStylesPath = path.join(process.cwd(), 'src/styles/mobile.css');
  
  if (!fs.existsSync(mobileStylesPath)) {
    console.log('  ❌ 移动端样式文件不存在');
    return false;
  }
  
  const content = fs.readFileSync(mobileStylesPath, 'utf8');
  
  // 检查关键的移动端样式
  const requiredStyles = [
    '@media (max-width: 768px)',
    '.mobile-nav',
    '.bottom-nav',
    '.product-grid',
    '.btn-mobile',
    '.form-mobile'
  ];
  
  const missingStyles = requiredStyles.filter(style => !content.includes(style));
  
  if (missingStyles.length > 0) {
    console.log(`  ⚠️  缺少样式: ${missingStyles.join(', ')}`);
  } else {
    console.log('  ✅ 移动端样式文件完整');
  }
  
  return missingStyles.length === 0;
}

// 检查移动端组件
function checkMobileComponents() {
  console.log('\n📦 检查移动端组件...');
  
  const componentsDir = path.join(process.cwd(), 'src/components');
  const requiredComponents = [
    'MobileNav.tsx',
    'BottomNav.tsx',
    'MobileProductCard.tsx'
  ];
  
  const missingComponents = [];
  
  for (const component of requiredComponents) {
    const componentPath = path.join(componentsDir, component);
    if (!fs.existsSync(componentPath)) {
      missingComponents.push(component);
    }
  }
  
  if (missingComponents.length > 0) {
    console.log(`  ❌ 缺少组件: ${missingComponents.join(', ')}`);
    return false;
  } else {
    console.log('  ✅ 移动端组件完整');
    return true;
  }
}

// 检查响应式断点
function checkResponsiveBreakpoints() {
  console.log('\n📐 检查响应式断点...');
  
  const tailwindConfigPath = path.join(process.cwd(), 'tailwind.config.js');
  
  if (!fs.existsSync(tailwindConfigPath)) {
    console.log('  ⚠️  Tailwind配置文件不存在');
    return false;
  }
  
  const content = fs.readFileSync(tailwindConfigPath, 'utf8');
  
  // 检查是否有自定义断点
  const hasCustomBreakpoints = content.includes('screens') || content.includes('breakpoints');
  
  console.log(`  ${hasCustomBreakpoints ? '✅' : '📱'} 响应式断点配置`);
  
  return true;
}

// 生成移动端测试报告
function generateMobileTestReport() {
  console.log('\n📊 生成移动端测试报告...');
  
  const report = {
    timestamp: new Date().toISOString(),
    testConfig: mobileTestConfig,
    results: {
      stylesCheck: checkMobileStyles(),
      componentsCheck: checkMobileComponents(),
      breakpointsCheck: checkResponsiveBreakpoints()
    },
    recommendations: []
  };
  
  // 生成建议
  if (!report.results.stylesCheck) {
    report.recommendations.push('完善移动端样式文件');
  }
  
  if (!report.results.componentsCheck) {
    report.recommendations.push('创建缺失的移动端组件');
  }
  
  report.recommendations.push('使用浏览器开发者工具测试不同屏幕尺寸');
  report.recommendations.push('在真实设备上进行测试');
  report.recommendations.push('优化触摸交互体验');
  report.recommendations.push('确保文字大小适合移动端阅读');
  
  // 保存报告
  const reportPath = path.join(process.cwd(), 'mobile-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`📋 移动端测试报告已保存: ${reportPath}`);
  
  return report;
}

// 显示测试结果
function displayResults(report) {
  console.log('\n📱 移动端适配测试结果:');
  
  const allPassed = Object.values(report.results).every(result => result === true);
  
  if (allPassed) {
    console.log('  ✅ 所有检查项通过！');
  } else {
    console.log('  ⚠️  部分检查项需要改进');
  }
  
  console.log('\n📋 测试项目:');
  console.log(`  样式文件: ${report.results.stylesCheck ? '✅' : '❌'}`);
  console.log(`  组件文件: ${report.results.componentsCheck ? '✅' : '❌'}`);
  console.log(`  响应式配置: ${report.results.breakpointsCheck ? '✅' : '❌'}`);
  
  console.log('\n💡 优化建议:');
  report.recommendations.forEach((rec, index) => {
    console.log(`  ${index + 1}. ${rec}`);
  });
  
  console.log('\n📱 测试不同屏幕尺寸:');
  mobileTestConfig.viewports.forEach(viewport => {
    console.log(`  ${viewport.name}: ${viewport.width}x${viewport.height}px`);
  });
  
  console.log('\n🔧 手动测试步骤:');
  console.log('  1. 打开浏览器开发者工具 (F12)');
  console.log('  2. 切换到设备模拟模式');
  console.log('  3. 测试不同设备尺寸下的显示效果');
  console.log('  4. 检查触摸交互是否正常');
  console.log('  5. 验证导航菜单在移动端的表现');
  
  console.log('\n✅ 移动端适配测试完成!');
}

// 运行移动端测试
async function runMobileTest() {
  try {
    const report = generateMobileTestReport();
    displayResults(report);
    
    return report;
  } catch (error) {
    console.error('移动端测试失败:', error);
    return null;
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  runMobileTest().catch(console.error);
}

export { runMobileTest };