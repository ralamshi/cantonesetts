// ===================================================
// 檔案: test/tts.test.js - TTS 服務測試
// ===================================================
const request = require('supertest');
const app = require('../server');

describe('TTS API Tests', () => {
    const validTTSRequest = {
        text: '你好世界',
        engine: 'google',
        voice: 'yue-HK-Standard-A',
        language: 'yue',
        rate: 1.0,
        pitch: 0.0,
        volume: 1.0
    };

    describe('POST /api/v1/synthesize', () => {
        it('should validate required fields', async () => {
            const response = await request(app)
                .post('/api/v1/synthesize')
                .send({})
                .expect(400);
            
            expect(response.body.success).toBe(false);
            expect(response.body.errors).toBeDefined();
        });

        it('should validate text length', async () => {
            const longText = 'a'.repeat(5001);
            
            await request(app)
                .post('/api/v1/synthesize')
                .send({
                    ...validTTSRequest,
                    text: longText
                })
                .expect(400);
        });

        it('should validate engine type', async () => {
            await request(app)
                .post('/api/v1/synthesize')
                .send({
                    ...validTTSRequest,
                    engine: 'invalid-engine'
                })
                .expect(400);
        });

        it('should validate rate range', async () => {
            await request(app)
                .post('/api/v1/synthesize')
                .send({
                    ...validTTSRequest,
                    rate: 3.0
                })
                .expect(400);
        });

        // 注意：這個測試需要有效的 API 金鑰
        it.skip('should synthesize speech successfully', async () => {
            const response = await request(app)
                .post('/api/v1/synthesize')
                .send(validTTSRequest)
                .expect(200);
            
            expect(response.body.success).toBe(true);
            expect(response.body.audioContent).toBeDefined();
            expect(response.body.metadata).toBeDefined();
        });
    });
});
