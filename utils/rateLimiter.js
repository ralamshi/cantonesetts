// ===================================================
// 檔案: utils/rateLimiter.js - 自定義速率限制器
// ===================================================
const { globalCache } = require('./cache');

class RateLimiter {
    constructor(options = {}) {
        this.windowMs = options.windowMs || 60000; // 1 分鐘
        this.maxRequests = options.maxRequests || 60;
        this.keyGenerator = options.keyGenerator || ((req) => req.ip);
        this.cache = options.cache || globalCache;
    }

    middleware() {
        return (req, res, next) => {
            const key = `rate_limit:${this.keyGenerator(req)}`;
            const now = Date.now();
            const windowStart = now - this.windowMs;
            
            // 獲取當前窗口的請求記錄
            let requests = this.cache.get(key) || [];
            
            // 移除過期的請求記錄
            requests = requests.filter(timestamp => timestamp > windowStart);
            
            if (requests.length >= this.maxRequests) {
                return res.status(429).json({
                    success: false,
                    message: 'Too many requests',
                    code: 'RATE_LIMIT_EXCEEDED',
                    retryAfter: Math.ceil(this.windowMs / 1000)
                });
            }
            
            // 添加當前請求
            requests.push(now);
            this.cache.set(key, requests, this.windowMs);
            
            // 設置響應頭
            res.set({
                'X-RateLimit-Limit': this.maxRequests,
                'X-RateLimit-Remaining': this.maxRequests - requests.length,
                'X-RateLimit-Reset': new Date(now + this.windowMs).toISOString()
            });
            
            next();
        };
    }
}

module.exports = { RateLimiter };