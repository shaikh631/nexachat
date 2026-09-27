import React, { useState } from 'react';
import { X, User, Shield, Sparkles, Moon, Sun, Cpu, Database, Save, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useChat } from '../context/ChatContext';

export default function SettingsModal({ isOpen, onClose }) {
  const { user, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useChat();

  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      await updateProfile({ name: name.trim() });
      setSavedSuccess(true);
      showToast('Profile updated successfully');
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      showToast(`Failed to update profile: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-teal-700 dark:text-teal-300" />
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Account Settings & System Info</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* User Profile Form */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">User Profile</h3>
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0d1421] border border-gray-200 dark:border-[#2b3547] rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3.5 py-2 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-500 cursor-not-allowed"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-medium transition-colors"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-green-300" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <hr className="border-gray-200 dark:border-gray-800" />

          {/* Theme Preferences */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Appearance Theme</h3>
            <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-teal-300" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-500" />
                )}
                <div>
                  <div className="text-xs font-semibold text-gray-900 dark:text-white capitalize">{theme} Mode Active</div>
                  <div className="text-[11px] text-gray-500">Switch between dark slate and clean light appearance</div>
                </div>
              </div>

              <button
                onClick={toggleTheme}
                className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                Toggle Theme
              </button>
            </div>
          </div>

          <hr className="border-gray-200 dark:border-gray-800" />

          {/* NLP & Database System Info */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">NLP Engine & Architecture</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800/40 rounded-lg">
                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Cpu className="w-4 h-4 text-teal-500" />
                  <span>NLP Service Pipeline</span>
                </span>
                <span className="font-mono text-teal-700 dark:text-teal-300 font-semibold">NexaNLP Engine v1.0</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800/40 rounded-lg">
                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Database className="w-4 h-4 text-teal-500" />
                  <span>Database Layer</span>
                </span>
                <span className="font-mono text-green-600 dark:text-green-400 font-semibold">MongoDB Atlas / Mongoose</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800/40 rounded-lg">
                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Sparkles className="w-4 h-4 text-teal-500" />
                  <span>Streaming Output</span>
                </span>
                <span className="font-mono text-teal-700 dark:text-teal-300 font-semibold">Server-Sent Events (SSE)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
