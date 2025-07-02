const xlsx = require('xlsx');
const path = require('path');

function parseExcelData() {
    try {
        // 读取Excel文件
        const workbook = xlsx.readFile('data.xlsx');
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // 转换为JSON数组
        const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
        
        // 取第二行（下标0）为日期，跳过第一列
        const dates = jsonData[0].slice(1);
        const indicators = [];
        
        // 从第三行开始，每一行是一个指标（下标1开始）
        for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.length < 2) continue;
            const indicatorName = row[0];
            const values = row.slice(1).map((val, idx) => {
                let value = val;
                if (typeof value === 'string') {
                    value = value.trim();
                    if (value.endsWith('%')) {
                        // 百分号转小数
                        value = parseFloat(value.replace('%', '')) / 100;
                    } else if (value === '/' || value === '' || value === '-') {
                        value = null;
                    } else if (!isNaN(Number(value))) {
                        value = Number(value);
                    }
                }
                return {
                    date: dates[idx],
                    value: value === '' ? null : value
                };
            });
            indicators.push({
                name: indicatorName,
                data: values
            });
        }
        
        return {
            dates: dates,
            indicators: indicators
        };
    } catch (error) {
        console.error('解析Excel文件时出错:', error);
        throw error;
    }
}

module.exports = { parseExcelData }; 