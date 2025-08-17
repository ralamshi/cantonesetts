# ===================================================
# 檔案: scripts/deploy.sh - 部署腳本
# ===================================================
#!/bin/bash

set -e

echo -e "${GREEN}🚀 開始部署到 Zeabur...${NC}"

# 檢查環境變數
if [ -z "$ZEABUR_TOKEN" ]; then
    echo -e "${RED}❌ ZEABUR_TOKEN 環境變數未設置${NC}"
    exit 1
fi

# 運行測試
echo -e "${YELLOW}🧪 運行測試...${NC}"
npm test

# 檢查代碼格式
echo -e "${YELLOW}🎨 檢查代碼格式...${NC}"
npm run lint

# 構建應用
echo -e "${YELLOW}🔨 構建應用...${NC}"
npm run build

# 部署
echo -e "${YELLOW}🚀 部署中...${NC}"
zeabur deploy

echo -e "${GREEN}✅ 部署完成！${NC}"
