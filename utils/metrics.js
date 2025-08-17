// ===================================================
// 檔案: routes/metrics.js - 指標 API 端點
// ===================================================
const express = require('express');
const router = express.Router();
const { globalMetrics } = require('../utils/metrics');
const { validateApiKey } = require('../middleware/auth');

// 獲取系統指標
router.get('/', validateApiKey, (req, res) => {
    try {
        const metrics = globalMetrics.getMetrics();
        
        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            metrics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get metrics',
            error: error.message
        });
    }
});

// 重置指標
router.post('/reset', validateApiKey, (req, res) => {
    try {
        globalMetrics.reset();
        
        res.json({
            success: true,
            message: 'Metrics reset successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to reset metrics',
            error: error.message
        });
    }
});

module.exports = router;