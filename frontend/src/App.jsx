import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ChatProvider } from './context/ChatContext';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import AuthModal from './components/AuthModal';
import SettingsModal from './components/SettingsModal';
import Toast from './components/Toast';

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <ThemeProvider>
      <AuthProvider>
        <ChatProvider>
          <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100">
            <Sidebar onOpenSettings={() => setSettingsOpen(true)} />
            <ChatArea onOpenSettings={() => setSettingsOpen(true)} />
            <AuthModal />
            <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
            <Toast />
          </div>
        </ChatProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
