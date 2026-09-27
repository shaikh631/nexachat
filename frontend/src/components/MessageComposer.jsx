import React, { useState, useRef, useEffect } from 'react';
import { Send, Square, Sparkles } from 'lucide-react';
import { useChat } from '../context/ChatContext';

export default function MessageComposer() {
  const { sendMessage, isGenerating, stopGeneration } = useChat();
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  const handleSend = () => {
    if (text.trim() && !isGenerating) {
      sendMessage(text);
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4">
      <div className="relative flex items-end bg-white dark:bg-[#151b27] border border-slate-200 dark:border-[#2b3547] rounded-2xl shadow-xl focus-within:ring-2 focus-within:ring-teal-500/50 focus-within:border-teal-500/60 transition-all p-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask NexaChat anything... (Shift + Enter for new line)"
          rows={1}
          className="w-full bg-transparent border-0 resize-none px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-0 max-h-48 scrollbar-custom"
        />

        <div className="flex items-center gap-1.5 pb-1 pr-1">
          {isGenerating ? (
            <button
              onClick={stopGeneration}
              className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md transition-all flex items-center justify-center active:scale-95"
              title="Stop Generation"
            >
              <Square className="w-4 h-4 fill-white" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!text.trim()}
              className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
                text.trim()
                  ? 'bg-gradient-to-r from-teal-700 to-emerald-500 hover:from-teal-800 hover:to-emerald-600 text-white shadow-md shadow-teal-600/30 active:scale-95'
                  : 'bg-slate-100 dark:bg-[#2b3547] text-slate-400 dark:text-slate-600 cursor-not-allowed'
              }`}
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <div className="text-[11px] text-center text-slate-400 dark:text-slate-500 mt-2 font-medium">
        NexaChat AI Assistant • Modular NLP Streaming Core
      </div>
    </div>
  );
}
