# ===================================================
# 檔案: scripts/backup.sh - 備份腳本
# ===================================================
#!/bin/bash

BACKUP_DIR="backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="lovensay_backup_$DATE.tar.gz"

echo -e "${GREEN}💾 開始備份...${NC}"

# 創建備份目錄
mkdir -p $BACKUP_DIR

# 創建備份（排除敏感文件）
tar -czf "$BACKUP_DIR/$BACKUP_FILE" \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=logs \
    --exclude=.env \
    --exclude=backups \
    .

echo -e "${GREEN}✅ 備份完成: $BACKUP_DIR/$BACKUP_FILE${NC}"

# 保留最近 10 個備份
cd $BACKUP_DIR
ls -t lovensay_backup_*.tar.gz | tail -n +11 | xargs -r rm

echo -e "${GREEN}🗂️  備份清理完成${NC}"
