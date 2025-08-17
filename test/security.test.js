// ===================================================
// 檔案: test/security.test.js - 安全性測試
// ===================================================
const request = require('supertest');
const app = require('../server');

describe('Security Tests', () => {
    describe('Input Sanitization', () => {
        it('should sanitize XSS attempts', async () => {
            const maliciousInput = '<script>alert("xss")</script>';
            
            const response = await request(app)
                .post('/api/v1/synthesize')
                .send({
                    text: maliciousInput,
                    engine: 'google',
                    voice: 'yue-HK-Standard-A',
                    language: 'yue'
                });
            
            // 應該被清理或拒絕
            if (response.status === 200) {
                expect(response.body.metadata.textLength).toBeLessThan(maliciousInput.length);
            }
        });

        it('should handle SQL injection attempts', async () => {
            const sqlInjection = "'; DROP TABLE users; --";
            
            await request(app)
                .post('/api/v1/translate')
                .send({
                    text: sqlInjection,
                    from: 'yue',
                    to: 'zh'
                })
                .expect(res => {
                    // 應該正常處理或拒絕，不應該報告數據庫錯誤
                    expect(res.body.message).not.toMatch(/sql|database|table/i);
                });
        });
    });

    describe('Headers Security', () => {
        it('should set security headers', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);
            
            expect(response.headers['x-frame-options']).toBeDefined();
            expect(response.headers['x-content-type-options']).toBe('nosniff');
        });
    });
});