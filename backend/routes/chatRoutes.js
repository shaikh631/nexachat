import express from 'express';
import { sendMessage, regenerateResponse } from '../controllers/chatController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', optionalAuth, sendMessage);
router.post('/regenerate', protect, regenerateResponse);

export default router;
