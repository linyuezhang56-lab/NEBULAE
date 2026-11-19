# 星云 · NEBULAE

以“星云的颜色从哪里来”为线索的交互网页作品。

## 发布到 GitHub Pages

1. 解压本文件包。
2. 在 GitHub 新建公开仓库，例如 nebula。
3. 上传本目录内的全部文件及 assets 文件夹，保持目录结构。index.html 应位于仓库首页，不能再套一层文件夹，也不要直接上传 ZIP。
4. 仓库 Settings → Pages → Build and deployment。
5. Source 选择 Deploy from a branch；Branch 选择 main；目录选择 /(root)；Save。
6. 等待发布，使用 Pages 页面显示的网址访问作品。

无需安装依赖或执行构建。网页使用 JavaScript 模块与本地 JSON；请通过 GitHub Pages 或本地 HTTP 服务访问。

## 图像及字体

天文影像的来源、署名与原始发布链接保留于网页“资料与来源”和 sources.json 中。字体许可位于 assets 文件夹。再次使用第三方素材时，请遵循对应发布方的使用条款。

## 后续修改

页面结构：index.html；星云内容：data.js；样式：各 CSS 文件；交互及动画：各 JS 文件；素材：assets。

在 main 分支更新文件后，GitHub Pages 会重新部署。此文件包对应 2026-11-19 的空间滚动版本；之后在原托管平台修改的内容，需要重新导出并上传才能同步到 GitHub。
