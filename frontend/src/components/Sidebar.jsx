import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Search,
  Edit2,
  Trash2,
  X,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  Sparkles,
  Check,
  Bot
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Sidebar({ onOpenSettings }) {
  const {
    conversations,
    activeConversationId,
    selectConversation,
    createNewChat,
    renameConversation,
    deleteConversation,
    searchQuery,
    setSearchQuery,
    sidebarOpen,
    setSidebarOpen,
  } = useChat();

  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const handleStartRename = (e, conv) => {
    e.stopPropagation();
    setEditingId(conv._id);
    setEditTitle(conv.title);
  };

  const handleSaveRename = (e, id) => {
    e.stopPropagation();
    if (editTitle.trim() && editTitle.trim() !== '') {
      renameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    deleteConversation(id);
  };

  // Group conversations by date
  const groupConversations = (items) => {
    const today = [];
    const past7Days = [];
    const older = [];

    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const sevenDays = 7 * oneDay;

    items.forEach(item => {
      const date = new Date(item.updatedAt || item.createdAt);
      const diff = now - date;

      if (diff < oneDay) {
        today.push(item);
      } else if (diff < sevenDays) {
        past7Days.push(item);
      } else {
        older.push(item);
      }
    });

    return { today, past7Days, older };
  };

  const { today, past7Days, older } = groupConversations(conversations);

  const renderGroup = (title, items) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-4">
        <div className="px-3 mb-2 text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
          {title}
        </div>
        <div className="space-y-1">
          {items.map(conv => {
            const isActive = activeConversationId === conv._id;
            const isEditing = editingId === conv._id;

            return (
              <div
                key={conv._id}
                onClick={() => selectConversation(conv._id)}
                className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-700 to-emerald-500 text-white font-medium shadow-md shadow-teal-600/20'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-[#1a1c2a]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <MessageSquare className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(e, conv._id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                      className="bg-white dark:bg-[#090e19] text-slate-900 dark:text-slate-100 px-2 py-0.5 rounded-lg text-xs w-full outline-none border border-teal-500"
                    />
                  ) : (
                    <span className="truncate text-xs font-medium">{conv.title}</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isEditing ? (
                    <button
                      onClick={(e) => handleSaveRename(e, conv._id)}
                      className="p-1 hover:bg-teal-800 rounded text-white"
                      title="Save"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={(e) => handleStartRename(e, conv)}
                        className={`p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 ${
                          isActive ? 'text-white' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                        title="Rename"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, conv._id)}
                        className={`p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 ${
                          isActive ? 'text-white' : 'text-slate-400 hover:text-red-400'
                        }`}
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-black/70 z-40 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 flex flex-col bg-slate-100 dark:bg-[#080d17] border-r border-slate-200 dark:border-[#2b3547] transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-[#2b3547]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-700 via-emerald-600 to-lime-500 flex items-center justify-center text-white shadow-lg shadow-teal-700/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 dark:text-white text-base tracking-tight leading-tight flex items-center gap-1.5">
                NexaChat
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" title="Online" />
              </h1>
              <p className="text-[10px] text-teal-700 dark:text-teal-300 font-semibold tracking-wide uppercase">AI Assistant</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-[#1a1c2a]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={createNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-700 to-emerald-500 hover:from-teal-800 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-md shadow-teal-600/25 transition-all duration-200 text-sm active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#151b27] border border-slate-200 dark:border-[#2b3547] rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 scrollbar-custom">
          {conversations.length === 0 ? (
            <div className="text-center py-10 px-4 text-xs text-slate-400 dark:text-slate-500">
              {searchQuery ? 'No chats match your search' : 'No saved conversations yet'}
            </div>
          ) : (
            <>
              {renderGroup('Today', today)}
              {renderGroup('Previous 7 Days', past7Days)}
              {renderGroup('Older', older)}
            </>
          )}
        </div>

        {/* Sidebar Footer: User Profile & Theme Toggle */}
        <div className="p-3 border-t border-slate-200 dark:border-[#2b3547] bg-slate-200/50 dark:bg-[#090e19]">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-300/60 dark:hover:bg-[#111a29] transition-colors w-full justify-between"
              title="Toggle Theme"
            >
              <div className="flex items-center gap-2">
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-teal-700" />
                )}
                <span>{theme === 'dark' ? 'Midnight Olive' : 'Cream'}</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-300 dark:bg-[#1e293b] text-slate-700 dark:text-slate-300 font-semibold uppercase">
                {theme}
              </span>
            </button>
          </div>

          {isAuthenticated ? (
            <div className="flex items-center justify-between pt-1">
              <div
                onClick={onOpenSettings}
                className="flex items-center gap-2.5 min-w-0 cursor-pointer p-2 rounded-xl hover:bg-slate-300/60 dark:hover:bg-[#111a29] transition-colors flex-1"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-700 to-emerald-500 text-white flex items-center justify-center font-bold text-xs uppercase flex-shrink-0 shadow-sm">
                  {user?.name ? user.name.charAt(0) : 'U'}
                </div>
                <div className="min-w-0 text-left">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</div>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-red-400 rounded-xl hover:bg-slate-300/60 dark:hover:bg-[#111a29] transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => openAuthModal('login')}
                className="flex-1 py-2 text-xs font-semibold text-teal-700 dark:text-teal-300 border border-teal-600/40 dark:border-teal-500/40 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="flex-1 py-2 text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white rounded-xl shadow-sm transition-colors"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
