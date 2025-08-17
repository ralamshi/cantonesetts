// ===================================================
// 檔案: routes/voices.js - 聲音列表路由
// ===================================================
const express = require('express');
const router = express.Router();
const { query, validationResult } = require('express-validator');
const { getAvailableVoices } = require('../services/ttsService');
const logger = require('../utils/logger');

const voicesValidation = [
    query('engine')
        .optional()
        .isIn(['google', 'microsoft', 'openai'])
        .withMessage('Invalid engine specified'),
    query('language')
        .optional()
        .isIn(['yue', 'zh', 'en', 'ja', 'ko', 'de'])
        .withMessage('Invalid language specified')
];

router.get('/', voicesValidation, async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { engine = 'google', language = 'yue' } = req.query;

        logger.info(`Voices request: ${engine} | ${language}`);

        const voices = await getAvailableVoices(engine, language);

        res.json({
            success: true,
            voices,
            engine,
            language,
            count: voices.length
        });

    } catch (error) {
        logger.error('Get Voices Error:', error);
        next(error);
    }
});

module.exports = router;