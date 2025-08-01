# 数据看板可视化项目

这是一个基于 Node.js 和 AntV G2Plot 的数据看板可视化项目，用于展示业务指标的散点-连线图。

## 功能特点

- 📊 自动解析 Excel 数据文件
- 📈 为每个指标生成散点-连线图
- 🎨 现代化的响应式界面设计
- 📱 支持移动端显示
- 🔄 实时数据更新

## 支持的指标

- UV
- 新增注册数
- 注册转化率
- 获客成本(CAC)
- 简历上传行为数
- 进入简历报告行为数
- 激活漏斗转化率
- 付费人数
- 激活付费转化率
- 活跃付费转化率
- 付费用户获取成本
- ARPU
- ROI

## 安装和运行

### 1. 安装依赖

```bash
npm install
```

### 2. 准备数据文件

确保 `data.xlsx` 文件在项目根目录下，数据格式如下：
- 第一行：日期（如 0623-0629）
- 第一列：指标名称
- 表格中部：对应的数值数据

### 3. 启动服务器

```bash
npm start
```

或者使用开发模式（自动重启）：

```bash
npm run dev
```

### 4. 访问应用

打开浏览器访问：http://localhost:3000

## 项目结构

```
数据看板可视化/
├── data.xlsx              # 数据文件
├── package.json           # 项目配置
├── server.js              # 服务器文件
├── dataParser.js          # 数据解析模块
├── public/                # 静态文件目录
│   ├── index.html         # 主页面
│   └── script.js          # 前端脚本
└── README.md              # 项目说明
```

## 工具与环境

### 数据仓库
- ClickHouse：高性能列式数据库
- MySQL：关系型数据库

### 分析工具
- Python
  - pandas：数据处理与分析
  - numpy：数学计算
  - openpyxl：Excel文件处理
- Node.js
  - xlsx：Excel文件读取

### 可视化工具
- G2Plot：Web端数据可视化库
- Excel内置图表：静态报表展示
- Express.js：Web服务器框架

### 开发环境
- Python 3.x
- Node.js 18+
- Conda：环境管理

### 协作工具
- GitLab：版本管理
- Confluence（腾讯文档）：文档协作

### 部署环境
- 阿里云服务器
- Nginx：Web服务器

## 技术栈

- **后端**: Node.js + Express
- **前端**: HTML5 + CSS3 + JavaScript
- **图表库**: AntV G2Plot
- **数据处理**: xlsx

## 自定义配置

### 修改端口

在 `server.js` 中修改 `PORT` 变量：

```javascript
const PORT = 3000; // 修改为你想要的端口
```

### 添加新指标

在 `dataParser.js` 中的 `indicatorNames` 数组中添加新指标名称。

### 修改图表样式

在 `public/script.js` 中修改图表配置，包括颜色、大小、样式等。

## 故障排除

### 数据加载失败

1. 检查 `data.xlsx` 文件是否存在
2. 确认数据格式是否正确
3. 查看浏览器控制台错误信息

### 图表不显示

1. 检查网络连接
2. 确认 G2Plot 库是否正常加载
3. 查看浏览器控制台错误信息

## 许可证

MIT License 