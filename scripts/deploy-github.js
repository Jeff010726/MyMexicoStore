import { writeFileSync, existsSync, copyFileSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 确保dist目录存在
const distDir = resolve(__dirname, '../dist');
if (!existsSync(distDir)) {
  console.error('构建目录不存在，请先运行 npm run build');
  process.exit(1);
}

// 创建.nojekyll文件
const nojekyllPath = join(distDir, '.nojekyll');
writeFileSync(nojekyllPath, '');
console.log('创建 .nojekyll 文件');

// 复制404.html到dist目录
const source404 = resolve(__dirname, '../public/404.html');
const target404 = join(distDir, '404.html');

if (existsSync(source404)) {
  copyFileSync(source404, target404);
  console.log('复制 404.html 到构建目录');
} else {
  // 如果不存在，创建一个基本的404页面
  const html404 = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>页面未找到</title>
  <script>
    // 单页应用GitHub Pages路由处理
    window.location.href = '/MyMexicoStore/#' + window.location.pathname.slice(1);
  </script>
</head>
<body>
  <h1>页面未找到</h1>
  <p>正在重定向到首页...</p>
</body>
</html>`;
  
  writeFileSync(target404, html404);
  console.log('创建 404.html 文件');
}

console.log('GitHub Pages部署准备完成！');