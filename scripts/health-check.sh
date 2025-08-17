# ===================================================
# 檔案: scripts/health-check.sh - 健康檢查腳本
# ===================================================
#!/bin/bash

URL="http://localhost:${PORT:-3001}/health"
MAX_ATTEMPTS=30
ATTEMPT=1

echo -e "${YELLOW}🏥 檢查服務健康狀態...${NC}"

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $URL)
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ 服務健康 (嘗試 $ATTEMPT/$MAX_ATTEMPTS)${NC}"
        exit 0
    else
        echo -e "${YELLOW}⏳ 等待服務啟動... (嘗試 $ATTEMPT/$MAX_ATTEMPTS, HTTP: $HTTP_CODE)${NC}"
        sleep 2
        ATTEMPT=$((ATTEMPT + 1))
    fi
done

echo -e "${RED}❌ 服務健康檢查失敗${NC}"
exit 1