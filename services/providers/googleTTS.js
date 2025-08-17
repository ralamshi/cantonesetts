const textToSpeech = require('@google-cloud/text-to-speech');

class GoogleTTSClient {
    constructor() {
        try {
            const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
            this.client = new textToSpeech.TextToSpeechClient({
                credentials: credentials
            });
            
            this.languageMap = {
                'yue': 'yue-HK',
                'zh': 'zh-CN',
                'en': 'en-US',
                'ja': 'ja-JP',
                'ko': 'ko-KR',
                'de': 'de-DE'
            };
        } catch (error) {
            console.error('Google TTS 初始化錯誤:', error.message);
            this.client = null;
        }
    }

    async synthesize({ text, voice, language, rate, pitch, volume }) {
        if (!this.client) {
            throw new Error('Google TTS 客戶端未初始化');
        }

        try {
            const languageCode = this.languageMap[language];
            
            // 檢查是否包含 SSML 標籤
            const hasSSML = text.includes('<say-as');
            
            const request = {
                input: hasSSML ? { ssml: this.wrapInSSML(text, rate, pitch) } : { text: text },
                voice: {
                    languageCode,
                    name: voice
                },
                audioConfig: {
                    audioEncoding: 'MP3',
                    speakingRate: hasSSML ? 1.0 : (rate || 1.0),
                    pitch: hasSSML ? 0 : ((pitch || 0) * 4),
                    volumeGainDb: this.volumeToDb(volume || 1.0)
                }
            };

            const [response] = await this.client.synthesizeSpeech(request);
            return response.audioContent.toString('base64');

        } catch (error) {
            console.error('Google TTS 合成錯誤:', error);
            throw new Error(`語音合成失敗: ${error.message}`);
        }
    }

    wrapInSSML(text, rate, pitch) {
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

    volumeToDb(volume) {
        return Math.round(20 * Math.log10(Math.max(0.1, volume)));
    }
}

module.exports = { GoogleTTSClient };