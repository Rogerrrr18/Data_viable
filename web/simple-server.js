const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// 简单的MIME类型映射
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

// 创建HTTP服务器
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // 处理OPTIONS请求
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // API路由
    if (pathname === '/api/data') {
        handleDataAPI(req, res);
        return;
    }
    
    // 静态文件服务
    serveStaticFile(req, res, pathname);
});

// 处理数据API
function handleDataAPI(req, res) {
    if (req.method !== 'GET') {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
    }
    
    try {
        // 这里我们创建一个模拟数据，因为无法直接读取Excel文件
        // 在实际使用中，你需要安装xlsx包来读取Excel文件
        const mockData = {
            dates: ['0623-0629', '0630-0706', '0707-0713', '0714-0720', '0721-0727'],
            indicators: [
                {
                    name: 'UV',
                    data: [
                        { date: '0623-0629', value: 15000 },
                        { date: '0630-0706', value: 16500 },
                        { date: '0707-0713', value: 18000 },
                        { date: '0714-0720', value: 19500 },
                        { date: '0721-0727', value: 21000 }
                    ]
                },
                {
                    name: '新增注册数',
                    data: [
                        { date: '0623-0629', value: 1200 },
                        { date: '0630-0706', value: 1350 },
                        { date: '0707-0713', value: 1500 },
                        { date: '0714-0720', value: 1650 },
                        { date: '0721-0727', value: 1800 }
                    ]
                },
                {
                    name: '注册转化率',
                    data: [
                        { date: '0623-0629', value: 0.08 },
                        { date: '0630-0706', value: 0.082 },
                        { date: '0707-0713', value: 0.083 },
                        { date: '0714-0720', value: 0.085 },
                        { date: '0721-0727', value: 0.086 }
                    ]
                },
                {
                    name: '获客成本(CAC)',
                    data: [
                        { date: '0623-0629', value: 25.5 },
                        { date: '0630-0706', value: 24.8 },
                        { date: '0707-0713', value: 24.2 },
                        { date: '0714-0720', value: 23.5 },
                        { date: '0721-0727', value: 22.8 }
                    ]
                },
                {
                    name: '简历上传行为数',
                    data: [
                        { date: '0623-0629', value: 850 },
                        { date: '0630-0706', value: 920 },
                        { date: '0707-0713', value: 980 },
                        { date: '0714-0720', value: 1050 },
                        { date: '0721-0727', value: 1120 }
                    ]
                },
                {
                    name: '进入简历报告行为数',
                    data: [
                        { date: '0623-0629', value: 680 },
                        { date: '0630-0706', value: 740 },
                        { date: '0707-0713', value: 790 },
                        { date: '0714-0720', value: 840 },
                        { date: '0721-0727', value: 900 }
                    ]
                },
                {
                    name: '激活漏斗转化率',
                    data: [
                        { date: '0623-0629', value: 0.75 },
                        { date: '0630-0706', value: 0.76 },
                        { date: '0707-0713', value: 0.77 },
                        { date: '0714-0720', value: 0.78 },
                        { date: '0721-0727', value: 0.79 }
                    ]
                },
                {
                    name: '付费人数',
                    data: [
                        { date: '0623-0629', value: 180 },
                        { date: '0630-0706', value: 195 },
                        { date: '0707-0713', value: 210 },
                        { date: '0714-0720', value: 225 },
                        { date: '0721-0727', value: 240 }
                    ]
                },
                {
                    name: '激活付费转化率',
                    data: [
                        { date: '0623-0629', value: 0.15 },
                        { date: '0630-0706', value: 0.155 },
                        { date: '0707-0713', value: 0.16 },
                        { date: '0714-0720', value: 0.165 },
                        { date: '0721-0727', value: 0.17 }
                    ]
                },
                {
                    name: '整体付费转化率（按激活）',
                    data: [
                        { date: '0623-0629', value: 0.15 },
                        { date: '0630-0706', value: 0.155 },
                        { date: '0707-0713', value: 0.16 },
                        { date: '0714-0720', value: 0.165 },
                        { date: '0721-0727', value: 0.17 }
                    ]
                },
                {
                    name: '活跃付费转化率',
                    data: [
                        { date: '0623-0629', value: 0.12 },
                        { date: '0630-0706', value: 0.125 },
                        { date: '0707-0713', value: 0.13 },
                        { date: '0714-0720', value: 0.135 },
                        { date: '0721-0727', value: 0.14 }
                    ]
                },
                {
                    name: '付费用户获取成本',
                    data: [
                        { date: '0623-0629', value: 170 },
                        { date: '0630-0706', value: 165 },
                        { date: '0707-0713', value: 160 },
                        { date: '0714-0720', value: 155 },
                        { date: '0721-0727', value: 150 }
                    ]
                },
                {
                    name: 'ARPU',
                    data: [
                        { date: '0623-0629', value: 45.5 },
                        { date: '0630-0706', value: 46.2 },
                        { date: '0707-0713', value: 47.0 },
                        { date: '0714-0720', value: 47.8 },
                        { date: '0721-0727', value: 48.5 }
                    ]
                },
                {
                    name: 'ROI',
                    data: [
                        { date: '0623-0629', value: 1.78 },
                        { date: '0630-0706', value: 1.86 },
                        { date: '0707-0713', value: 1.94 },
                        { date: '0714-0720', value: 2.02 },
                        { date: '0721-0727', value: 2.10 }
                    ]
                }
            ]
        };
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(mockData));
        
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '数据获取失败', details: error.message }));
    }
}

// 服务静态文件
function serveStaticFile(req, res, pathname) {
    let filePath = pathname === '/' ? '/index.html' : pathname;
    filePath = path.join(__dirname, 'public', filePath);
    
    const extname = path.extname(filePath);
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - 文件未找到</h1>');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('<h1>500 - 服务器内部错误</h1>');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`数据API: http://localhost:${PORT}/api/data`);
    console.log('注意：当前使用模拟数据，如需读取真实Excel文件，请安装xlsx包');
}); 