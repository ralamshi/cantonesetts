const textToSpeech = require('@google-cloud/text-to-speech');
require('dotenv').config();

async function listVoices() {
    try {
        const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
        const client = new textToSpeech.TextToSpeechClient({
            credentials: credentials
        });

        console.log('🔍 正在查詢 Google Cloud TTS 支援的語音...\n');

        const [result] = await client.listVoices({});
        const voices = result.voices;

        // 篩選我們需要的語言
        const languages = ['yue-HK', 'zh-CN', 'en-US', 'ja-JP', 'ko-KR', 'de-DE'];
        
        languages.forEach(lang => {
            console.log(`\n📢 ${lang} 語音:`);
            const langVoices = voices.filter(voice => 
                voice.languageCodes.includes(lang)
            );
            
            langVoices.forEach(voice => {
                console.log(`  ${voice.name} (${voice.ssmlGender})`);
            });
        });

    } catch (error) {
        console.error('❌ 錯誤:', error.message);
    }
}

listVoices();