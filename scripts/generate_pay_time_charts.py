import pandas as pd
import json
import os

def generate_pay_time_data():
    """
    生成付费时长分布数据，用于网页展示
    """
    
    # 读取数据
    file_path = '../data/Result_10.xlsx'
    df = pd.read_excel(file_path)
    
    # 只保留有首次付费时间的用户
    paid_df = df.dropna(subset=['首次付费时间']).copy()
    paid_df['注册时间'] = pd.to_datetime(paid_df['注册时间'])
    paid_df['首次付费时间'] = pd.to_datetime(paid_df['首次付费时间'])
    
    # 1. 所有付费用户：注册到付费时长分布（天）- 限制在35天
    paid_df['付费时长_天'] = (paid_df['首次付费时间'] - paid_df['注册时间']).dt.days
    
    # 限制在35天内，超过35天的归为35天
    paid_df['付费时长_天_限制'] = paid_df['付费时长_天'].clip(upper=35)
    
    # 生成0-35天的分布
    day_bins = list(range(0, 36))  # 0,1,...,35
    paid_df['付费时长区间_天'] = pd.cut(paid_df['付费时长_天_限制'], bins=day_bins, right=False, include_lowest=True)
    day_dist = paid_df['付费时长区间_天'].value_counts().sort_index()
    
    # 生成数据格式
    day_data = []
    for i in range(35):
        label = f"{i}-{i+1}天"
        count = day_dist.get(i, 0)
        day_data.append({
            "range": label,
            "count": int(count)
        })
    
    # 2. 24小时内付费用户：注册到付费时长分布（小时）
    paid_df['付费时长_小时'] = (paid_df['首次付费时间'] - paid_df['注册时间']).dt.total_seconds() / 3600
    within_24h = paid_df[(paid_df['付费时长_小时'] >= 0) & (paid_df['付费时长_小时'] < 24)]
    
    hour_bins = list(range(0, 25))
    within_24h['付费时长区间_小时'] = pd.cut(within_24h['付费时长_小时'], bins=hour_bins, right=False, include_lowest=True)
    hour_dist = within_24h['付费时长区间_小时'].value_counts().sort_index()
    
    # 生成小时数据格式
    hour_data = []
    for i in range(24):
        label = f"{i}-{i+1}h"
        count = hour_dist.get(i, 0)
        hour_data.append({
            "range": label,
            "count": int(count)
        })
    
    # 创建输出数据结构
    pay_time_data = {
        "付费时长分布_天": {
            "title": "所有付费用户注册到付费时长分布（天）",
            "data": day_data
        },
        "付费时长分布_小时": {
            "title": "24小时内付费用户注册到付费时长分布（小时）",
            "data": hour_data
        }
    }
    
    # 保存到JSON文件
    output_path = '../public/pay_time_data.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(pay_time_data, f, ensure_ascii=False, indent=2)
    
    print(f"付费时长分布数据已生成并保存到: {output_path}")
    print(f"天分布数据点数量: {len(day_data)}")
    print(f"小时分布数据点数量: {len(hour_data)}")
    
    return pay_time_data

if __name__ == "__main__":
    generate_pay_time_data() 