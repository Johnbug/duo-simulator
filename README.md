# iPhone Duo 体验室

独立制作的中文网页模拟体验。Apple 官方产品图片与规格参考：https://www.apple.com.cn/iphone-duo/ 与 https://www.apple.com.cn/iphone-duo/specs/。

包含 Apple 官网原始 glTF 三维模型、Slider 蒙皮开合动画和屏幕贴图。直接在机身上用鼠标或单指左右拖动即可连续折叠，松手保持角度；转动模式可查看背面与铰链。支持四种姿态、两种颜色、App 演示、屏幕旋转和 Safari/备忘录分屏。星光白使用原始材质；夜空色由原始材质重新着色，照明为独立实现。备忘录内容只在当前页面会话保留。音乐、电话、拍摄与天气为演示，不访问设备传感器或外部通信服务。模型与开合动画来自 Apple 官网；App 体验界面为模拟，非官方软件或物理仿真。

运行 `npm install`、`npm run dev`，生产构建为 `npm run build`。

图片归 Apple 所有，来源清单见 public/assets/sources.json。网页界面的背景为原创 CSS 渐变。

实现了渐进增强的 configure_duo_experience WebMCP 工具，浏览器不支持时不影响页面。当前环境未提供可执行的 WebMCP 验证上下文，故未验证工具注册与执行。未进行浏览器交互测试。

验证：`node --test tests/*.test.mjs` 检查手势方向、角度边界、多指隔离、取消释放以及真实模型开合几何与本地素材完整性。`npx tsc --noEmit` 与 `npm run build` 检查类型和生产构建。三维渲染需浏览器支持 WebGL 2 与 AVIF，不支持时可进入 App 体验。

默认进入旋转展示，约 32 秒一圈；折叠展示约 20 秒完成一次开合。手动拖动、角度滑块和预设姿态会暂停自动展示，播放按钮可继续。后台页面及规格弹窗期间暂停；系统启用减少动态效果时初始不自动播放，用户仍可主动播放。
