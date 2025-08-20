#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 安全检查配置
const securityConfig = {
  // 敏感文件检查
  sensitiveFiles: [
    '.env',
    '.env.local',
    '.env.production',
    'config.json',
    'secrets.json',
    'private.key',
    'id_rsa',
    'database.sqlite'
  ],
  
  // 危险依赖检查
  vulnerableDependencies: [
    'lodash@4.17.20',
    'axios@0.21.0',
    'node-fetch@2.6.6'
  ],
  
  // 安全头检查
  securityHeaders: [
    'Content-Security-Policy',
    'X-Frame-Options',
    'X-Content-Type-Options',
    'Strict-Transport-Security',
    'X-XSS-Protection'
  ],
  
  // 代码安全模式检查
  securityPatterns: [
    {
      name: 'SQL注入风险',
      pattern: /SELECT\s+.*\s+FROM\s+.*\s+WHERE\s+.*\+/gi,
      severity: 'high'
    },
    {
      name: 'XSS风险',
      pattern: /innerHTML\s*=\s*.*\+/gi,
      severity: 'medium'
    },
    {
      name: '硬编码密钥',
      pattern: /(password|secret|key|token)\s*[:=]\s*['"][^'"]{8,}['"]/gi,
      severity: 'high'
    },
    {
      name: 'eval使用',
      pattern: /eval\s*\(/gi,
      severity: 'high'
    },
    {
      name: 'console.log泄露',
      pattern: /console\.log\s*\(/gi,
      severity: 'low'
    }
  ]
};

class SecurityAuditor {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      summary: {
        totalIssues: 0,
        highSeverity: 0,
        mediumSeverity: 0,
        lowSeverity: 0
      },
      checks: {
        sensitiveFiles: [],
        dependencies: [],
        codePatterns: [],
        configurations: [],
        recommendations: []
      }
    };
  }

  async runSecurityAudit() {
    console.log('🔒 开始安全检查...');
    
    await this.checkSensitiveFiles();
    await this.checkDependencies();
    await this.checkCodePatterns();
    await this.checkConfigurations();
    this.generateRecommendations();
    
    this.generateSummary();
    this.saveReport();
    this.displayResults();
    
    return this.results;
  }

  async checkSensitiveFiles() {
    console.log('\n📁 检查敏感文件...');
    
    const projectRoot = process.cwd();
    const sensitiveFound = [];
    
    for (const file of securityConfig.sensitiveFiles) {
      const filePath = path.join(projectRoot, file);
      if (fs.existsSync(filePath)) {
        const issue = {
          type: 'sensitive_file',
          file: file,
          path: filePath,
          severity: 'medium',
          description: `发现敏感文件: ${file}`,
          recommendation: '确保敏感文件不被提交到版本控制系统'
        };
        sensitiveFound.push(issue);
        console.log(`  ⚠️  发现敏感文件: ${file}`);
      }
    }
    
    // 检查.gitignore
    const gitignorePath = path.join(projectRoot, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
      const missingPatterns = [];
      
      const requiredPatterns = ['.env*', 'node_modules/', '*.log', 'dist/', '.DS_Store'];
      
      for (const pattern of requiredPatterns) {
        if (!gitignoreContent.includes(pattern)) {
          missingPatterns.push(pattern);
        }
      }
      
      if (missingPatterns.length > 0) {
        sensitiveFound.push({
          type: 'gitignore_incomplete',
          file: '.gitignore',
          severity: 'low',
          description: `缺少重要的.gitignore规则: ${missingPatterns.join(', ')}`,
          recommendation: '添加缺失的.gitignore规则'
        });
      }
    }
    
    this.results.checks.sensitiveFiles = sensitiveFound;
    console.log(`  检查完成，发现 ${sensitiveFound.length} 个问题`);
  }

  async checkDependencies() {
    console.log('\n📦 检查依赖安全性...');
    
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const workersPackageJsonPath = path.join(process.cwd(), 'workers', 'package.json');
    
    const dependencyIssues = [];
    
    // 检查主项目依赖
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      this.checkPackageDependencies(packageJson, 'main', dependencyIssues);
    }
    
    // 检查workers依赖
    if (fs.existsSync(workersPackageJsonPath)) {
      const workersPackageJson = JSON.parse(fs.readFileSync(workersPackageJsonPath, 'utf8'));
      this.checkPackageDependencies(workersPackageJson, 'workers', dependencyIssues);
    }
    
    this.results.checks.dependencies = dependencyIssues;
    console.log(`  检查完成，发现 ${dependencyIssues.length} 个依赖问题`);
  }

  checkPackageDependencies(packageJson, project, issues) {
    const allDeps = {
      ...packageJson.dependencies || {},
      ...packageJson.devDependencies || {}
    };
    
    // 检查过时的依赖
    const outdatedDeps = [];
    
    // React相关安全检查
    if (allDeps.react && this.isVersionOutdated(allDeps.react, '18.0.0')) {
      outdatedDeps.push('react');
    }
    
    // 检查是否有已知漏洞的包
    for (const [pkg, version] of Object.entries(allDeps)) {
      const vulnCheck = securityConfig.vulnerableDependencies.find(vuln => 
        vuln.startsWith(pkg + '@')
      );
      
      if (vulnCheck) {
        issues.push({
          type: 'vulnerable_dependency',
          project: project,
          package: pkg,
          version: version,
          severity: 'high',
          description: `发现已知漏洞依赖: ${pkg}@${version}`,
          recommendation: '升级到安全版本'
        });
      }
    }
    
    if (outdatedDeps.length > 0) {
      issues.push({
        type: 'outdated_dependencies',
        project: project,
        packages: outdatedDeps,
        severity: 'medium',
        description: `发现过时依赖: ${outdatedDeps.join(', ')}`,
        recommendation: '升级到最新稳定版本'
      });
    }
  }

  isVersionOutdated(currentVersion, minVersion) {
    // 简单版本比较
    const current = currentVersion.replace(/[^0-9.]/g, '').split('.');
    const min = minVersion.split('.');
    
    for (let i = 0; i < Math.max(current.length, min.length); i++) {
      const c = parseInt(current[i] || '0');
      const m = parseInt(min[i] || '0');
      
      if (c < m) return true;
      if (c > m) return false;
    }
    
    return false;
  }

  async checkCodePatterns() {
    console.log('\n🔍 检查代码安全模式...');
    
    const codeIssues = [];
    const srcDir = path.join(process.cwd(), 'src');
    const workersDir = path.join(process.cwd(), 'workers', 'src');
    
    if (fs.existsSync(srcDir)) {
      await this.scanDirectory(srcDir, codeIssues, 'frontend');
    }
    
    if (fs.existsSync(workersDir)) {
      await this.scanDirectory(workersDir, codeIssues, 'backend');
    }
    
    this.results.checks.codePatterns = codeIssues;
    console.log(`  检查完成，发现 ${codeIssues.length} 个代码安全问题`);
  }

  async scanDirectory(dir, issues, context) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        await this.scanDirectory(fullPath, issues, context);
      } else if (file.name.match(/\.(ts|tsx|js|jsx)$/)) {
        await this.scanFile(fullPath, issues, context);
      }
    }
  }

  async scanFile(filePath, issues, context) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);
      
      for (const pattern of securityConfig.securityPatterns) {
        const matches = content.match(pattern.pattern);
        
        if (matches) {
          // 获取行号
          const lines = content.split('\n');
          const matchLines = [];
          
          for (let i = 0; i < lines.length; i++) {
            if (pattern.pattern.test(lines[i])) {
              matchLines.push(i + 1);
            }
          }
          
          issues.push({
            type: 'code_pattern',
            context: context,
            file: relativePath,
            pattern: pattern.name,
            severity: pattern.severity,
            lines: matchLines,
            matches: matches.length,
            description: `在 ${relativePath} 中发现 ${pattern.name}`,
            recommendation: this.getPatternRecommendation(pattern.name)
          });
        }
      }
    } catch (error) {
      console.log(`  ⚠️  无法读取文件: ${filePath}`);
    }
  }

  getPatternRecommendation(patternName) {
    const recommendations = {
      'SQL注入风险': '使用参数化查询或ORM',
      'XSS风险': '使用安全的DOM操作方法，避免直接设置innerHTML',
      '硬编码密钥': '将敏感信息移至环境变量',
      'eval使用': '避免使用eval，使用更安全的替代方案',
      'console.log泄露': '在生产环境中移除console.log语句'
    };
    
    return recommendations[patternName] || '请检查并修复此安全问题';
  }

  async checkConfigurations() {
    console.log('\n⚙️  检查配置安全性...');
    
    const configIssues = [];
    
    // 检查Vite配置
    const viteConfigPath = path.join(process.cwd(), 'vite.config.ts');
    if (fs.existsSync(viteConfigPath)) {
      const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
      
      // 检查是否启用了source map在生产环境
      if (viteConfig.includes('sourcemap: true') && !viteConfig.includes('NODE_ENV')) {
        configIssues.push({
          type: 'config_security',
          file: 'vite.config.ts',
          severity: 'medium',
          description: '生产环境可能启用了source map',
          recommendation: '在生产环境中禁用source map以避免代码泄露'
        });
      }
    }
    
    // 检查TypeScript配置
    const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
    if (fs.existsSync(tsConfigPath)) {
      const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
      
      if (tsConfig.compilerOptions && tsConfig.compilerOptions.strict !== true) {
        configIssues.push({
          type: 'config_security',
          file: 'tsconfig.json',
          severity: 'low',
          description: 'TypeScript严格模式未启用',
          recommendation: '启用strict模式以提高代码安全性'
        });
      }
    }
    
    this.results.checks.configurations = configIssues;
    console.log(`  检查完成，发现 ${configIssues.length} 个配置问题`);
  }

  generateRecommendations() {
    const recommendations = [];
    
    // 基于发现的问题生成建议
    const totalIssues = this.results.summary.totalIssues;
    
    if (totalIssues === 0) {
      recommendations.push('🎉 恭喜！未发现重大安全问题');
      recommendations.push('💡 建议定期进行安全审计');
      recommendations.push('🔒 考虑集成自动化安全扫描工具');
    } else {
      if (this.results.summary.highSeverity > 0) {
        recommendations.push('🚨 立即修复高危安全问题');
        recommendations.push('🔍 进行深度安全测试');
      }
      
      if (this.results.summary.mediumSeverity > 0) {
        recommendations.push('⚠️  尽快修复中等风险问题');
      }
      
      recommendations.push('📚 为团队提供安全编码培训');
      recommendations.push('🛡️  建立安全代码审查流程');
    }
    
    // 通用安全建议
    recommendations.push('🔐 实施内容安全策略(CSP)');
    recommendations.push('🌐 启用HTTPS和安全头');
    recommendations.push('📝 建立安全事件响应计划');
    recommendations.push('🔄 定期更新依赖包');
    
    this.results.checks.recommendations = recommendations;
  }

  generateSummary() {
    let totalIssues = 0;
    let highSeverity = 0;
    let mediumSeverity = 0;
    let lowSeverity = 0;
    
    // 统计所有检查结果
    const allChecks = [
      ...this.results.checks.sensitiveFiles,
      ...this.results.checks.dependencies,
      ...this.results.checks.codePatterns,
      ...this.results.checks.configurations
    ];
    
    for (const issue of allChecks) {
      totalIssues++;
      
      switch (issue.severity) {
        case 'high':
          highSeverity++;
          break;
        case 'medium':
          mediumSeverity++;
          break;
        case 'low':
          lowSeverity++;
          break;
      }
    }
    
    this.results.summary = {
      totalIssues,
      highSeverity,
      mediumSeverity,
      lowSeverity
    };
  }

  saveReport() {
    const reportPath = path.join(process.cwd(), 'security-audit-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📋 安全审计报告已保存: ${reportPath}`);
  }

  displayResults() {
    console.log('\n🔒 安全审计结果总结:');
    console.log(`  总问题数: ${this.results.summary.totalIssues}`);
    console.log(`  高危问题: ${this.results.summary.highSeverity}`);
    console.log(`  中危问题: ${this.results.summary.mediumSeverity}`);
    console.log(`  低危问题: ${this.results.summary.lowSeverity}`);
    
    if (this.results.summary.totalIssues === 0) {
      console.log('\n✅ 安全检查通过！未发现重大安全问题。');
    } else {
      console.log('\n📊 问题详情:');
      
      // 显示高危问题
      if (this.results.summary.highSeverity > 0) {
        console.log('\n🚨 高危问题:');
        this.displayIssuesByType('high');
      }
      
      // 显示中危问题
      if (this.results.summary.mediumSeverity > 0) {
        console.log('\n⚠️  中危问题:');
        this.displayIssuesByType('medium');
      }
      
      // 显示低危问题
      if (this.results.summary.lowSeverity > 0) {
        console.log('\n💡 低危问题:');
        this.displayIssuesByType('low');
      }
    }
    
    console.log('\n🛡️  安全建议:');
    this.results.checks.recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
    
    console.log('\n✅ 安全审计完成!');
  }

  displayIssuesByType(severity) {
    const allChecks = [
      ...this.results.checks.sensitiveFiles,
      ...this.results.checks.dependencies,
      ...this.results.checks.codePatterns,
      ...this.results.checks.configurations
    ];
    
    const issuesOfType = allChecks.filter(issue => issue.severity === severity);
    
    issuesOfType.forEach((issue, index) => {
      console.log(`    ${index + 1}. ${issue.description}`);
      if (issue.file) {
        console.log(`       文件: ${issue.file}`);
      }
      if (issue.lines && issue.lines.length > 0) {
        console.log(`       行号: ${issue.lines.join(', ')}`);
      }
      console.log(`       建议: ${issue.recommendation}`);
    });
  }
}

// 运行安全审计
async function runSecurityAudit() {
  const auditor = new SecurityAuditor();
  return await auditor.runSecurityAudit();
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  runSecurityAudit().catch(console.error);
}

export { runSecurityAudit, SecurityAuditor };