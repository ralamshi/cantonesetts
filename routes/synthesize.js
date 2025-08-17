// ===================================================
// 檔案: routes/synthesize.js - 語音合成路由
// ===================================================
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { synthesizeText } = require('../services/ttsService');
const { sanitizeInput } = require('../utils/sanitizer');
const logger = require('../utils/logger');

// 驗證規則
const synthesizeValidation = [
    body('text')
        .trim()
        .isLength({ min: 1, max: 5000 })
        .withMessage('Text must be between 1 and 5000 characters'),
    body('engine')
        .isIn(['google', 'microsoft', 'openai'])
        .withMessage('Invalid engine specified'),
    body('voice')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Voice must be specified'),
    body('language')
        .isIn(['yue', 'zh', 'en', 'ja', 'ko', 'de'])
        .withMessage('Invalid language specified'),
    body('rate')
        .optional()
        .isFloat({ min: 0.5, max: 2.0 })
        .withMessage('Rate must be between 0.5 and 2.0'),
    body('pitch')
        .optional()
        .isFloat({ min: -10.0, max: 10.0 })
        .withMessage('Pitch must be between -10.0 and 10.0'),
    body('volume')
        .optional()
        .isFloat({ min: 0.1, max: 1.0 })
        .withMessage('Volume must be between 0.1 and 1.0')
];

router.post('/', synthesizeValidation, async (req, res, next) => {
    try {
        // 檢查驗證結果
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const {
            text,
            engine,
            voice,
            language,
            rate = 1.0,
            pitch = 0.0,
            volume = 1.0
        } = req.body;

        // 清理輸入
        const cleanText = sanitizeInput(text);
        
        logger.info(`TTS request: ${engine} | ${language} | ${voice} | ${cleanText.substring(0, 50)}...`);

        // 調用 TTS 服務
        const audioContent = await synthesizeText({
            text: cleanText,
            engine,
            voice,
            language,
            rate,
            pitch,
            volume
        });

        res.json({
            success: true,
            audioContent,
            metadata: {
                engine,
                voice,
                language,
                textLength: cleanText.length,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        logger.error('TTS Error:', error);
        next(error);
    }
});

module.exports = router;