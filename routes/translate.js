// ===================================================
// 檔案: routes/translate.js - 翻譯路由
// ===================================================
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { translateText } = require('../services/translateService');
const { sanitizeInput } = require('../utils/sanitizer');
const logger = require('../utils/logger');

const translateValidation = [
    body('text')
        .trim()
        .isLength({ min: 1, max: 5000 })
        .withMessage('Text must be between 1 and 5000 characters'),
    body('from')
        .isIn(['yue', 'zh', 'en', 'ja', 'ko', 'de'])
        .withMessage('Invalid source language'),
    body('to')
        .isIn(['yue', 'zh', 'en', 'ja', 'ko', 'de'])
        .withMessage('Invalid target language')
];

router.post('/', translateValidation, async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { text, from, to } = req.body;
        const cleanText = sanitizeInput(text);

        if (from === to) {
            return res.json({
                success: true,
                translatedText: cleanText,
                from,
                to
            });
        }

        logger.info(`Translation request: ${from} -> ${to} | ${cleanText.substring(0, 50)}...`);

        const translatedText = await translateText(cleanText, from, to);

        res.json({
            success: true,
            translatedText,
            from,
            to,
            originalText: cleanText
        });

    } catch (error) {
        logger.error('Translation Error:', error);
        next(error);
    }
});

module.exports = router;
