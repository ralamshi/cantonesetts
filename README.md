# ===================================================
# 檔案: README.md - 項目說明文檔
# ===================================================
# 見字就讀 - 多語言智能語音合成工具

一個現代化的多語言文字轉語音 (TTS) 應用程式，支援廣東話、普通話、英文、日文、韓文、德文等多種語言。

## ✨ 主要功能

### 🗣️ 多語言語音合成
- **廣東話** - Google Cloud TTS 優化
- **普通話** - 支援多種聲音選擇
- **英文** - Google、Microsoft、OpenAI 三引擎支援
- **日文** - 自然流暢的日語發音
- **韓文** - 標準韓語語音
- **德文** - 地道德語發音

### 🔄 智能翻譯
- 支援語言間互相翻譯
- 特別優化廣東話 ↔ 普通話翻譯
- 使用 Google Translate API

### 🎛️ 高級控制
- **語速調節** (0.5x - 2.0x)
- **音高調整** (-10 - +10 半音)
- **音量控制** (10% - 100%)

### 🎯 魔法演繹
- **數字朗讀** - 智能識別數字讀法
- **逐字朗讀** - 字母/字符單獨發音
- **序數朗讀** - 第一、第二等序數表達
- **日期朗讀** - 智能日期格式識別

### 🎵 音頻處理
- **即時播放** - 內建音頻播放器
- **進度控制** - 可拖拽播放進度
- **下載功能** - MP3 格式下載

## 🏗️ 技術架構

### 前端技術
- **原生 HTML5/CSS3/JavaScript** - 輕量化設計
- **響應式布局** - 完美適配桌面/移動端
- **現代 CSS** - CSS Grid、Flexbox、變數
- **無依賴** - 不依賴外部框架

### 後端技術
- **Node.js + Express** - 高性能後端服務
- **多 TTS 引擎集成**:
  - Google Cloud Text-to-Speech
  - Microsoft Azure Cognitive Services
  - OpenAI TTS API
- **安全性**:
  - Helmet.js 安全頭部
  - Rate Limiting 請求限制
  - Input Sanitization 輸入清理
  - API Key 認證

### 部署平台
- **Zeabur** - 一鍵部署
- **Docker** - 容器化支援
- **GitHub Actions** - CI/CD 自動化

## 🚀 快速開始

### 1. 克隆項目
```bash
git clone https://github.com/yourusername/lovensay-tts.git
cd lovensay-tts
```

### 2. 環境設置
```bash
# 運行設置腳本
chmod +x scripts/setup.sh
./scripts/setup.sh

# 或手動設置
npm install
cp .env.example .env
```

### 3. 配置 API 金鑰
編輯 `.env` 檔案，填入以下 API 金鑰：

```env
# Google Cloud (必須 - 廣東話支援)
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
GOOGLE_TRANSLATE_API_KEY=your-key

# Microsoft Azure (可選)
AZURE_SPEECH_KEY=your-key
AZURE_SPEECH_REGION=eastasia

# OpenAI (可選)
OPENAI_API_KEY=your-key
```

### 4. 啟動開發服務器
```bash
npm run dev
```

訪問 http://localhost:3001 查看應用。

## 📋 API 文檔

### 語音合成
```
POST /api/v1/synthesize
Content-Type: application/json

{
  "text": "你好世界",
  "engine": "google",
  "voice": "yue-HK-Standard-A",
  "language": "yue",
  "rate": 1.0,
  "pitch": 0.0,
  "volume": 1.0
}
```

### 翻譯
```
POST /api/v1/translate
Content-Type: application/json

{
  "text": "你好",
  "from": "yue",
  "to": "zh"
}
```

### 獲取可用聲音
```
GET /api/v1/voices?engine=google&language=yue
```

## 🔒 安全考慮

### API 安全
- API Key 認證保護
- Rate Limiting 防止濫用
- Input Sanitization 防止 XSS
- CORS 跨域限制

### 數據保護
- 不存儲用戶輸入文本
- 音頻文件臨時生成
- 敏感配置環境變數保護

### 生產環境
```env
NODE_ENV=production
API_KEYS=your-secret-keys
ALLOWED_ORIGINS=https://yourdomain.com
```

## 🌐 部署到 Zeabur

### 1. 準備 GitHub Repository
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/lovensay-tts.git
git push -u origin main
```

### 2. 在 Zeabur 創建項目
1. 登入 [Zeabur](https://zeabur.com)
2. 連接 GitHub Repository
3. 選擇 Node.js 預設配置

### 3. 配置環境變數
在 Zeabur 控制台設置環境變數：
- `NODE_ENV=production`
- `API_KEYS=your-secret-keys`
- `GOOGLE_SERVICE_ACCOUNT_KEY=...`
- 其他 API 金鑰

### 4. 自動部署
推送代碼到 `main` 分支即可自動部署。

## 🛠️ 開發指南

### 項目結構
```
lovensay-tts/
├── server.js              # 主服務器文件
├── public/                # 前端靜態文件
│   ├── index.html         # 主頁面
│   ├── style.css          # 樣式文件
│   └── script.js          # 前端腳本
├── routes/                # API 路由
│   ├── synthesize.js      # 語音合成
│   ├── translate.js       # 翻譯服務
│   └── voices.js          # 聲音列表
├── services/              # 業務邏輯
│   ├── ttsService.js      # TTS 服務
│   ├── translateService.js # 翻譯服務
│   └── providers/         # TTS 提供商
├── middleware/            # 中間件
├── utils/                 # 工具函數
├── scripts/               # 部署腳本
└── logs/                  # 日誌文件
```

### 添加新語言
1. 在 `VOICE_DATABASE` 添加語言配置
2. 更新 `LANGUAGE_CONFIG` 添加介面文字
3. 在各 TTS 提供商添加語言映射
4. 測試語音合成和翻譯功能

### 添加新 TTS 引擎
1. 在 `services/providers/` 創建新提供商
2. 實現 `synthesize()` 和 `getVoices()` 方法
3. 在 `ttsService.js` 註冊新提供商
4. 更新前端引擎選擇器

## 📊 監控和日誌

### 健康檢查
```bash
curl http://localhost:3001/health
```

### 查看日誌
```bash
# 錯誤日誌
npm run logs:error

# 所有日誌
npm run logs:combined
```

### 監控指標
- API 響應時間
- 錯誤率統計
- 使用量統計
- 系統資源使用

## 🤝 貢獻指南

歡迎提交 Issue 和 Pull Request！

### 開發工作流程
1. Fork 本項目
2. 創建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 創建 Pull Request

### 代碼規範
- 使用 ESLint 進行代碼檢查
- 遵循 JavaScript Standard Style
- 添加適當的註釋和文檔

## 📄 許可證

本項目使用 MIT 許可證 - 查看 [LICENSE](LICENSE) 文件了解詳情。

## 🙏 致謝

- [Google Cloud Text-to-Speech](https://cloud.google.com/text-to-speech)
- [Microsoft Azure Cognitive Services](https://azure.microsoft.com/services/cognitive-services/)
- [OpenAI](https://openai.com)
- [Zeabur](https://zeabur.com) - 優秀的部署平台

## 📞 支援

- 📧 Email: support@lovensay.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/lovensay-tts/issues)
- 📖 文檔: [完整文檔](https://docs.lovensay.com)

---

Made with ❤️ by LoveNSay.com