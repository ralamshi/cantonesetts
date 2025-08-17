class TranslateService {
    constructor() {
      try {
        // 嘗試初始化 Google Translate
        if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
          const { Translate } = require('@google-cloud/translate').v2;
          const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
          this.translate = new Translate({
            credentials: credentials,
            projectId: credentials.project_id
          });
          this.isConfigured = true;
          console.log('✅ Google 翻譯服務配置正常');
        } else {
          this.isConfigured = false;
          console.log('⚠️  Google 翻譯服務未配置，將使用本地詞典');
        }
      } catch (error) {
        console.warn('⚠️  Google 翻譯服務初始化失敗，使用本地詞典:', error.message);
        this.isConfigured = false;
      }
  
      this.languageMap = {
        'yue': 'zh',
        'zh': 'zh-cn',
        'en': 'en',
        'ja': 'ja',
        'ko': 'ko',
        'de': 'de'
      };
    }
  
    async translateText(text, from, to) {
      try {
        // 特殊處理：粵語和普通話之間的翻譯
        if ((from === 'yue' && to === 'zh') || (from === 'zh' && to === 'yue')) {
          return this.translateCantoneseAndMandarin(text, from, to);
        }
  
        // 如果配置了 Google Translate，使用 API
        if (this.isConfigured) {
          const fromLang = this.languageMap[from];
          const toLang = this.languageMap[to];
          
          const [translation] = await this.translate.translate(text, {
            from: fromLang,
            to: toLang
          });
          
          return translation;
        } else {
          // 使用本地詞典翻譯
          return this.localTranslate(text, from, to);
        }
      } catch (error) {
        console.error('翻譯錯誤:', error);
        // 如果 API 失敗，回退到本地翻譯
        return this.localTranslate(text, from, to);
      }
    }
  
// 替換 services/translateService.js 中的 translateCantoneseAndMandarin 函數

translateCantoneseAndMandarin(text, from, to) {
  // 更完整的粵語普通話對照詞典
  const cantoneseMappings = {
    // 基本詞彙
    '係': '是',
    '唔': '不',
    '唔係': '不是',
    '佢': '他',
    '佢哋': '他們',
    '嘅': '的',
    '咗': '了',
    '緊': '著',
    '咁': '這樣',
    '咁樣': '這樣',
    
    // 疑問詞
    '點': '怎麼',
    '點樣': '怎麼樣',
    '邊': '哪',
    '邊個': '誰',
    '邊度': '哪裡',
    '乜': '什麼',
    '乜嘢': '什麼',
    '幾': '多',
    '幾多': '多少',
    '幾時': '什麼時候',
    '點解': '為什麼',
    
    // 動詞
    '食': '吃',
    '飲': '喝',
    '睇': '看',
    '聽': '聽',
    '講': '說',
    '話': '說',
    '行': '走',
    '企': '站',
    '坐': '坐',
    '瞓': '睡',
    '瞓覺': '睡覺',
    '起身': '起床',
    '沖涼': '洗澡',
    '食飯': '吃飯',
    '返工': '上班',
    '放工': '下班',
    '返學': '上學',
    '放學': '放學',
    '買嘢': '買東西',
    '揸車': '開車',
    
    // 形容詞
    '靚': '漂亮',
    '好靚': '很漂亮',
    '醜': '醜',
    '好': '好',
    '唔好': '不好',
    '大': '大',
    '細': '小',
    '高': '高',
    '矮': '矮',
    '肥': '胖',
    '瘦': '瘦',
    '長': '長',
    '短': '短',
    '新': '新',
    '舊': '舊',
    '乾淨': '乾淨',
    '污糟': '髒',
    
    // 時間詞
    '今日': '今天',
    '聽日': '明天',
    '尋日': '昨天',
    '而家': '現在',
    '一陣': '一會兒',
    '早晨': '早上',
    '中午': '中午',
    '下晝': '下午',
    '夜晚': '晚上',
    '今晚': '今晚',
    '今個星期': '這個星期',
    '下個星期': '下個星期',
    '今個月': '這個月',
    '今年': '今年',
    
    // 地點詞
    '屋企': '家',
    '間房': '房間',
    '廚房': '廚房',
    '廁所': '廁所',
    '公司': '公司',
    '學校': '學校',
    '醫院': '醫院',
    '餐廳': '餐廳',
    '商場': '商場',
    '公園': '公園',
    '車站': '車站',
    '機場': '機場',
    
    // 天氣詞
    '天氣': '天氣',
    '熱': '熱',
    '凍': '冷',
    '暖': '溫暖',
    '涼': '涼爽',
    '落雨': '下雨',
    '出太陽': '晴天',
    '多雲': '多雲',
    '大風': '大風',
    
    // 情感詞
    '開心': '開心',
    '唔開心': '不開心',
    '高興': '高興',
    '傷心': '傷心',
    '嬲': '生氣',
    '驚': '害怕',
    '緊張': '緊張',
    '放鬆': '放鬆',
    
    // 數量詞
    '好多': '很多',
    '好少': '很少',
    '全部': '全部',
    '啲': '一些',
    '啲啲': '一點點',
    '少少': '一點點',
    
    // 程度詞
    '好': '很',
    '非常': '非常',
    '超': '超',
    '幾': '挺',
    '有啲': '有點',
    
    // 常用短語
    '你好': '你好',
    '唔該': '謝謝',
    '多謝': '謝謝',
    '對唔住': '對不起',
    '唔好意思': '不好意思',
    '冇問題': '沒問題',
    '得': '可以',
    '唔得': '不可以',
    '係啦': '是的',
    '唔係啦': '不是的',
    
    // 學習相關
    '讀書': '學習',
    '溫書': '復習',
    '考試': '考試',
    '測驗': '測驗',
    '功課': '作業',
    '老師': '老師',
    '同學': '同學',
    '課程': '課程',
    '專業': '專業',
    '培訓': '培訓',
    '西廚': '西餐廚師',
    '烘焙': '烘焙',
    '管理': '管理',
    
    // 工作相關
    '工作': '工作',
    '職業': '職業',
    '老闆': '老闆',
    '同事': '同事',
    '會議': '會議',
    '報告': '報告',
    '項目': '項目',
    '客戶': '客戶'
  };

  let result = text;
  
  if (from === 'yue' && to === 'zh') {
    // 粵語轉普通話
    console.log('執行粵語→普通話翻譯');
    for (const [cantonese, mandarin] of Object.entries(cantoneseMappings)) {
      // 使用全局替換，保持大小寫
      const regex = new RegExp(cantonese.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      result = result.replace(regex, mandarin);
    }
  } else if (from === 'zh' && to === 'yue') {
    // 普通話轉粵語
    console.log('執行普通話→粵語翻譯');
    for (const [cantonese, mandarin] of Object.entries(cantoneseMappings)) {
      // 反向替換
      const regex = new RegExp(mandarin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      result = result.replace(regex, cantonese);
    }
  }

  console.log(`翻譯結果: "${text}" -> "${result}"`);
  return result;
}
  
  module.exports = { TranslateService };