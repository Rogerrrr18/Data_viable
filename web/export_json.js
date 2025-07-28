const { parseExcelData } = require('./dataParser');
const fs = require('fs');

const data = parseExcelData();
fs.writeFileSync('public/data.json', JSON.stringify(data, null, 2), 'utf-8');
console.log('已生成 public/data.json'); 