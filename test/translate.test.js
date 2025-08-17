// ===================================================
// 檔案: test/translate.test.js - 翻譯服務測試
// ===================================================
const request = require('supertest');
const app = require('../server');

describe('Translation API Tests', () => {
    describe('POST /api/v1/translate', () => {
        it('should validate required fields', async () => {
            const response = await request(app)
                .post('/api/v1/translate')
                .send({})
                .expect(400);
            
            expect(response.body.success).toBe(false);
            expect(response.body.errors).toBeDefined();
        });

        it('should handle same language translation', async () => {
            const response = await request(app)
                .post('/api/v1/translate')
                .send({
                    text: '你好',
                    from: 'yue',
                    to: 'yue'
                })
                .expect(200);
            
            expect(response.body.success).toBe(true);
            expect(response.body.translatedText).toBe('你好');
        });

        it('should validate text length', async () => {
            const longText = 'a'.repeat(5001);
            
            await request(app)
                .post('/api/v1/translate')
                .send({
                    text: longText,
                    from: 'yue',
                    to: 'zh'
                })
                .expect(400);
        });
    });
});