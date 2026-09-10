# iPhone Duo 体验室

基于 Next.js App Router、React 和 Three.js 的中文折叠屏网页体验，支持部署到 Vercel。

## 体验内容

- 默认自动旋转，约 32 秒一圈；折叠模式约 20 秒完成一次开合。
- 支持鼠标与单指拖动、播放／暂停、四种姿态和两种配色。
- 手动拖动、角度滑块和姿态预设可接管自动展示；页面进入后台时暂停。
- 支持 App 演示、屏幕旋转、Safari 与备忘录分屏、可编辑笔记和可勾选清单。
- 系统启用“减少动态效果”时初始不自动播放，仍可手动点击播放。

## 部署到 Vercel

1. 在 Vercel 选择 **Add New → Project**，导入 `Johnbug/duo-simulator`。
2. 使用下面的设置，然后点击 **Deploy**：

| 设置 | 值 |
| --- | --- |
| Production Branch | `main` |
| Framework Preset | `Next.js` |
| Root Directory | 仓库根目录，保持默认 |
| Node.js Version | `24.x` |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | 保持 Next.js 默认，不填写 `dist` |
| Environment Variables | 无需配置 |

`vercel.json` 已指定框架与构建命令，`package.json` 已指定 Node.js 版本。部署成功后，推送到 `main` 可触发 Vercel 自动更新。

项目不依赖数据库、Cloudflare 绑定、登录服务或第三方密钥。三维模型、屏幕贴图和图片均在 `public/assets` 中，由部署站点直接提供。

参考：[Vercel 的 Next.js 部署说明](https://vercel.com/docs/frameworks/full-stack/nextjs)、[Node.js 版本设置](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)。

## 本地运行

使用 Node.js 24（可通过 `nvm use` 读取 `.nvmrc`）：

```bash
npm ci
npm run dev
```

打开终端显示的本地地址。指定端口可使用 `npm run dev -- --port 3002`。

生产模式预览：

```bash
npm run build
npm start
```

## 检查

```bash
npm run check
```

依次执行 12 项手势、自动动画、模型几何与素材完整性检查，Next.js 类型生成与 TypeScript 检查，以及生产构建。也可单独运行 `npm test`、`npm run typecheck`、`npm run build`。

## 目录

- `app/`：页面、整体样式和元信息。
- `components/duo-model.tsx`：三维模型渲染。
- `components/phone-apps.tsx`：Safari 与备忘录模拟界面。
- `lib/`：折叠手势、自动展示动画与模型方向。
- `public/assets/`：模型、贴图、图片和来源记录。
- `tests/`：回归检查。
- `docs/realism-audit.md`：外观校验记录及还原范围说明。

## 素材与模拟范围

产品模型、开合动画、图片与规格参考 [Apple 产品介绍](https://www.apple.com.cn/iphone-duo/) 和 [技术规格](https://www.apple.com.cn/iphone-duo/specs/)，素材版权归 Apple，详细来源见 `public/assets/sources.json`。

本项目为独立制作的网页模拟体验。照明、夜空色调色及内屏减眩光校准由项目独立实现，无法代表真机的精确光学效果。App 界面为模拟；笔记只在当前页面会话保留；音乐、电话、相机和天气不调用设备传感器或外部通信服务。

三维展示需要 WebGL 2 与 AVIF 支持，不支持时可进入 App 体验。WebMCP 是可选增强，不支持它的浏览器仍可使用页面；其工具注册与执行尚未完成浏览器验证。
