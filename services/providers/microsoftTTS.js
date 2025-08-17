const axios = require('axios');

class MicrosoftTTSClient {
  constructor() {
    this.subscriptionKey = process.env.AZURE_SPEECH_KEY;
    this.region = process.env.AZURE_SPEECH_REGION || 'eastasia';
    this.tokenUrl = `https://${this.region}.api.cognitive.microsoft.com/sts/v1.0/issuetoken`;
    this.ttsUrl = `https://${this.region}.tts.speech.microsoft.com/cognitiveservices/v1`;
    
    if (!this.subscriptionKey) {
      console.log('⚠️  Microsoft Azure TTS 未配置：缺少 AZURE_SPEECH_KEY');
      this.isConfigured = false;
    } else {
      this.isConfigured = true;
      console.log('✅ Microsoft Azure TTS 配置正常');
    }
    
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  async getAccessToken() {
    if (!this.isConfigured) {
      throw new Error('Microsoft Azure TTS 未配置');
    }

    const now = Date.now();
    // 如果 token 還有效（提前 5 分鐘更新）
    if (this.accessToken && this.tokenExpiry && now < this.tokenExpiry - 300000) {
      return this.accessToken;
    }

    try {
      console.log('🔄 獲取 Azure 存取權杖...');
      const response = await axios.post(this.tokenUrl, null, {
        headers: {
          'Ocp-Apim-Subscription-Key': this.subscriptionKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 10000
      });

      this.accessToken = response.data;
      this.tokenExpiry = now + 600000; // 10分鐘後過期
      console.log('✅ Azure 權杖獲取成功');
      return this.accessToken;
    } catch (error) {
      console.error('❌ Azure 權杖獲取失敗:', error.response?.data || error.message);
      throw new Error(`無法獲取 Azure 存取權杖: ${error.message}`);
    }
  }

  async synthesize({ text, voice, language, rate, pitch, volume }) {
    if (!this.isConfigured) {
      throw new Error('Microsoft Azure TTS 未配置');
    }

    try {
      const token = await this.getAccessToken();
      const ssml = this.buildSSML(text, voice, rate, pitch, volume);
      
      console.log(`🎤 Microsoft TTS 合成: ${voice}`);

      const response = await axios.post(this.ttsUrl, ssml, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
          'User-Agent': 'LoveNSay-TTS-Client'
        },
        responseType: 'arraybuffer',
        timeout: 30000
      });

      return Buffer.from(response.data).toString('base64');
    } catch (error) {
      console.error('❌ Microsoft TTS 錯誤:', error.response?.data || error.message);
      throw new Error(`Microsoft 語音合成失敗: ${error.message}`);
    }
  }

  buildSSML(text, voice, rate, pitch, volume) {
    const hasSSML = text.includes('<say-as');
    const ratePercent = Math.round((rate - 1) * 100);
    const pitchHz = this.pitchToHz(pitch);
    const volumeLevel = this.volumeToLevel(volume);

    // 根據語音判斷語言
    let xmlLang = 'zh-CN';
    if (voice.includes('zh-HK')) xmlLang = 'zh-HK';
    else if (voice.includes('en-US')) xmlLang = 'en-US';
    else if (voice.includes('ja-JP')) xmlLang = 'ja-JP';
    else if (voice.includes('ko-KR')) xmlLang = 'ko-KR';
    else if (voice.includes('de-DE')) xmlLang = 'de-DE';

    return `<speak version='1.0' xml:lang='${xmlLang}' xmlns='http://www.w3.org/2001/10/synthesis'>
      <voice name='${voice}'>
        <prosody rate="${ratePercent >= 0 ? '+' : ''}${ratePercent}%" 
                 pitch="${pitchHz >= 0 ? '+' : ''}${pitchHz}Hz" 
                 volume="${volumeLevel}">
          ${text}
        </prosody>
      </voice>
    </speak>`;
  }

  pitchToHz(pitch) {
    // 將半音轉換為 Hz 偏移
    return Math.round(pitch * 50);
  }

  volumeToLevel(volume) {
    // 將 0.1-1.0 轉換為百分比
    return Math.round(volume * 100) + '%';
  }

  async getVoices(language) {
    // 返回 Microsoft 支援的語音列表
    const voices = {
      'yue': [
        { id: 'zh-HK-HiuMaanNeural', name: '曉曼', gender: 'female' },
        { id: 'zh-HK-WanLungNeural', name: '雲龍', gender: 'male' },
        { id: 'zh-HK-HiuGaaiNeural', name: '曉佳', gender: 'female' }
      ],
      'zh': [
        { id: 'zh-CN-XiaoxiaoNeural', name: '曉曉', gender: 'female' },
        { id: 'zh-CN-YunxiNeural', name: '雲希', gender: 'male' },
        { id: 'zh-CN-YunyangNeural', name: '雲揚', gender: 'male' },
        { id: 'zh-CN-XiaoyiNeural', name: '曉伊', gender: 'female' }
      ],
      'en': [
        { id: 'en-US-AvaNeural', name: 'Ava', gender: 'female' },
        { id: 'en-US-AndrewNeural', name: 'Andrew', gender: 'male' },
        { id: 'en-US-EmmaNeural', name: 'Emma', gender: 'female' },
        { id: 'en-US-BrianNeural', name: 'Brian', gender: 'male' }
      ],
      'ja': [
        { id: 'ja-JP-NanamiNeural', name: '七海', gender: 'female' },
        { id: 'ja-JP-KeitaNeural', name: '啟太', gender: 'male' },
        { id: 'ja-JP-AoiNeural', name: '葵', gender: 'female' },
        { id: 'ja-JP-DaichiNeural', name: '大地', gender: 'male' }
      ],
      'ko': [
        { id: 'ko-KR-SunHiNeural', name: '선희', gender: 'female' },
        { id: 'ko-KR-InJoonNeural', name: '인준', gender: 'male' },
        { id: 'ko-KR-JiMinNeural', name: '지민', gender: 'female' },
        { id: 'ko-KR-BongJinNeural', name: '봉진', gender: 'male' }
      ],
      'de': [
        { id: 'de-DE-KatjaNeural', name: 'Katja', gender: 'female' },
        { id: 'de-DE-ConradNeural', name: 'Conrad', gender: 'male' },
        { id: 'de-DE-AmalaNeural', name: 'Amala', gender: 'female' },
        { id: 'de-DE-BerndNeural', name: 'Bernd', gender: 'male' }
      ]
    };

    return voices[language] || [];
  }
}

module.exports = { MicrosoftTTSClient };