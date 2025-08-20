#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔒 开始安全检查...');

const issues = [];
let summary = { high: 0, medium: 0, low: 0 };

// 1. 检查敏感文件
console.log('\n📁 检查敏感文件...');
const sensitiveFiles = ['.env', '.env.local', 'config.json', 'secrets.json'];
sensitiveFiles.forEach(file => {
  if (fs.existsSync(file)) {
    issues.push({ type: '敏感文件', file, severity: 'medium', desc: `发现敏感文件: ${file}` });
    summary.medium++;
    console.log(`  ⚠️  发现: ${file}`);
  }
});

// 2. 检查.gitignore
console.log('\n📝 检查.gitignore...');
if (fs.existsSync('.gitignore')) {
  const gitignore = fs.readFileSync('.gitignore', 'utf8');
  const required = ['.env', 'node_modules', '*.log', 'dist'];
  const missing = required.filter(pattern => !gitignore.includes(pattern));
  
  if (missing.length > 0) {
    issues.push({ type: 'gitignore缺失', severity: 'low', desc: `缺少规则: ${missing.join(', ')}` });
    summary.low++;
    console.log(`  ⚠️  缺少规则: ${missing.join(', ')}`);
  }
} else {
  issues.push({ type: 'gitignore缺失', severity: 'medium', desc: '缺少.gitignore文件' });
  summary.medium++;
  console.log('  ⚠️  缺少.gitignore文件');
}

// 3. 检查package.json安全性
console.log('\n📦 检查依赖安全性...');
if (fs.existsSync('package.json')) {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // 检查React版本
  if (pkg.dependencies?.react) {
    const reactVersion = pkg.dependencies.react.replace(/[^0-9.]/g, '');
    if (reactVersion.startsWith('17.') || reactVersion.startsWith('16.')) {
      issues.push({ type: '过时依赖', severity: 'medium', desc: `React版本过旧: ${reactVersion}` });
      summary.medium++;
      console.log(`  ⚠️  React版本过旧: ${reactVersion}`);
    }
  }
}

// 4. 检查代码中的console.log
console.log('\n🔍 检查代码安全模式...');
function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir, { withFileTypes: true });
  files.forEach(file => {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory() && !file.name.includes('node_modules')) {
      scanDir(fullPath);
    } else if (file.name.match(/\.(ts|tsx|js|jsx)$/)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // 检查console.log
      const consoleMatches = content.match(/console\.log/g);
      if (consoleMatches && consoleMatches.length > 0) {
        issues.push({ 
          type: 'console.log泄露', 
          file: path.relative(process.cwd(), fullPath),
          severity: 'low', 
          desc: `发现${consoleMatches.length}个console.log` 
        });
        summary.low++;
      }
      
      // 检查eval使用
      if (content.includes('eval(')) {
        issues.push({ 
          type: 'eval风险', 
          file: path.relative(process.cwd(), fullPath),
          severity: 'high', 
          desc: '发现eval使用' 
        });
        summary.high++;
      }
    }
  });
}

scanDir('src');
scanDir('workers/src');

// 5. 生成报告
console.log('\n📊 安全检查结果:');
console.log(`  总问题: ${issues.length}`);
console.log(`  高危: ${summary.high}, 中危: ${summary.medium}, 低危: ${summary.low}`);

if (issues.length === 0) {
  console.log('\n✅ 安全检查通过！未发现重大问题。');
} else {
  console.log('\n📋 问题详情:');
  issues.forEach((issue, i) => {
    const icon = issue.severity === 'high' ? '🚨' : issue.severity === 'medium' ? '⚠️' : '💡';
    console.log(`  ${i+1}. ${icon} ${issue.desc}`);
    if (issue.file) console.log(`     文件: ${issue.file}`);
  });
}

console.log('\n🛡️  安全建议:');
console.log('  1. 🔐 确保敏感信息使用环境变量');
console.log('  2. 🌐 启用HTTPS和安全头');
console.log('  3. 📝 移除生产环境的console.log');
console.log('  4. 🔄 定期更新依赖包');
console.log('  5. 🛡️  实施代码审查流程');

// 保存简化报告
const report = { timestamp: new Date().toISOString(), summary, issues };
fs.writeFileSync('security-report.json', JSON.stringify(report, null, 2));
console.log('\n📋 报告已保存: security-report.json');
console.log('\n✅ 安全检查完成!');