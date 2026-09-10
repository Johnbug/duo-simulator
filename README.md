# iPhone Duo 体验室

独立制作的中文网页模拟体验。Apple 官方产品图片与规格参考：https://www.apple.com.cn/iphone-duo/ 与 https://www.apple.com.cn/iphone-duo/specs/。

包含开合角度控制、四种姿态、两种颜色、App 演示、屏幕旋转和 Safari/备忘录分屏。备忘录内容只在当前页面会话保留。音乐、电话、拍摄与天气为演示，不访问设备传感器或外部通信服务。折叠动画、系统界面为模拟，非官方软件或物理仿真。

运行 `npm install`、`npm run dev`，生产构建为 `npm run build`。

图片归 Apple 所有，来源清单见 public/assets/sources.json。网页界面的背景为原创 CSS 渐变。

实现了渐进增强的 configure_duo_experience WebMCP 工具，浏览器不支持时不影响页面。当前环境未提供可执行的 WebMCP 验证上下文，故未验证工具注册与执行。未进行浏览器交互测试。
