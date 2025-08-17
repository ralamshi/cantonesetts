// ===================================================
// 檔案: utils/cache.js - 緩存工具
// ===================================================
class SimpleCache {
    constructor(ttl = 300000) { // 5 分鐘默認 TTL
        this.cache = new Map();
        this.ttl = ttl;
    }

    set(key, value, customTTL) {
        const ttl = customTTL || this.ttl;
        const expiresAt = Date.now() + ttl;
        
        this.cache.set(key, {
            value,
            expiresAt
        });
        
        // 自動清理過期項目
        setTimeout(() => {
            this.delete(key);
        }, ttl);
    }

    get(key) {
        const item = this.cache.get(key);
        
        if (!item) {
            return null;
        }
        
        if (Date.now() > item.expiresAt) {
            this.cache.delete(key);
            return null;
        }
        
        return item.value;
    }

    delete(key) {
        return this.cache.delete(key);
    }

    clear() {
        this.cache.clear();
    }

    size() {
        return this.cache.size;
    }

    // 清理過期項目
    cleanup() {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now > item.expiresAt) {
                this.cache.delete(key);
            }
        }
    }
}

// 創建全局緩存實例
const globalCache = new SimpleCache();

// 定期清理緩存
setInterval(() => {
    globalCache.cleanup();
}, 60000); // 每分鐘清理一次

module.exports = {
    SimpleCache,
    globalCache
};