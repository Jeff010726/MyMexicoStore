#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始优化构建...');

// 1. 清理旧的构建文件
console.log('📁 清理构建目录...');
try {
  execSync('rm -rf dist', { stdio: 'inherit' });
} catch (error) {
  // Windows环境使用rmdir
  try {
    execSync('rmdir /s /q dist', { stdio: 'inherit' });
  } catch (winError) {
    console.log('构建目录不存在或已清理');
  }
}

// 2. 设置环境变量
process.env.NODE_ENV = 'production';
process.env.VITE_BUILD_OPTIMIZE = 'true';

console.log('⚡ 执行优化构建...');

// 3. 执行构建
try {
  execSync('npm run build', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ 构建失败:', error.message);
  process.exit(1);
}

// 4. 分析构建结果
console.log('📊 分析构建结果...');

const distPath = path.join(process.cwd(), 'dist');
if (!fs.existsSync(distPath)) {
  console.error('❌ 构建目录不存在');
  process.exit(1);
}

// 获取文件大小统计
function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  return (stats.size / 1024).toFixed(2); // KB
}

function analyzeDirectory(dir, prefix = '') {
  const files = fs.readdirSync(dir);
  let totalSize = 0;
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      console.log(`${prefix}📁 ${file}/`);
      totalSize += analyzeDirectory(filePath, prefix + '  ');
    } else {
      const size = parseFloat(getFileSize(filePath));
      totalSize += size;
      
      let icon = '📄';
      if (file.endsWith('.js')) icon = '📜';
      else if (file.endsWith('.css')) icon = '🎨';
      else if (file.endsWith('.html')) icon = '🌐';
      else if (file.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) icon = '🖼️';
      
      console.log(`${prefix}${icon} ${file} (${size} KB)`);
    }
  });
  
  return totalSize;
}

const totalSize = analyzeDirectory(distPath);
console.log(`\n📦 总构建大小: ${totalSize.toFixed(2)} KB`);

// 5. 性能建议
console.log('\n💡 性能优化建议:');

// 检查大文件
const assetsPath = path.join(distPath, 'assets');
if (fs.existsSync(assetsPath)) {
  const assetFiles = fs.readdirSync(assetsPath);
  
  assetFiles.forEach(file => {
    const filePath = path.join(assetsPath, file);
    const size = parseFloat(getFileSize(filePath));
    
    if (file.endsWith('.js') && size > 500) {
      console.log(`⚠️  JavaScript文件过大: ${file} (${size} KB) - 建议代码分割`);
    }
    
    if (file.endsWith('.css') && size > 100) {
      console.log(`⚠️  CSS文件过大: ${file} (${size} KB) - 建议样式优化`);
    }
  });
}

// 6. 生成性能报告
const report = {
  buildTime: new Date().toISOString(),
  totalSize: `${totalSize.toFixed(2)} KB`,
  files: {},
  recommendations: []
};

// 递归收集文件信息
function collectFileInfo(dir, basePath = '') {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const relativePath = path.join(basePath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      collectFileInfo(filePath, relativePath);
    } else {
      const size = parseFloat(getFileSize(filePath));
      report.files[relativePath] = `${size} KB`;
      
      // 添加优化建议
      if (file.endsWith('.js') && size > 500) {
        report.recommendations.push(`优化 ${relativePath}: JavaScript文件过大，建议代码分割`);
      }
      if (file.endsWith('.css') && size > 100) {
        report.recommendations.push(`优化 ${relativePath}: CSS文件过大，建议样式优化`);
      }
      if (file.match(/\.(png|jpg|jpeg)$/) && size > 200) {
        report.recommendations.push(`优化 ${relativePath}: 图片文件过大，建议压缩或使用WebP格式`);
      }
    }
  });
}

collectFileInfo(distPath);

// 保存报告
const reportPath = path.join(process.cwd(), 'build-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`\n📋 构建报告已保存: ${reportPath}`);

// 7. 压缩建议
console.log('\n🗜️  部署优化建议:');
console.log('1. 启用Gzip/Brotli压缩');
console.log('2. 设置适当的缓存头');
console.log('3. 使用CDN加速静态资源');
console.log('4. 启用HTTP/2');

console.log('\n✅ 优化构建完成!');