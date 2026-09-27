import React from 'react';
import { Sparkles } from 'lucide-react';
import { useChat } from '../context/ChatContext';

export default function Toast() {
  const { toastMessage } = useChat();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-full shadow-xl text-xs font-medium animate-bounce">
      <Sparkles className="w-4 h-4 text-teal-500 dark:text-teal-300" />
      <span>{toastMessage}</span>
    </div>
  );
}
