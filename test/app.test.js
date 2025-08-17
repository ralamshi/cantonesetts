// ===================================================
// 檔案: test/app.test.js - 應用程式測試
// ===================================================
const request = require('supertest');
const app = require('../server');

describe('Application Tests', () => {
    describe('Health Check', () => {
        it('should return 200 for health check', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);
            
            expect(response.body.status).toBe('OK');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('uptime');
        });
    });

    describe('Static Files', () => {
        it('should serve index.html', async () => {
            await request(app)
                .get('/')
                .expect(200)
                .expect('Content-Type', /html/);
        });
    });

    describe('API Rate Limiting', () => {
        it('should enforce rate limits', async () => {
            // 發送大量請求測試速率限制
            const promises = Array(110).fill().map(() => 
                request(app).get('/health')
            );
            
            const responses = await Promise.all(promises);
            const rateLimitedResponses = responses.filter(res => res.status === 429);
            
            expect(rateLimitedResponses.length).toBeGreaterThan(0);
        });
    });
});