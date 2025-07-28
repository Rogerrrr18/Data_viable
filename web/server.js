const express = require('express');
const cors = require('cors');
const path = require('path');
const { parseExcelData } = require('./dataParser');

const app = express();
const PORT = 3000;

// 启用CORS
app.use(cors());

// 静态文件服务
app.use(express.static('../public'));
// 新增：提供漏斗图图片的静态访问
app.use('/images', express.static(__dirname));

// 数据API接口
app.get('/api/data', (req, res) => {
    try {
        const data = parseExcelData();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: '数据解析失败', details: error.message });
    }
});

// 主页面路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// 新增：漏斗图图片页面
app.get('/funnel', (req, res) => {
    res.send(`
        <html>
        <head><title>漏斗图展示</title></head>
        <body style='background:#222;text-align:center;'>
            <h2 style='color:#fff;'>漏斗转化分析(6.23-6.29)</h2>
            <img src="/images/funnel.png" style="max-width:90vw;border:8px solid #fff;border-radius:12px;box-shadow:0 4px 32px #000;" />
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`数据API: http://localhost:${PORT}/api/data`);
}); 