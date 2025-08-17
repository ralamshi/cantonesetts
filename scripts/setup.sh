# ===================================================
# 檔案: scripts/setup.sh - 初始化腳本
# ===================================================
#!/bin/bash

# 設置顏色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 開始設置 LoveNSay 多語言 TTS 系統${NC}"

# 檢查 Node.js 版本
node_version=$(node --version 2>/dev/null)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Node.js 已安裝: $node_version${NC}"
else
    echo -e "${RED}❌ 請先安裝 Node.js 16+ 版本${NC}"
    exit 1
fi

# 檢查 npm 版本
npm_version=$(npm --version 2>/dev/null)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ npm 已安裝: $npm_version${NC}"
else
    echo -e "${RED}❌ npm 未安裝${NC}"
    exit 1
fi

# 創建必要目錄
echo -e "${YELLOW}📁 創建項目目錄...${NC}"
mkdir -p logs
mkdir -p public
mkdir -p test

# 創建 logs/.gitkeep
touch logs/.gitkeep

# 複製環境變數檔案
if [ ! -f .env ]; then
    echo -e "${YELLOW}📋 創建環境變數檔案...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠️  請編輯 .env 檔案並填入正確的 API 金鑰${NC}"
fi

# 安裝依賴
echo -e "${YELLOW}📦 安裝 npm 依賴...${NC}"
npm install

# 設置權限
chmod +x scripts/*.sh

echo -e "${GREEN}✅ 設置完成！${NC}"
echo -e "${YELLOW}接下來的步驟:${NC}"
echo -e "1. 編輯 .env 檔案，填入 API 金鑰"
echo -e "2. 運行 ${GREEN}npm run dev${NC} 開始開發"
echo -e "3. 訪問 ${GREEN}http://localhost:3001${NC} 查看應用"
