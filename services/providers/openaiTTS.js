// ===================================================
// 檔案: services/providers/openaiTTS.js - OpenAI TTS
// ===================================================
const axios = require('axios');

class OpenAITTSClient {
    constructor() {
        this.apiKey = process.env.OPENAI_API_KEY;
        this.baseUrl = 'https://api.openai.com/v1/audio/speech';
        
        if (!this.apiKey) {
            throw new Error('OpenAI API key not configured');
        }

        this.voiceMap = {
            'alloy': 'alloy',
            'echo': 'echo',
            'fable': 'fable',
            'onyx': 'onyx',
            'nova': 'nova',
            'shimmer': 'shimmer'
        };
    }

    async synthesize({ text, voice, language, rate, pitch, volume }) {
        try {
            // OpenAI TTS 目前不支援 pitch 和 volume 調整
            const response = await axios.post(this.baseUrl, {
                model: 'tts-1-hd',
                input: text,
                voice: this.voiceMap[voice] || 'alloy',
                speed: Math.max(0.25, Math.min(4.0, rate))
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer'
            });

            return Buffer.from(response.data).toString('base64');

        } catch (error) {
            throw new Error(`OpenAI TTS error: ${error.message}`);
        }
    }

    async getVoices(language) {
        // OpenAI 目前只支援英文語音
        if (language !== 'en') {
            return [];
        }

        return [
            { name: 'alloy', gender: 'neutral', languageCode: 'en-US' },
            { name: 'echo', gender: 'male', languageCode: 'en-US' },
            { name: 'fable', gender: 'neutral', languageCode: 'en-US' },
            { name: 'onyx', gender: 'male', languageCode: 'en-US' },
            { name: 'nova', gender: 'female', languageCode: 'en-US' },
            { name: 'shimmer', gender: 'female', languageCode: 'en-US' }
        ];
    }
}

module.exports = { OpenAITTSClient };
