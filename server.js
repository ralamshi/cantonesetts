const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// 初始化服務
let googleTTS = null;
let microsoftTTS = null;
let translateService = null;

// Google TTS 初始化
try {
  const textToSpeech = require('@google-cloud/text-to-speech');
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    googleTTS = new textToSpeech.TextToSpeechClient({
      credentials: credentials
    });
    console.log('✅ Google TTS 配置成功');
  } else {
    console.log('⚠️  Google TTS 未配置');
  }
} catch (error) {
  console.log('⚠️  Google TTS 初始化失敗:', error.message);
}

// Microsoft TTS 初始化
try {
  const { MicrosoftTTSClient } = require('./services/providers/microsoftTTS');
  microsoftTTS = new MicrosoftTTSClient();
} catch (error) {
  console.log('⚠️  Microsoft TTS 初始化失敗:', error.message);
}

// 翻譯服務初始化
try {
  const { TranslateService } = require('./services/translateService');
  translateService = new TranslateService();
} catch (error) {
  console.log('⚠️  翻譯服務初始化失敗:', error.message);
}

// 中間件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 日誌中間件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 健康檢查
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {
      googleTTS: googleTTS ? 'Ready' : 'Not configured',
      microsoftTTS: microsoftTTS?.isConfigured ? 'Ready' : 'Not configured',
      translateService: translateService?.isConfigured ? 'Ready' : 'Local dictionary only'
    }
  });
});

// Favicon
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Google TTS 合成函數
async function synthesizeWithGoogle(text, voice, language, rate, pitch, volume) {
  if (!googleTTS) {
    throw new Error('Google TTS 未配置');
  }

  const languageMap = {
    'yue': 'yue-HK',
    'zh': 'zh-CN',
    'en': 'en-US',
    'ja': 'ja-JP',
    'ko': 'ko-KR',
    'de': 'de-DE'
  };

  const languageCode = languageMap[language];
  const hasSSML = text.includes('<say-as');
  
  const request = {
    input: hasSSML ? { ssml: buildSSML(text, rate, pitch) } : { text: text },
    voice: {
      languageCode,
      name: voice
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: hasSSML ? 1.0 : (rate || 1.0),
      pitch: hasSSML ? 0 : ((pitch || 0) * 4),
      volumeGainDb: volumeToDb(volume || 1.0)
    }
  };

  const [response] = await googleTTS.synthesizeSpeech(request);
  return response.audioContent.toString('base64');
}

// 構建 SSML
function buildSSML(text, rate, pitch) {
  if (text.trim().startsWith('<speak>')) {
    return text;
  }
  
  const ratePercent = Math.round((rate - 1) * 100);
  const pitchSemitones = pitch || 0;
  
  return `<speak>
    <prosody rate="${ratePercent >= 0 ? '+' : ''}${ratePercent}%" pitch="${pitchSemitones >= 0 ? '+' : ''}${pitchSemitones}st">
      ${text}
    </prosody>
  </speak>`;
}

// 音量轉換
function volumeToDb(volume) {
  return Math.round(20 * Math.log10(Math.max(0.1, volume)));
}

// 語音合成 API
app.post('/api/v1/synthesize', async (req, res) => {
  try {
    const {
      text,
      engine = 'google',
      voice = 'yue-HK-Standard-A',
      language = 'yue',
      rate = 1.0,
      pitch = 0.0,
      volume = 1.0
    } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '請輸入要朗讀的文字'
      });
    }

    console.log(`🎤 TTS 請求: ${engine} | ${language} | ${voice} | "${text.substring(0, 50)}..."`);

    let audioContent;

    if (engine === 'microsoft') {
      if (!microsoftTTS?.isConfigured) {
        return res.status(503).json({
          success: false,
          message: 'Microsoft Azure TTS 服務未配置，請檢查 AZURE_SPEECH_KEY'
        });
      }
      
      audioContent = await microsoftTTS.synthesize({
        text: text.trim(),
        voice,
        language,
        rate: parseFloat(rate),
        pitch: parseFloat(pitch),
        volume: parseFloat(volume)
      });
    } else if (engine === 'google') {
      if (!googleTTS) {
        return res.status(503).json({
          success: false,
          message: 'Google TTS 服務未配置，請檢查環境變數'
        });
      }
      
      audioContent = await synthesizeWithGoogle(
        text.trim(),
        voice,
        language,
        parseFloat(rate),
        parseFloat(pitch),
        parseFloat(volume)
      );
    } else {
      return res.status(501).json({
        success: false,
        message: `${engine} 引擎開發中`
      });
    }

    res.json({
      success: true,
      audioContent,
      metadata: {
        engine,
        voice,
        language,
        textLength: text.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ TTS 錯誤:', error);
    
    let errorMessage = error.message || '語音合成失敗';
    if (error.message.includes('INVALID_ARGUMENT')) {
      errorMessage = '語音參數無效，請檢查語音選擇';
    } else if (error.message.includes('UNAUTHENTICATED')) {
      errorMessage = 'API 認證失敗，請檢查配置';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
});

// 翻譯 API
app.post('/api/v1/translate', async (req, res) => {
  try {
    const { text, from, to } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '請輸入要翻譯的文字'
      });
    }

    if (from === to) {
      return res.json({
        success: true,
        translatedText: text.trim(),
        originalText: text.trim(),
        from,
        to,
        isSameLanguage: true
      });
    }

    console.log(`🌐 翻譯請求: ${from} -> ${to} | "${text.substring(0, 50)}..."`);

    if (!translateService) {
      return res.status(503).json({
        success: false,
        message: '翻譯服務未配置'
      });
    }

    const translatedText = await translateService.translateText(text.trim(), from, to);

    res.json({
      success: true,
      translatedText,
      originalText: text.trim(),
      from,
      to,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ 翻譯錯誤:', error);
    res.status(500).json({
      success: false,
      message: error.message || '翻譯失敗'
    });
  }
});

// 語音列表 API
app.get('/api/v1/voices', async (req, res) => {
  const { engine = 'google', language = 'yue' } = req.query;
  
  try {
    let voices = [];

    if (engine === 'microsoft') {
      if (microsoftTTS?.isConfigured) {
        voices = await microsoftTTS.getVoices(language);
      }
    } else if (engine === 'google') {
      const googleVoices = {
        yue: [
          { id: 'yue-HK-Standard-A', name: '曉美', gender: 'female' },
          { id: 'yue-HK-Standard-B', name: '家明', gender: 'male' },
          { id: 'yue-HK-Standard-C', name: '小晴', gender: 'female' },
          { id: 'yue-HK-Standard-D', name: '阿仔', gender: 'male' }
        ],
        en: [
          { id: 'en-US-Standard-C', name: 'Emma', gender: 'female' },
          { id: 'en-US-Standard-A', name: 'James', gender: 'male' },
          { id: 'en-US-Standard-E', name: 'Sophie', gender: 'female' },
          { id: 'en-US-Standard-D', name: 'David', gender: 'male' }
        ],
        ja: [
          { id: 'ja-JP-Standard-A', name: '麻衣', gender: 'female' },
          { id: 'ja-JP-Standard-C', name: '太郎', gender: 'male' }
        ],
        ko: [
          { id: 'ko-KR-Standard-A', name: '지은', gender: 'female' },
          { id: 'ko-KR-Standard-C', name: '민수', gender: 'male' }
        ],
        de: [
          { id: 'de-DE-Standard-A', name: 'Anna', gender: 'female' },
          { id: 'de-DE-Standard-B', name: 'Hans', gender: 'male' }
        ]
      };
      voices = googleVoices[language] || [];
    }
    
    res.json({
      success: true,
      voices,
      engine,
      language
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 測試 Google 配置
app.post('/api/v1/test-google', (req, res) => {
  try {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      return res.status(400).json({
        success: false,
        message: 'Google 服務帳戶金鑰未配置'
      });
    }

    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    res.json({
      success: true,
      message: 'Google Cloud 配置正常',
      projectId: credentials.project_id,
      clientEmail: credentials.client_email
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Google Cloud 配置錯誤',
      error: error.message
    });
  }
});

// 測試 Azure 配置
app.post('/api/v1/test-azure', async (req, res) => {
  try {
    if (!microsoftTTS?.isConfigured) {
      return res.status(400).json({
        success: false,
        message: 'Azure 語音服務未配置',
        details: {
          hasKey: !!process.env.AZURE_SPEECH_KEY,
          hasRegion: !!process.env.AZURE_SPEECH_REGION,
          region: process.env.AZURE_SPEECH_REGION || 'not set'
        }
      });
    }

    // 測試獲取 token
    await microsoftTTS.getAccessToken();
    
    res.json({
      success: true,
      message: 'Microsoft Azure TTS 配置正常',
      region: microsoftTTS.region
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Azure TTS 配置錯誤',
      error: error.message
    });
  }
});

// 主頁
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 錯誤處理
app.use((err, req, res, next) => {
  console.error('錯誤:', err);
  res.status(500).json({
    success: false,
    message: '服務器錯誤'
  });
});

// 啟動服務器
app.listen(PORT, () => {
  console.log('\n🎉 === 見字就讀多語言TTS系統啟動成功 ===');
  console.log(`🚀 運行在: http://localhost:${PORT}`);
  console.log(`📝 環境: ${process.env.NODE_ENV || 'development'}`);
  console.log('\n📋 服務狀態:');
  console.log(`  🔧 Google TTS: ${googleTTS ? '✅ 準備就緒' : '❌ 未配置'}`);
  console.log(`  🔧 Microsoft TTS: ${microsoftTTS?.isConfigured ? '✅ 準備就緒' : '❌ 未配置'}`);
  console.log(`  🔧 翻譯服務: ${translateService?.isConfigured ? '✅ Google API' : '📚 本地詞典'}`);
  console.log('\n🔗 可用端點:');
  console.log(`  📊 健康檢查: http://localhost:${PORT}/health`);
  console.log(`  🎤 語音合成: POST http://localhost:${PORT}/api/v1/synthesize`);
  console.log(`  🌐 翻譯服務: POST http://localhost:${PORT}/api/v1/translate`);
  console.log(`  📋 語音列表: GET http://localhost:${PORT}/api/v1/voices`);
  console.log('==========================================\n');
});

module.exports = app;