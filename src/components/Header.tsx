import React from 'react';
import { Language, AppTheme } from '../types';
import { I18N } from '../utils/i18n';
import { 
  PenTool, 
  Users, 
  Puzzle, 
  Key, 
  Terminal, 
  Upload, 
  Globe, 
  Moon, 
  Sun, 
  Download,
  Sparkles,
  Layers
} from 'lucide-react';

interface HeaderProps {
  activeView: 'writing' | 'council' | 'plugins' | 'keys' | 'devlab' | 'import';
  setActiveView: (view: 'writing' | 'council' | 'plugins' | 'keys' | 'devlab' | 'import') => void;
  lang: Language;
  setLang: (l: Language) => void;
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;
  onInstallPwa: () => void;
  canInstallPwa: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  lang,
  setLang,
  theme,
  setTheme,
  onInstallPwa,
  canInstallPwa,
}) => {
  const t = I18N[lang];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-3 sm:px-6">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-sm shadow-xs">
            NC
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm sm:text-base font-bold tracking-tight text-neutral-900 dark:text-white whitespace-nowrap">
              NovelCraft
            </span>
            <span className="hidden lg:inline text-xs text-neutral-400">·</span>
            <span className="hidden lg:inline text-xs font-medium text-neutral-500 dark:text-neutral-400">
              {t.appSubtitle}
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Always visible & horizontally scrollable on mobile/tablet) */}
        <nav className="flex items-center gap-1 overflow-x-auto text-xs font-semibold py-1 px-1 scrollbar-none">
          <button
            onClick={() => setActiveView('writing')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeView === 'writing'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <PenTool className="h-3.5 w-3.5" />
            <span>{t.navWriting}</span>
          </button>

          <button
            onClick={() => setActiveView('council')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeView === 'council'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Users className="h-3.5 w-3.5 text-indigo-400" />
            <span>{t.navCouncil}</span>
          </button>

          <button
            onClick={() => setActiveView('plugins')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeView === 'plugins'
                ? 'bg-purple-600 text-white font-bold shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Puzzle className="h-3.5 w-3.5 text-purple-400" />
            <span>{t.navPlugins}</span>
          </button>

          <button
            onClick={() => setActiveView('keys')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeView === 'keys'
                ? 'bg-amber-600 text-white font-bold shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Key className="h-3.5 w-3.5 text-amber-400" />
            <span>{t.navKeys}</span>
          </button>

          <button
            onClick={() => setActiveView('import')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeView === 'import'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Upload className="h-3.5 w-3.5 text-blue-400" />
            <span>{t.navImport}</span>
          </button>

          <button
            onClick={() => setActiveView('devlab')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeView === 'devlab'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-mono'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>Dev Lab</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action & Preferences */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
            className="flex items-center gap-1 px-2 py-1 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-mono font-bold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 transition-colors"
          >
            <Globe className="h-3 w-3" />
            <span>{lang.toUpperCase()}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'paper' : 'dark')}
            title="Đổi giao diện Sách Giấy / Dark Mode"
            className="p-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>

          {/* PWA Install Button */}
          {canInstallPwa && (
            <button
              onClick={onInstallPwa}
              className="flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cài App</span>
            </button>
          )}

          {/* Download Source ZIP Button */}
          <a
            href="/api/download-zip"
            download="NovelCraft-Studio.zip"
            className="flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 text-xs font-semibold text-white transition-colors shadow-xs"
            title="Tải toàn bộ mã nguồn (.zip) để build APK"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Tải ZIP</span>
          </a>
        </div>
      </div>
    </header>
  );
};
