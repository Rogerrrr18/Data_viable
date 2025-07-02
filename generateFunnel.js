const { generate_funnel_chart } = require('@antv/mcp-server-chart');
const xlsx = require('xlsx');
const fs = require('fs');

// 漏斗层级及对应指标名
const funnelStages = [
  { name: '新用户访问人数', key: '新用户访问人数' },
  { name: '新用户注册人数', key: '新用户注册人数' },
  { name: '上传简历人数（新用户）', key: '上传简历人数（新用户）' },
  { name: '进入报告页人数（新用户）', key: '进入报告页人数（新用户）' },
  { name: '报告页末尾-点击付费按钮人数（新用户）', keys: ['报告页末尾', '点击付费按钮人数（新用户）'] },
  { name: '新用户付费人数', key: '新用户付费人数' }
];
const targetDate = '0623-0629';

function getFunnelDataFromExcel() {
  const workbook = xlsx.readFile('data.xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  const dates = jsonData[0].slice(1);
  const indicatorMap = {};
  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (!row || !row[0]) continue;
    const name = row[0];
    indicatorMap[name] = dates.map((date, idx) => ({ date, value: row[idx + 1] }));
  }
  // 组装漏斗数据
  return funnelStages.map(stage => {
    if (stage.keys) {
      // 合并层
      let sum = 0;
      stage.keys.forEach(k => {
        const arr = indicatorMap[k] || [];
        const found = arr.find(item => item.date === targetDate);
        if (found && typeof found.value === 'number') sum += found.value;
        if (found && typeof found.value === 'string' && found.value.trim() !== '' && !isNaN(Number(found.value))) sum += Number(found.value);
      });
      return { stage: stage.name, value: sum };
    } else {
      const arr = indicatorMap[stage.key] || [];
      const found = arr.find(item => item.date === targetDate);
      let value = 0;
      if (found && typeof found.value === 'number') value = found.value;
      if (found && typeof found.value === 'string' && found.value.trim() !== '' && !isNaN(Number(found.value))) value = Number(found.value);
      return { stage: stage.name, value };
    }
  });
}

(async () => {
  const data = getFunnelDataFromExcel();
  await generate_funnel_chart({
    data,
    title: '漏斗转化分析(6.23-6.29)',
    output: 'funnel.png'
  });
  console.log('漏斗图已生成：funnel.png');
})(); 