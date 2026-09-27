import express from 'express';
import {
  getConversations,
  createConversation,
  getConversationById,
  getConversationMessages,
  updateConversation,
  deleteConversation,
} from '../controllers/conversationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getConversations)
  .post(createConversation);

router.route('/:id')
  .get(getConversationById)
  .patch(updateConversation)
  .delete(deleteConversation);

router.get('/:id/messages', getConversationMessages);

export default router;
