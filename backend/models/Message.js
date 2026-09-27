import mongoose from 'mongoose';
import AppRecord from './AppRecord.js';

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    sender: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    metadata: {
      intent: { type: String, default: null },
      confidence: { type: Number, default: null },
      entities: { type: [mongoose.Schema.Types.Mixed], default: [] },
      model: { type: String, default: 'NexaNLP-v1' },
      tokens: { type: Number, default: 0 },
    },
    edited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Message = AppRecord.discriminator('Message', messageSchema);
export default Message;
