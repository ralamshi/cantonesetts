// ===================================================
// 檔案: test/setup.js - 測試設置
// ===================================================
// 設置測試環境變數
process.env.NODE_ENV = 'test';
process.env.PORT = '0'; // 使用隨機端口
process.env.LOG_LEVEL = 'error'; // 減少測試時的日誌輸出

// 模擬外部 API 調用（如果不想在測試中真實調用）
jest.setTimeout(30000);

// 全局測試配置
beforeAll(() => {
    console.log('🧪 開始測試...');
});

afterAll(() => {
    console.log('✅ 測試完成！');
});
