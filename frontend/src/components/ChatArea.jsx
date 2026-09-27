import React, { useRef, useEffect, useState } from 'react';
import {
  Menu,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  Edit3,
  Code2,
  BookOpen,
  Zap,
  MessageSquare,
  Plus
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import MarkdownRenderer from './MarkdownRenderer';
import MessageComposer from './MessageComposer';

export default function ChatArea({ onOpenSettings }) {
  const {
    messages,
    activeConversationId,
    conversations,
    isGenerating,
    streamingText,
    regenerateResponse,
    editMessage,
    sendMessage,
    setSidebarOpen,
    createNewChat,
    showToast,
  } = useChat();

  const { user, isAuthenticated, openAuthModal } = useAuth();
  const messagesEndRef = useRef(null);

  const [copiedId, setCopiedId] = useState(null);
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editingText, setEditingText] = useState('');

  // Find active conversation title
  const activeConv = conversations.find(c => c._id === activeConversationId);
  const headerTitle = activeConv ? activeConv.title : 'New Chat';

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText, isGenerating]);

  const handleCopyMessage = (msgId, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    showToast('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStartEdit = (msg) => {
    setEditingMsgId(msg._id);
    setEditingText(msg.content);
  };

  const handleSaveEdit = (msgId) => {
    if (editingText.trim() && editingText.trim() !== '') {
      editMessage(msgId, editingText.trim());
    }
    setEditingMsgId(null);
  };

  const samplePrompts = [
    {
      title: 'Hello, can you help me?',
      desc: 'Ask about capabilities, coding & web development',
      icon: Zap,
    },
    {
      title: 'How to create a Mongoose schema in Node.js?',
      desc: 'Generates complete schema definitions with validation',
      icon: Code2,
    },
    {
      title: 'What is MongoDB?',
      desc: 'Explains NoSQL, collections, BSON, and usage',
      icon: BookOpen,
    },
    {
      title: 'Create a table comparing HTTP methods',
      desc: 'Generates formatted Markdown comparison tables',
      icon: Sparkles,
    },
  ];

  return (
    <div className="chat-canvas flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-[#090e19] transition-colors">
      {/* Top Header Bar */}
      <header className="h-14 border-b border-slate-200 dark:border-[#2b3547] px-4 flex items-center justify-between bg-white/80 dark:bg-[#090e19]/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#111a29]"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-xs md:max-w-md tracking-tight">
              {headerTitle}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={createNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#2b3547] hover:bg-slate-100 dark:hover:bg-[#111a29] transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-teal-500" />
            <span>New Chat</span>
          </button>

          {!isAuthenticated && (
            <button
              onClick={() => openAuthModal('login')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white shadow-sm transition-all"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Main Conversation Stream / Landing View */}
      <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-custom">
        {messages.length === 0 && !streamingText ? (
          /* Landing Welcome State */
          <div className="max-w-2xl mx-auto h-full flex flex-col justify-center items-center text-center my-auto py-8">
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-700 via-emerald-600 to-lime-500 text-white flex items-center justify-center shadow-xl shadow-teal-700/30">
                <Sparkles className="w-8 h-8 animate-pulse" />
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
              What would you like to build today?
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-md leading-relaxed">
              NexaChat is your human-like AI coding assistant powered by streaming responses, rich Markdown formatting, and MongoDB persistence.
            </p>

            {/* Quick Suggestion Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-xl">
              {samplePrompts.map((prompt, i) => {
                const Icon = prompt.icon;
                return (
                  <button
                    key={i}
                    onClick={() => sendMessage(prompt.title)}
                    className="flex flex-col text-left p-4 bg-white dark:bg-[#151b27] hover:bg-slate-50 dark:hover:bg-[#1e293b] border border-slate-200 dark:border-[#2b3547] hover:border-teal-500/50 dark:hover:border-teal-500/40 rounded-2xl transition-all duration-200 shadow-xs group"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 group-hover:scale-110 transition-transform">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{prompt.title}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug pl-0.5">{prompt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Message List */
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg, index) => {
              const isUser = msg.sender === 'user';
              const isEditing = editingMsgId === msg._id;
              const isLastAssistant = !isUser && index === messages.length - 1;

              return (
                <div
                  key={msg._id || index}
                  className={`flex gap-3 group ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm ${
                      isUser
                        ? 'bg-gradient-to-tr from-teal-700 to-emerald-500 text-white'
                        : 'bg-gradient-to-tr from-emerald-700 via-teal-600 to-lime-500 text-white shadow-teal-600/20'
                    }`}
                  >
                    {isUser ? (
                      user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>

                  {/* Message Bubble Container */}
                  <div className={`flex flex-col max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`px-4 py-3 rounded-2xl transition-all shadow-xs ${
                        isUser
                          ? 'bg-gradient-to-r from-teal-700 to-emerald-500 text-white rounded-tr-xs shadow-md shadow-teal-600/20'
                          : 'bg-white dark:bg-[#151b27] text-slate-900 dark:text-slate-100 rounded-tl-xs border border-slate-200/80 dark:border-[#2b3547]'
                      }`}
                    >
                      {isUser ? (
                        isEditing ? (
                          <div className="w-full min-w-[260px]">
                            <textarea
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="w-full bg-white dark:bg-[#090e19] text-slate-900 dark:text-slate-100 p-2.5 rounded-xl text-sm outline-none border border-teal-300"
                              rows={2}
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <button
                                onClick={() => setEditingMsgId(null)}
                                className="px-2.5 py-1 text-xs text-slate-200 hover:text-white font-medium"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveEdit(msg._id)}
                                className="px-3 py-1 bg-white text-teal-700 rounded-lg text-xs font-bold hover:bg-slate-100"
                              >
                                Save & Send
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap text-sm leading-relaxed font-normal">{msg.content}</div>
                        )
                      ) : (
                        <MarkdownRenderer content={msg.content} />
                      )}
                    </div>

                    {/* Action Bar Below Bubble */}
                    <div
                      className={`flex items-center gap-2.5 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-slate-400 dark:text-slate-500 px-1 ${
                        isUser ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <button
                        onClick={() => handleCopyMessage(msg._id, msg.content)}
                        className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                        title="Copy message"
                      >
                        {copiedId === msg._id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {isUser && !isEditing && (
                        <button
                          onClick={() => handleStartEdit(msg)}
                          className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                          title="Edit message"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {isLastAssistant && !isGenerating && (
                        <button
                          onClick={regenerateResponse}
                          className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200 transition-colors font-medium"
                          title="Regenerate response"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-teal-500" />
                          <span>Regenerate</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Streaming Active Chunk View */}
            {isGenerating && streamingText && (
              <div className="flex gap-3 flex-row">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-700 via-teal-600 to-lime-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-tl-xs bg-white dark:bg-[#151b27] text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-[#2b3547]">
                  <MarkdownRenderer content={streamingText} />
                  <span className="typing-cursor" />
                </div>
              </div>
            )}

            {/* Waiting for response indicator */}
            {isGenerating && !streamingText && (
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-700 via-teal-600 to-lime-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-xs bg-white dark:bg-[#151b27] border border-slate-200/80 dark:border-[#2b3547] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-lime-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Composer Area */}
      <MessageComposer />
    </div>
  );
}
