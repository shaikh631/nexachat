import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

// @desc    Get all conversations for logged-in user
// @route   GET /api/conversations
// @access  Private
export const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ user: req.user._id })
      .sort({ updatedAt: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: conversations.length,
      conversations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new conversation
// @route   POST /api/conversations
// @access  Private
export const createConversation = async (req, res, next) => {
  try {
    const { title } = req.body;

    const conversation = await Conversation.create({
      user: req.user._id,
      title: title || 'New Conversation',
    });

    res.status(201).json({
      success: true,
      conversation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single conversation and its messages
// @route   GET /api/conversations/:id
// @access  Private
export const getConversationById = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const messages = await Message.find({ conversation: conversation._id }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      conversation,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/conversations/:id/messages
// @access  Private
export const getConversationMessages = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const messages = await Message.find({ conversation: conversation._id }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a conversation (rename or pin)
// @route   PATCH /api/conversations/:id
// @access  Private
export const updateConversation = async (req, res, next) => {
  try {
    const { title, pinned } = req.body;

    const conversation = await Conversation.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    if (title !== undefined) conversation.title = title.trim();
    if (pinned !== undefined) conversation.pinned = Boolean(pinned);

    await conversation.save();

    res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a conversation and all its messages
// @route   DELETE /api/conversations/:id
// @access  Private
export const deleteConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    // Delete associated messages
    await Message.deleteMany({ conversation: conversation._id });

    // Delete conversation document
    await conversation.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Conversation and messages deleted successfully',
      conversationId: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};
