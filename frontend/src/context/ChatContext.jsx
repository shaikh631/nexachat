import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { conversationsApi, chatApi } from '../services/api';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const { isAuthenticated, user, openAuthModal } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const abortControllerRef = useRef(null);

  // Helper toast notification
  const showToast = (text) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load conversations when authenticated
  useEffect(() => {
    async function loadConversations() {
      if (isAuthenticated) {
        setLoadingConversations(true);
        try {
          const res = await conversationsApi.getAll();
          setConversations(res.conversations || []);
        } catch (err) {
          console.error('Failed to load conversations:', err);
        } finally {
          setLoadingConversations(false);
        }
      } else {
        setConversations([]);
        setActiveConversationId(null);
        setMessages([]);
      }
    }
    loadConversations();
  }, [isAuthenticated]);

  // Load messages when active conversation changes
  useEffect(() => {
    async function loadMessages() {
      if (activeConversationId && isAuthenticated) {
        setLoadingMessages(true);
        try {
          const res = await conversationsApi.getById(activeConversationId);
          setMessages(res.messages || []);
        } catch (err) {
          console.error('Failed to load messages for conversation:', err);
        } finally {
          setLoadingMessages(false);
        }
      } else if (!activeConversationId) {
        setMessages([]);
      }
    }
    loadMessages();
  }, [activeConversationId, isAuthenticated]);

  // Start new conversation view
  const createNewChat = () => {
    if (isGenerating && abortControllerRef.current) {
      stopGeneration();
    }
    setActiveConversationId(null);
    setMessages([]);
    setStreamingText('');
    setSidebarOpen(false);
  };

  // Select existing conversation
  const selectConversation = (id) => {
    if (isGenerating && abortControllerRef.current) {
      stopGeneration();
    }
    setActiveConversationId(id);
    setStreamingText('');
    setSidebarOpen(false);
  };

  // Send message
  const sendMessage = async (textText) => {
    const text = textText.trim();
    if (!text || isGenerating) return;

    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    const tempUserMsg = {
      _id: `temp-user-${Date.now()}`,
      sender: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, tempUserMsg]);
    setIsGenerating(true);
    setStreamingText('');

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let targetConvId = activeConversationId;
    let accumulatedText = '';

    await chatApi.streamMessage({
      conversationId: targetConvId,
      message: text,
      signal: controller.signal,
      onMeta: (meta) => {
        if (!targetConvId && meta.conversationId) {
          targetConvId = meta.conversationId;
          setActiveConversationId(meta.conversationId);
          // Add to conversation sidebar list
          setConversations(prev => [
            {
              _id: meta.conversationId,
              title: meta.conversationTitle || text.slice(0, 30),
              updatedAt: new Date().toISOString(),
            },
            ...prev,
          ]);
        }
        if (meta.userMessage) {
          setMessages(prev =>
            prev.map(m => (m._id === tempUserMsg._id ? meta.userMessage : m))
          );
        }
      },
      onChunk: (chunk) => {
        accumulatedText += chunk;
        setStreamingText(accumulatedText);
      },
      onDone: (doneData) => {
        setIsGenerating(false);
        setStreamingText('');
        if (doneData.assistantMessage) {
          setMessages(prev => [...prev, doneData.assistantMessage]);
        }
        // Refresh conversation sidebar order
        if (isAuthenticated) {
          conversationsApi.getAll().then(res => setConversations(res.conversations || []));
        }
      },
      onError: (err) => {
        setIsGenerating(false);
        setStreamingText('');
        showToast(`Error: ${err.message}`);
      },
    });
  };

  // Stop response generation
  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);

    if (streamingText) {
      const partialAssistantMsg = {
        _id: `partial-assistant-${Date.now()}`,
        sender: 'assistant',
        content: streamingText + ' *(generation stopped)*',
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, partialAssistantMsg]);
    }
    setStreamingText('');
    showToast('Response generation stopped');
  };

  // Regenerate last response
  const regenerateResponse = async () => {
    if (isGenerating || !activeConversationId) return;

    setIsGenerating(true);
    setStreamingText('');

    // Remove last assistant message from UI state
    setMessages(prev => {
      const last = prev[prev.length - 1];
      if (last && last.sender === 'assistant') {
        return prev.slice(0, -1);
      }
      return prev;
    });

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let accumulatedText = '';

    await chatApi.streamRegenerate({
      conversationId: activeConversationId,
      signal: controller.signal,
      onMeta: () => {},
      onChunk: (chunk) => {
        accumulatedText += chunk;
        setStreamingText(accumulatedText);
      },
      onDone: (doneData) => {
        setIsGenerating(false);
        setStreamingText('');
        if (doneData.assistantMessage) {
          setMessages(prev => [...prev, doneData.assistantMessage]);
        }
      },
      onError: (err) => {
        setIsGenerating(false);
        setStreamingText('');
        showToast(`Regeneration error: ${err.message}`);
      },
    });
  };

  // Edit user message & resend
  const editMessage = async (msgId, newText) => {
    if (isGenerating) return;
    const msgIndex = messages.findIndex(m => m._id === msgId);
    if (msgIndex === -1) return;

    // Truncate messages down to before this message
    setMessages(prev => prev.slice(0, msgIndex));
    // Send edited text
    await sendMessage(newText);
  };

  // Rename conversation
  const renameConversation = async (id, newTitle) => {
    try {
      const res = await conversationsApi.update(id, { title: newTitle });
      setConversations(prev =>
        prev.map(c => (c._id === id ? { ...c, title: res.conversation.title } : c))
      );
      showToast('Conversation renamed');
    } catch (err) {
      showToast(`Failed to rename: ${err.message}`);
    }
  };

  // Delete conversation
  const deleteConversation = async (id) => {
    try {
      await conversationsApi.delete(id);
      setConversations(prev => prev.filter(c => c._id !== id));
      if (activeConversationId === id) {
        createNewChat();
      }
      showToast('Conversation deleted');
    } catch (err) {
      showToast(`Failed to delete: ${err.message}`);
    }
  };

  // Filtered conversations by search query
  const filteredConversations = conversations.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <ChatContext.Provider
      value={{
        conversations: filteredConversations,
        allConversations: conversations,
        activeConversationId,
        messages,
        loadingConversations,
        loadingMessages,
        isGenerating,
        streamingText,
        searchQuery,
        setSearchQuery,
        sidebarOpen,
        setSidebarOpen,
        toastMessage,
        showToast,
        createNewChat,
        selectConversation,
        sendMessage,
        stopGeneration,
        regenerateResponse,
        editMessage,
        renameConversation,
        deleteConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
