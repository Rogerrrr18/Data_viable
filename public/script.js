// 颜色配置
const colors = [
    '#1890FF', '#2FC25B', '#FACC14', '#223273', '#8543E0',
    '#13C2C2', '#3436C7', '#F04864', '#748AAB', '#EB2F96',
    '#FA8C16', '#A0D911', '#722ED1', '#B37FEB', '#36CBCB', '#F759AB', '#FFA940', '#FFEC3D', '#73D13D', '#597EF7', '#FF85C0'
];

// 图表分组配置
const chartGroups = [
  {
    title: '访问人数趋势',
    indicators: ['整体访问人数', '新用户访问人数', '老用户访问人数']
  },
  {
    title: '获客成本(CAC)',
    indicators: ['获客成本(CAC)']
  },
  {
    title: '简历上传与报告',
    indicators: ['简历上传总人数', '上传简历人数（新用户）', '进入简历报告总数(整体)']
  },
  {
    title: '投放成本',
    indicators: ['投放成本']
  },
  {
    title: '付费转化率趋势',
    indicators: ['整体付费转化率（按访问）', '新用户付费转化率（按访问）', '老用户付费转化率（按访问）', '整体付费转化率（按激活）']
  },
  {
    title: 'ARPU',
    indicators: ['ARPU']
  },
  {
    title: 'ROI',
    indicators: ['ROI']
  },
  {
    title: '分享趋势',
    indicators: ['分享次数', '分享人数']
  },
  {
    title: '分享行为渗透率',
    indicators: ['分享行为渗透率']
  },
  {
    title: '分享转化率',
    indicators: ['分享转化率']
  }
];

// 需要以百分比显示的指标
const percentIndicators = [
  'ROI', '分享行为渗透率', '分享转化率',
  '整体付费转化率（按访问）', '新用户付费转化率（按访问）', '老用户付费转化率（按访问）', '整体付费转化率（按激活）'
];

// 获取数据并渲染图表
async function loadDataAndRenderCharts() {
    try {
        console.log('开始加载数据...');
        console.log('当前页面URL:', window.location.href);
        console.log('当前页面路径:', window.location.pathname);
        
        // 使用相对路径，确保在阿里云服务器上能正确加载
        const baseUrl = window.location.pathname.replace('/index.html', '');
        
        // 加载主要数据
        console.log('尝试加载 /api/data...');
        const response = await fetch(`/api/data`);
        console.log('/api/data 响应状态:', response.status);
        if (!response.ok) {
            throw new Error(`数据获取失败: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log('/api/data 加载成功，数据长度:', Object.keys(data).length);
        
        // 加载付费时长分布数据
        let payTimeData = null;
        try {
            console.log('尝试加载 pay_time_data.json...');
            const payTimeResponse = await fetch(`./pay_time_data.json`);
            console.log('pay_time_data.json 响应状态:', payTimeResponse.status);
            if (payTimeResponse.ok) {
                payTimeData = await payTimeResponse.json();
                console.log('pay_time_data.json 加载成功');
            }
        } catch (error) {
            console.warn('付费时长分布数据加载失败:', error);
        }
        
        // 加载转化率趋势数据
        let conversionTrendData = null;
        try {
            console.log('尝试加载 conversion_trend_data.json...');
            const conversionResponse = await fetch(`./conversion_trend_data.json`);
            console.log('conversion_trend_data.json 响应状态:', conversionResponse.status);
            if (conversionResponse.ok) {
                conversionTrendData = await conversionResponse.json();
                console.log('conversion_trend_data.json 加载成功');
            }
        } catch (error) {
            console.warn('转化率趋势数据加载失败:', error);
        }
        
        console.log('开始渲染图表...');
        renderCharts(data, payTimeData, conversionTrendData);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('charts-container').style.display = 'grid';
        console.log('图表渲染完成');
    } catch (error) {
        console.error('加载数据失败:', error);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error').style.display = 'block';
    }
}

// 渲染所有图表
function renderCharts(data, payTimeData, conversionTrendData) {
    const container = document.getElementById('charts-container');
    container.innerHTML = '';
    // 日期升序排序
    const sortedDates = [...data.dates].sort((a, b) => parseDate(a) - parseDate(b));
    // 指标Map，方便查找
    const indicatorMap = {};
    data.indicators.forEach(ind => {
        if (ind.name) indicatorMap[ind.name] = ind.data;
    });
    chartGroups.forEach((group, groupIdx) => {
        // 合并多指标数据
        let chartData = [];
        group.indicators.forEach((indicator, idx) => {
            const dataArr = indicatorMap[indicator] || [];
            dataArr.forEach(item => {
                if (item && typeof item.value === 'number' && !isNaN(item.value) && item.date) {
                    chartData.push({
                        date: item.date,
                        value: item.value,
                        type: indicator
                    });
                }
            });
        });
        // 只保留在sortedDates中的数据，并按日期升序排列
        chartData = chartData.filter(d => sortedDates.includes(d.date));
        chartData.sort((a, b) => parseDate(a.date) - parseDate(b.date));
        // 渲染
        const chartContainer = createChartContainer(group.title);
        container.appendChild(chartContainer);
        setTimeout(() => {
            renderLineChart(chartData, group, groupIdx, chartContainer.querySelector('.chart'), sortedDates);
        }, groupIdx * 100);
    });
    // 渲染付费时长分布图
    if (payTimeData) {
        renderPayTimeCharts(payTimeData, container);
    }
    
    // 渲染转化率趋势图
    if (conversionTrendData) {
        renderConversionTrendChart(conversionTrendData, container);
    }
}

// 创建图表容器
function createChartContainer(title) {
    const container = document.createElement('div');
    container.className = 'chart-container';
    container.innerHTML = `
        <div class="chart-title">${title}</div>
        <div class="chart"></div>
    `;
    return container;
}

// 渲染折线图（支持多线）
function renderLineChart(chartData, group, groupIdx, container, sortedDates) {
    if (!chartData || chartData.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:#bbb;padding:40px 0;">无有效数据</div>';
        return;
    }
    const isMulti = group.indicators.length > 1;
    const plot = new G2Plot.Line(container, {
        data: chartData,
        xField: 'date',
        yField: 'value',
        seriesField: isMulti ? 'type' : undefined,
        smooth: true,
        color: isMulti ? group.indicators.map((_, i) => colors[i % colors.length]) : [colors[groupIdx % colors.length]],
        point: {
            size: 5,
            shape: 'circle',
            style: {
                stroke: '#fff',
                lineWidth: 2,
            },
        },
        line: {
            style: {
                lineWidth: 3,
            },
        },
        xAxis: {
            title: {
                text: '时间阶段',
                style: {
                    fontSize: 14,
                    fontWeight: 'bold',
                },
            },
            label: {
                style: {
                    fontSize: 12,
                },
            },
            type: 'cat',
            values: sortedDates,
        },
        yAxis: {
            title: {
                text: group.title,
                style: {
                    fontSize: 14,
                    fontWeight: 'bold',
                },
            },
            label: {
                style: {
                    fontSize: 12,
                },
                formatter: (value) => {
                    // 只要分组内有一个是百分比指标，整个图纵坐标都用百分比
                    const isPercent = percentIndicators.some(ind => group.indicators.includes(ind));
                    if (isPercent) {
                        return (value * 100).toFixed(2) + '%';
                    }
                    if (typeof value !== 'number' || isNaN(value)) return value;
                    if (value >= 1000000) {
                        return (value / 1000000).toFixed(1) + 'M';
                    } else if (value >= 1000) {
                        return (value / 1000).toFixed(1) + 'K';
                    } else if (value < 1) {
                        return value.toFixed(3);
                    } else {
                        return value.toFixed(1);
                    }
                },
            },
        },
        tooltip: {
            showMarkers: true,
            shared: true,
            showCrosshairs: true,
            crosshairs: {
                type: 'xy',
            },
            formatter: (datum) => {
                const indicatorName = datum.type || group.title;
                if (percentIndicators.includes(indicatorName)) {
                    return {
                        name: indicatorName,
                        value: (datum.value * 100).toFixed(2) + '%',
                    };
                }
                return {
                    name: indicatorName,
                    value: formatValue(datum.value),
                };
            },
        },
        legend: isMulti ? {
            layout: 'horizontal',
            position: 'bottom',
            flipPage: false,
            itemName: {
                style: {
                    fontSize: 14,
                    fontWeight: 'normal',
                },
            },
        } : false,
        grid: {
            line: {
                style: {
                    stroke: '#f0f0f0',
                    lineWidth: 1,
                },
            },
        },
        theme: {
            geometries: {
                point: {
                    circle: {
                        active: {
                            style: {
                                r: 8,
                                fillOpacity: 0.8,
                            },
                        },
                    },
                },
            },
        },
    });
    plot.render();
}

// 漏斗图渲染（0623-0629）
function renderFunnelChart(data, indicatorMap, container) {
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
    const funnelData = funnelStages.map(stage => {
        if (stage.keys) {
            // 合并层，value为多个key之和
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
    // 计算转化率
    const funnelDataWithRate = funnelData.map((item, idx, arr) => {
        if (idx === 0) return { ...item, rate: 1 };
        const prev = arr[idx - 1];
        return {
            ...item,
            rate: prev.value ? item.value / prev.value : 0
        };
    });
    // 计算底部红字说明（如老用户付费占比）
    let extraText = '';
    const oldPayArr = indicatorMap['老用户付费人数'] || [];
    const oldPay = oldPayArr.find(item => item.date === targetDate);
    const newPay = funnelDataWithRate[funnelDataWithRate.length - 1].value;
    if (oldPay && typeof oldPay.value === 'number' && (oldPay.value + newPay) > 0) {
        const percent = (oldPay.value / (oldPay.value + newPay)) * 100;
        extraText = `<div style='color:#FF3333;font-size:1.5em;font-weight:bold;text-align:center;margin-top:10px;'>${oldPay.value}位老用户付费占比：${percent.toFixed(1)}%</div>`;
    }
    // 创建容器
    const funnelContainer = document.createElement('div');
    funnelContainer.className = 'chart-container';
    funnelContainer.style.background = '#181C27';
    funnelContainer.innerHTML = `
        <div class="chart-title" style="color:#b3c6e0;">漏斗转化分析(6.23-6.29)</div>
        <div class="chart" id="funnel-chart"></div>
        ${extraText}
    `;
    container.prepend(funnelContainer);
    // 渲染竖向倒三角漏斗图
    const plot = new G2Plot.Funnel('funnel-chart', {
        data: funnelDataWithRate,
        xField: 'stage',
        yField: 'value',
        isTransposed: false, // 竖向
        dynamicHeight: false, // 倒三角
        funnelStyle: {
            stroke: '#fff',
            lineWidth: 2,
            fill: 'rgba(0, 204, 181, 0.95)'
        },
        label: {
            position: 'middle',
            style: {
                fill: '#fff',
                fontSize: 22,
                fontWeight: 'bold',
                shadowColor: '#000',
                shadowBlur: 2
            },
            formatter: (datum) => `${datum.value}`
        },
        compareField: 'stage',
        conversionTag: {
            // 右侧显示转化率
            formatter: (datum) => {
                if (datum.rate === 1) return '';
                return `${(datum.rate * 100).toFixed(2)}%`;
            },
            offsetX: 30,
            style: {
                fontSize: 18,
                fill: '#b3c6e0',
                fontWeight: 'bold',
            }
        },
        tooltip: {
            formatter: (datum) => {
                return {
                    name: datum.stage,
                    value: datum.value,
                };
            },
        },
        legend: false,
        animation: false,
    });
    plot.render();
}

// 日期字符串转Date对象（支持0623-0629、2023-06-23等格式）
function parseDate(str) {
    if (!str) return 0;
    // 支持0623-0629格式，取前四位为月日，补年份
    if (/^\d{4}-\d{4}$/.test(str)) {
        const year = new Date().getFullYear();
        const [m1d1, m2d2] = str.split('-');
        // 取第一个日期
        return new Date(`${year}-${m1d1.slice(0,2)}-${m1d1.slice(2,4)}`).getTime();
    }
    // 支持2023-06-23等
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        return new Date(str).getTime();
    }
    // 兜底
    return new Date(str).getTime() || 0;
}

// 格式化数值显示
function formatValue(value) {
    if (typeof value !== 'number') return value;
    if (value >= 1000000) {
        return (value / 1000000).toFixed(2) + 'M';
    } else if (value >= 1000) {
        return (value / 1000).toFixed(2) + 'K';
    } else if (value < 1) {
        return value.toFixed(4);
    } else {
        return value.toFixed(2);
    }
}

// 渲染付费时长分布图
function renderPayTimeCharts(payTimeData, container) {
    // 渲染天分布图
    if (payTimeData.付费时长分布_天) {
        const dayContainer = createChartContainer(payTimeData.付费时长分布_天.title);
        container.appendChild(dayContainer);
        
        setTimeout(() => {
            renderBarChart(
                payTimeData.付费时长分布_天.data,
                dayContainer.querySelector('.chart'),
                'range',
                'count',
                '#1890FF'
            );
        }, 100);
    }
    
    // 渲染小时分布图
    if (payTimeData.付费时长分布_小时) {
        const hourContainer = createChartContainer(payTimeData.付费时长分布_小时.title);
        container.appendChild(hourContainer);
        
        setTimeout(() => {
            renderBarChart(
                payTimeData.付费时长分布_小时.data,
                hourContainer.querySelector('.chart'),
                'range',
                'count',
                '#F5A623'
            );
        }, 200);
    }
}

// 渲染柱状图
function renderBarChart(data, container, xField, yField, color) {
    if (!data || data.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:#bbb;padding:40px 0;">无有效数据</div>';
        return;
    }
    
    const plot = new G2Plot.Column(container, {
        data: data,
        xField: xField,
        yField: yField,
        color: color,
        columnStyle: {
            radius: [4, 4, 0, 0],
        },
        xAxis: {
            title: {
                text: '时长区间',
                style: {
                    fontSize: 14,
                    fontWeight: 'bold',
                },
            },
            label: {
                style: {
                    fontSize: 12,
                },
                autoRotate: true,
                autoHide: true,
            },
        },
        yAxis: {
            title: {
                text: '用户数量',
                style: {
                    fontSize: 14,
                    fontWeight: 'bold',
                },
            },
            label: {
                style: {
                    fontSize: 12,
                },
                formatter: (value) => {
                    if (typeof value !== 'number' || isNaN(value)) return value;
                    if (value >= 1000) {
                        return (value / 1000).toFixed(1) + 'K';
                    } else {
                        return value.toFixed(0);
                    }
                },
            },
        },
        tooltip: {
            showMarkers: false,
            shared: true,
            showCrosshairs: true,
            crosshairs: {
                type: 'xy',
            },
            formatter: (datum) => {
                return {
                    name: datum[xField],
                    value: datum[yField],
                };
            },
        },
        grid: {
            line: {
                style: {
                    stroke: '#f0f0f0',
                    lineWidth: 1,
                },
            },
        },
        theme: {
            geometries: {
                column: {
                    column: {
                        active: {
                            style: {
                                fillOpacity: 0.8,
                            },
                        },
                    },
                },
            },
        },
    });
    plot.render();
}

// 渲染转化率趋势图
function renderConversionTrendChart(conversionTrendData, container) {
    if (conversionTrendData.转化率趋势) {
        const trendContainer = createChartContainer(conversionTrendData.转化率趋势.title);
        container.appendChild(trendContainer);
        
        setTimeout(() => {
            renderConversionTrendLineChart(
                conversionTrendData.转化率趋势.data,
                trendContainer.querySelector('.chart')
            );
        }, 300);
    }
}

// 渲染转化率趋势折线图
function renderConversionTrendLineChart(data, container) {
    if (!data || data.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:#bbb;padding:40px 0;">无有效数据</div>';
        return;
    }
    
    // 转换数据格式
    const chartData = [];
    data.forEach(item => {
        if (item.D7转化率 !== null && item.D7转化率 !== undefined) {
            chartData.push({
                period: item.period,
                value: item.D7转化率,
                type: 'D7转化率'
            });
        }
        if (item.D14转化率 !== null && item.D14转化率 !== undefined) {
            chartData.push({
                period: item.period,
                value: item.D14转化率,
                type: 'D14转化率'
            });
        }
        if (item.D30转化率 !== null && item.D30转化率 !== undefined) {
            chartData.push({
                period: item.period,
                value: item.D30转化率,
                type: 'D30转化率'
            });
        }
    });
    
    const plot = new G2Plot.Line(container, {
        data: chartData,
        xField: 'period',
        yField: 'value',
        seriesField: 'type',
        smooth: true,
        color: ['#1890FF', '#2FC25B', '#FACC14'],
        point: {
            size: 5,
            shape: 'circle',
            style: {
                stroke: '#fff',
                lineWidth: 2,
            },
        },
        line: {
            style: {
                lineWidth: 3,
            },
        },
        xAxis: {
            title: {
                text: '注册时间段',
                style: {
                    fontSize: 14,
                    fontWeight: 'bold',
                },
            },
            label: {
                style: {
                    fontSize: 12,
                },
            },
        },
        yAxis: {
            title: {
                text: '中位数转化率(%)',
                style: {
                    fontSize: 14,
                    fontWeight: 'bold',
                },
            },
            label: {
                style: {
                    fontSize: 12,
                },
                formatter: (value) => {
                    if (typeof value !== 'number' || isNaN(value)) return value;
                    return value.toFixed(2) + '%';
                },
            },
            min: 50,
            max: 100,
        },
        tooltip: {
            showMarkers: true,
            shared: true,
            showCrosshairs: true,
            crosshairs: {
                type: 'xy',
            },
            formatter: (datum) => {
                return {
                    name: datum.type,
                    value: datum.value.toFixed(2) + '%',
                };
            },
        },
        legend: {
            layout: 'horizontal',
            position: 'bottom',
            flipPage: false,
            itemName: {
                style: {
                    fontSize: 14,
                    fontWeight: 'normal',
                },
            },
        },
        grid: {
            line: {
                style: {
                    stroke: '#f0f0f0',
                    lineWidth: 1,
                },
            },
        },
        theme: {
            geometries: {
                point: {
                    circle: {
                        active: {
                            style: {
                                r: 8,
                                fillOpacity: 0.8,
                            },
                        },
                    },
                },
            },
        },
    });
    plot.render();
}

document.addEventListener('DOMContentLoaded', loadDataAndRenderCharts); 