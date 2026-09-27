import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import geminiService, { GEMINI_MODEL } from '../services/geminiService.js';
import nlpService from '../nlp/nlpService.js';

// @desc    Send message & receive streaming AI response (supports Gemini API + SSE)
// @route   POST /api/chat
// @access  Private / Optional Auth
export const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, message, stream = true } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }

    let conversation;
    const userId = req.user ? req.user._id : null;

    // 1. Get or Create Conversation
    if (conversationId) {
      if (userId) {
        conversation = await Conversation.findOne({ _id: conversationId, user: userId });
      } else {
        conversation = await Conversation.findById(conversationId);
      }
    }

    if (!conversation) {
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required to create conversations' });
      }

      // Generate conversation title automatically
      const generatedTitle = await geminiService.generateTitle(message);
      conversation = await Conversation.create({
        user: userId,
        title: generatedTitle,
      });
    } else if (conversation.title === 'New Conversation') {
      const generatedTitle = await geminiService.generateTitle(message);
      conversation.title = generatedTitle;
      await conversation.save();
    }

    // 2. Save User Message to MongoDB
    const userMessage = await Message.create({
      conversation: conversation._id,
      sender: 'user',
      content: message.trim(),
    });

    // 3. Fetch previous message history for context
    const recentMessages = await Message.find({ conversation: conversation._id })
      .sort({ createdAt: 1 })
      .limit(20);

    const historyForAI = recentMessages.slice(0, -1); // exclude current user message

    // 4. Handle Progressive SSE Streaming Output
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Send initial meta packet
      res.write(`data: ${JSON.stringify({
        type: 'meta',
        conversationId: conversation._id,
        conversationTitle: conversation.title,
        userMessage,
      })}\n\n`);

      let accumulatedText = '';
      const hasGeminiKey = !!process.env.GEMINI_API_KEY;

      if (hasGeminiKey) {
        try {
          await geminiService.streamResponse({
            message: message.trim(),
            history: historyForAI,
            onChunk: (chunkText) => {
              accumulatedText += chunkText;
              res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunkText })}\n\n`);
            },
            onDone: async (finalText) => {
              const assistantMessage = await Message.create({
                conversation: conversation._id,
                sender: 'assistant',
                content: finalText,
                metadata: { model: GEMINI_MODEL },
              });

              conversation.lastMessageAt = new Date();
              await conversation.save();

              res.write(`data: ${JSON.stringify({
                type: 'done',
                assistantMessage,
                conversationId: conversation._id,
              })}\n\n`);

              res.end();
            },
            onError: async (err) => {
              console.error('[Gemini API Stream Error]:', err.message);
              const fallbackText = "Sorry, I couldn't generate a response right now. Please try again.";
              const assistantMessage = await Message.create({
                conversation: conversation._id,
                sender: 'assistant',
                content: fallbackText,
              });

              res.write(`data: ${JSON.stringify({ type: 'chunk', text: fallbackText })}\n\n`);
              res.write(`data: ${JSON.stringify({
                type: 'done',
                assistantMessage,
                conversationId: conversation._id,
              })}\n\n`);
              res.end();
            },
          });
          return;
        } catch (geminiError) {
          console.error('[Gemini Stream Catch]:', geminiError.message);
        }
      }

      // Fallback NLP Engine if GEMINI_API_KEY is not configured
      const nlpResult = await nlpService.processMessage({
        text: message,
        user: req.user,
        context: historyForAI,
      });

      const fullText = nlpResult.content;
      const chunkSize = Math.max(3, Math.floor(fullText.length / 30));
      let index = 0;

      const interval = setInterval(async () => {
        if (index < fullText.length) {
          const chunk = fullText.slice(index, index + chunkSize);
          index += chunkSize;
          res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunk })}\n\n`);
        } else {
          clearInterval(interval);

          const assistantMessage = await Message.create({
            conversation: conversation._id,
            sender: 'assistant',
            content: fullText,
            metadata: nlpResult.metadata,
          });

          conversation.lastMessageAt = new Date();
          await conversation.save();

          res.write(`data: ${JSON.stringify({
            type: 'done',
            assistantMessage,
            conversationId: conversation._id,
          })}\n\n`);

          res.end();
        }
      }, 20);

      req.on('close', () => {
        clearInterval(interval);
      });
      return;
    }

    // Non-streaming response fallback
    let assistantText = '';
    if (process.env.GEMINI_API_KEY) {
      assistantText = await geminiService.streamResponse({
        message: message.trim(),
        history: historyForAI,
      });
    } else {
      const nlpResult = await nlpService.processMessage({ text: message, user: req.user });
      assistantText = nlpResult.content;
    }

    const assistantMessage = await Message.create({
      conversation: conversation._id,
      sender: 'assistant',
      content: assistantText,
    });

    conversation.lastMessageAt = new Date();
    await conversation.save();

    res.status(200).json({
      success: true,
      conversationId: conversation._id,
      userMessage,
      assistantMessage,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Regenerate last assistant message response
// @route   POST /api/chat/regenerate
// @access  Private
export const regenerateResponse = async (req, res, next) => {
  try {
    const { conversationId } = req.body;

    if (!conversationId) {
      return res.status(400).json({ success: false, message: 'Conversation ID is required' });
    }

    const userId = req.user ? req.user._id : null;
    const conversation = await Conversation.findOne({ _id: conversationId, user: userId });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const messages = await Message.find({ conversation: conversation._id }).sort({ createdAt: 1 });
    if (messages.length === 0) {
      return res.status(400).json({ success: false, message: 'No messages in conversation to regenerate' });
    }

    let lastUserMsg = null;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].sender === 'user') {
        lastUserMsg = messages[i];
        break;
      }
    }

    if (!lastUserMsg) {
      return res.status(400).json({ success: false, message: 'No user message found to regenerate from' });
    }

    // Remove any trailing assistant messages after this user message
    await Message.deleteMany({
      conversation: conversation._id,
      createdAt: { $gt: lastUserMsg.createdAt },
      sender: 'assistant',
    });

    const historyForAI = messages.filter(m => m.createdAt < lastUserMsg.createdAt);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    res.write(`data: ${JSON.stringify({
      type: 'meta',
      conversationId: conversation._id,
      conversationTitle: conversation.title,
    })}\n\n`);

    const hasGeminiKey = !!process.env.GEMINI_API_KEY;

    if (hasGeminiKey) {
      try {
        await geminiService.streamResponse({
          message: lastUserMsg.content,
          history: historyForAI,
          onChunk: (chunkText) => {
            res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunkText })}\n\n`);
          },
          onDone: async (finalText) => {
            const assistantMessage = await Message.create({
              conversation: conversation._id,
              sender: 'assistant',
              content: finalText,
            });

            conversation.lastMessageAt = new Date();
            await conversation.save();

            res.write(`data: ${JSON.stringify({
              type: 'done',
              assistantMessage,
              conversationId: conversation._id,
            })}\n\n`);

            res.end();
          },
          onError: async (err) => {
            const fallbackText = "Sorry, I couldn't generate a response right now. Please try again.";
            const assistantMessage = await Message.create({
              conversation: conversation._id,
              sender: 'assistant',
              content: fallbackText,
            });

            res.write(`data: ${JSON.stringify({ type: 'chunk', text: fallbackText })}\n\n`);
            res.write(`data: ${JSON.stringify({
              type: 'done',
              assistantMessage,
              conversationId: conversation._id,
            })}\n\n`);
            res.end();
          }
        });
        return;
      } catch (err) {
        console.error('[Gemini Regenerate Error]:', err.message);
      }
    }

    // Fallback NLP Engine
    const nlpResult = await nlpService.processMessage({
      text: lastUserMsg.content,
      user: req.user,
      context: historyForAI,
    });

    const fullText = nlpResult.content;
    const chunkSize = Math.max(3, Math.floor(fullText.length / 30));
    let index = 0;

    const interval = setInterval(async () => {
      if (index < fullText.length) {
        const chunk = fullText.slice(index, index + chunkSize);
        index += chunkSize;
        res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunk })}\n\n`);
      } else {
        clearInterval(interval);

        const assistantMessage = await Message.create({
          conversation: conversation._id,
          sender: 'assistant',
          content: fullText,
          metadata: nlpResult.metadata,
        });

        conversation.lastMessageAt = new Date();
        await conversation.save();

        res.write(`data: ${JSON.stringify({
          type: 'done',
          assistantMessage,
          conversationId: conversation._id,
        })}\n\n`);

        res.end();
      }
    }, 20);

    req.on('close', () => {
      clearInterval(interval);
    });
  } catch (error) {
    next(error);
  }
};
