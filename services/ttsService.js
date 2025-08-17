// ===================================================
// 檔案: services/ttsService.js - TTS 服務
// ===================================================
const { GoogleTTSClient } = require('./providers/googleTTS');
const { MicrosoftTTSClient } = require('./providers/microsoftTTS');
const { OpenAITTSClient } = require('./providers/openaiTTS');
const logger = require('../utils/logger');

class TTSService {
    constructor() {
        this.providers = {
            google: new GoogleTTSClient(),
            microsoft: new MicrosoftTTSClient(),
            openai: new OpenAITTSClient()
        };
    }

    async synthesizeText({ text, engine, voice, language, rate, pitch, volume }) {
        try {
            const provider = this.providers[engine];
            if (!provider) {
                throw new Error(`Unsupported TTS engine: ${engine}`);
            }

            const audioContent = await provider.synthesize({
                text,
                voice,
                language,
                rate,
                pitch,
                volume
            });

            return audioContent;

        } catch (error) {
            logger.error(`TTS Service Error (${engine}):`, error);
            throw new Error(`TTS synthesis failed: ${error.message}`);
        }
    }

    async getAvailableVoices(engine, language) {
        try {
            const provider = this.providers[engine];
            if (!provider) {
                throw new Error(`Unsupported TTS engine: ${engine}`);
            }

            return await provider.getVoices(language);

        } catch (error) {
            logger.error(`Get Voices Error (${engine}):`, error);
            throw new Error(`Failed to get voices: ${error.message}`);
        }
    }
}

module.exports = {
    synthesizeText: async (params) => {
        const service = new TTSService();
        return await service.synthesizeText(params);
    },
    getAvailableVoices: async (engine, language) => {
        const service = new TTSService();
        return await service.getAvailableVoices(engine, language);
    }
};
