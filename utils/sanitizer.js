// ===================================================
// 檔案: utils/sanitizer.js - 輸入清理工具
// ===================================================
const DOMPurify = require('isomorphic-dompurify');

const sanitizeInput = (input) => {
    if (typeof input !== 'string') {
        return '';
    }

    // 移除潛在的惡意腳本
    let cleaned = DOMPurify.sanitize(input, { 
        ALLOWED_TAGS: ['say-as'],
        ALLOWED_ATTR: ['interpret-as', 'format']
    });

    // 限制某些字符
    cleaned = cleaned.replace(/[<>]/g, '');
    
    // 移除過多的空白字符
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
};

const validateSSML = (text) => {
    // 簡單的 SSML 驗證
    const ssmlPattern = /<say-as\s+interpret-as="(cardinal|ordinal|characters|date)"(\s+format="[^"]*")?>[^<]*<\/say-as>/g;
    const matches = text.match(ssmlPattern);
    
    if (matches) {
        // 確保 SSML 標籤正確閉合
        for (const match of matches) {
            if (!match.includes('</say-as>')) {
                return false;
            }
        }
    }
    
    return true;
};

module.exports = {
    sanitizeInput,
    validateSSML
};