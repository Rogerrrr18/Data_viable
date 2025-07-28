import pandas as pd
import matplotlib
matplotlib.rcParams['font.sans-serif'] = ['SimHei', 'Microsoft YaHei']
matplotlib.rcParams['axes.unicode_minus'] = False
import matplotlib.pyplot as plt
from openpyxl import load_workbook
from openpyxl.drawing.image import Image as XLImage

# 读取数据
file_path = '/Users/rogeryang/Desktop/数据看板可视化/data/Result_10.xlsx'
df = pd.read_excel(file_path)

# 只保留有首次付费时间的用户
paid_df = df.dropna(subset=['首次付费时间']).copy()
paid_df['注册时间'] = pd.to_datetime(paid_df['注册时间'])
paid_df['首次付费时间'] = pd.to_datetime(paid_df['首次付费时间'])

# 1. 所有付费用户：注册到付费时长分布（天）
paid_df['付费时长_天'] = (paid_df['首次付费时间'] - paid_df['注册时间']).dt.days
max_days = paid_df['付费时长_天'].max()
day_bins = list(range(0, max_days + 2))  # 0,1,...,max+1
paid_df['付费时长区间_天'] = pd.cut(paid_df['付费时长_天'], bins=day_bins, right=False, include_lowest=True)
day_dist = paid_df['付费时长区间_天'].value_counts().sort_index()
day_labels = [f"{i}-{i+1}天" for i in range(0, max_days+1)]
day_freq = pd.DataFrame({'付费时长区间(天)': day_labels, '频数': day_dist.values})

# 画图（天）
plt.figure(figsize=(10,6))
plt.bar(day_labels, day_dist.values, color='#4A90E2')
plt.xlabel('注册到付费时长（天）')
plt.ylabel('用户数')
plt.title('所有付费用户注册到付费时长分布（天）')
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig('pay_time_distribution_days.png')
plt.close()

# 2. 24小时内付费用户：注册到付费时长分布（小时）
paid_df['付费时长_小时'] = (paid_df['首次付费时间'] - paid_df['注册时间']).dt.total_seconds() / 3600
within_24h = paid_df[(paid_df['付费时长_小时'] >= 0) & (paid_df['付费时长_小时'] < 24)]
hour_bins = list(range(0, 25))
within_24h['付费时长区间_小时'] = pd.cut(within_24h['付费时长_小时'], bins=hour_bins, right=False, include_lowest=True)
hour_dist = within_24h['付费时长区间_小时'].value_counts().sort_index()
hour_labels = [f"{i}-{i+1}h" for i in range(24)]
hour_freq = pd.DataFrame({'付费时长区间(小时)': hour_labels, '频数': hour_dist.values})

# 画图（小时）
plt.figure(figsize=(10,6))
plt.bar(hour_labels, hour_dist.values, color='#F5A623')
plt.xlabel('注册到付费时长（小时）')
plt.ylabel('用户数')
plt.title('24小时内付费用户注册到付费时长分布（小时）')
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig('pay_time_distribution_hours.png')
plt.close()

# 写入Excel
output_file = 'pay_time_distribution.xlsx'
with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
    day_freq.to_excel(writer, sheet_name='付费时长分布(天)', index=False)
    hour_freq.to_excel(writer, sheet_name='24小时内付费时长分布(小时)', index=False)

# 插入图片到Excel
wb = load_workbook(output_file)
# 天
ws1 = wb['付费时长分布(天)']
img1 = XLImage('pay_time_distribution_days.png')
img1.anchor = 'E2'
ws1.add_image(img1)
# 小时
ws2 = wb['24小时内付费时长分布(小时)']
img2 = XLImage('pay_time_distribution_hours.png')
img2.anchor = 'E2'
ws2.add_image(img2)
wb.save(output_file)
print(f'分析完成，结果已保存到 {output_file}，图表已嵌入Excel。') 