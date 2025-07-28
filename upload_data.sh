#!/bin/bash
# 用于自动上传本地 data/data.xlsx 到阿里云服务器

# === 请根据实际情况修改以下变量 ===
LOCAL_FILE="data/data.xlsx"
REMOTE_USER="your_username"      # 你的服务器用户名
REMOTE_HOST="your_server_ip"     # 你的服务器IP或域名
REMOTE_PATH="/your/server/project/path/data/data.xlsx"  # 服务器目标路径
# ===================================

# 上传操作
scp "$LOCAL_FILE" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH"

if [ $? -eq 0 ]; then
  echo "上传成功！"
else
  echo "上传失败，请检查用户名、IP、路径和网络连接。"
fi 