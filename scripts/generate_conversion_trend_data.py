import pandas as pd
import json
import datetime

def generate_conversion_trend_data():
    """
    生成转化率趋势数据，用于网页展示
    """
    
    # 读取数据
    file_path = '../data/3月以来的付费用户情况.xlsx'
    df = pd.read_excel(file_path)
    
    # 转换时间列为datetime类型
    df['注册时间'] = pd.to_datetime(df['注册时间'])
    df['首次付费时间'] = pd.to_datetime(df['首次付费时间'], errors='coerce')
    
    # 只保留有注册时间的用户
    df = df.dropna(subset=['注册时间'])
    
    # 计算注册日期（去掉时间部分）
    df['注册日期'] = df['注册时间'].dt.date
    
    # 计算注册到付费的天数
    df['注册到付费天数'] = (df['首次付费时间'] - df['注册时间']).dt.days
    
    # 获取每个注册日期的用户数
    daily_registrations = df.groupby('注册日期').size().reset_index(name='注册人数')
    
    # 计算每个注册日期的转化率
    conversion_results = []
    
    for i, row in daily_registrations.iterrows():
        reg_date = row['注册日期']
        reg_count = row['注册人数']
        
        # 获取该日期注册的用户
        date_users = df[df['注册日期'] == reg_date]
        
        # 计算该日期注册用户的转化情况
        d7_paid = len(date_users[(date_users['注册到付费天数'] >= 0) & (date_users['注册到付费天数'] <= 7)])
        d14_paid = len(date_users[(date_users['注册到付费天数'] >= 0) & (date_users['注册到付费天数'] <= 14)])
        d30_paid = len(date_users[(date_users['注册到付费天数'] >= 0) & (date_users['注册到付费天数'] <= 30)])
        
        d7_rate = d7_paid / reg_count if reg_count > 0 else 0
        d14_rate = d14_paid / reg_count if reg_count > 0 else 0
        d30_rate = d30_paid / reg_count if reg_count > 0 else 0
        
        conversion_results.append({
            '注册日期': reg_date,
            '注册人数': reg_count,
            'D7付费人数': d7_paid,
            'D14付费人数': d14_paid,
            'D30付费人数': d30_paid,
            'D7转化率': d7_rate,
            'D14转化率': d14_rate,
            'D30转化率': d30_rate
        })
    
    # 转换为DataFrame
    results_df = pd.DataFrame(conversion_results)
    
    # ========== 分时间段中位数趋势图 ==========
    period_labels = [
        "0623-0629", "0616-0622", "0609-0615", "0602-0608", "0526-0601", "0519-0525", "0512-0518", "0505-0511", "0428-0504", "0421-0427", "0414-0420"
    ]
    period_ranges = [
        ("2025-06-23", "2025-06-29"),
        ("2025-06-16", "2025-06-22"),
        ("2025-06-09", "2025-06-15"),
        ("2025-06-02", "2025-06-08"),
        ("2025-05-26", "2025-06-01"),
        ("2025-05-19", "2025-05-25"),
        ("2025-05-12", "2025-05-18"),
        ("2025-05-05", "2025-05-11"),
        ("2025-04-28", "2025-05-04"),
        ("2025-04-21", "2025-04-27"),
        ("2025-04-14", "2025-04-20")
    ]
    
    period_ranges = [
        (datetime.datetime.strptime(start, "%Y-%m-%d").date(), datetime.datetime.strptime(end, "%Y-%m-%d").date())
        for start, end in period_ranges
    ]
    
    # 只保留D7、D14、D30
    period_conv_types = ['D7转化率', 'D14转化率', 'D30转化率']
    period_medians = {conv: [] for conv in period_conv_types}
    period_labels = period_labels[::-1]
    period_ranges = period_ranges[::-1]
    
    for start, end in period_ranges:
        mask = (results_df['注册日期'] >= start) & (results_df['注册日期'] <= end)
        for conv in period_conv_types:
            median_val = results_df.loc[mask, conv].median() if mask.any() else None
            period_medians[conv].append(median_val)
    
    # 生成数据格式
    trend_data = []
    for i, period in enumerate(period_labels):
        trend_data.append({
            "period": period,
            "D7转化率": period_medians['D7转化率'][i] * 100 if period_medians['D7转化率'][i] is not None else None,
            "D14转化率": period_medians['D14转化率'][i] * 100 if period_medians['D14转化率'][i] is not None else None,
            "D30转化率": period_medians['D30转化率'][i] * 100 if period_medians['D30转化率'][i] is not None else None
        })
    
    # 创建输出数据结构
    conversion_trend_data = {
        "转化率趋势": {
            "title": "D7/D14/D30转化率分时间段中位数趋势",
            "data": trend_data
        }
    }
    
    # 保存到JSON文件
    output_path = '../public/conversion_trend_data.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(conversion_trend_data, f, ensure_ascii=False, indent=2)
    
    print(f"转化率趋势数据已生成并保存到: {output_path}")
    print(f"时间段数量: {len(trend_data)}")
    
    return conversion_trend_data

if __name__ == "__main__":
    generate_conversion_trend_data() 