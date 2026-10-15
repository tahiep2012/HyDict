import { useState } from 'react';
import { AppSettings, DEFAULT_APP_SETTINGS, MainWindowTab } from '../types';

export const useMainWindowState = () => {
  const [activeTab, setActiveTab] = useState<MainWindowTab>('dict');
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [searchQuery, setSearchQuery] = useState('万里长城');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    '万',
    '学习',
    '汉语',
    '雄伟',
  ]);
  const [isTrayModalOpen, setIsTrayModalOpen] = useState(false);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const addToRecent = (word: string) => {
    if (!word) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item !== word);
      return [word, ...filtered].slice(0, 8);
    });
  };

  return {
    activeTab,
    setActiveTab,
    settings,
    updateSetting,
    searchQuery,
    setSearchQuery,
    recentSearches,
    addToRecent,
    isTrayModalOpen,
    setIsTrayModalOpen,
  };
};
