import React, { useState, useMemo } from 'react';
import { 
  StorySession, 
  StoryChapter, 
  RoleplayMessage, 
  PluginMod, 
  TuningConfig, 
  Language, 
  AppTheme 
} from '../types';
import { I18N } from '../utils/i18n';
import { executePluginSafely } from '../utils/pluginEngine';
import { 
  PenTool, 
  Sparkles, 
  Search, 
  Users, 
  Download, 
  Plus, 
  Play, 
  Send, 
  BookOpen, 
  MessageSquare, 
  Dices, 
  ShieldCheck, 
  FileText, 
  RotateCcw,
  Check,
  ChevronRight,
  ChevronDown,
  Sidebar,
  Sliders,
  Terminal,
  Puzzle,
  Key,
  Power
} from 'lucide-react';

interface WritingCanvasProps {
  session: StorySession;
  setSession: React.Dispatch<React.SetStateAction<StorySession>>;
  activePlugins: PluginMod[];
  tuningConfig: TuningConfig;
  setTuningConfig: React.Dispatch<React.SetStateAction<TuningConfig>>;
  lang: Language;
  theme: AppTheme;
  isGenerating: boolean;
  onGenerateContinue: () => void;
  onOpenCouncil: () => void;
  onOpenKeys: () => void;
  onOpenPlugins: () => void;
  onOpenImporter: () => void;
  onOpenDevLab: () => void;
  onPluginCrash: (pluginId: string, error: any) => void;
  onTogglePlugin: (pluginId: string) => void;
}

export const WritingCanvas: React.FC<WritingCanvasProps> = ({
  session,
  setSession,
  activePlugins,
  tuningConfig,
  setTuningConfig,
  lang,
  theme,
  isGenerating,
  onGenerateContinue,
  onOpenCouncil,
  onOpenKeys,
  onOpenPlugins,
  onOpenImporter,
  onOpenDevLab,
  onPluginCrash,
  onTogglePlugin,
}) => {
  const t = I18N[lang];
  const [roleplayInput, setRoleplayInput] = useState('');
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(true);
  const [isRightDockOpen, setIsRightDockOpen] = useState(true);
  const [showQuickToggles, setShowQuickToggles] = useState(true);
  const [diceHistory, setDiceHistory] = useState<{ sides: number; result: number; note: string }[]>([]);
  const [characterHp, setCharacterHp] = useState(100);
  const [characterMp, setCharacterMp] = useState(80);
  const [generatedName, setGeneratedName] = useState<string | null>(null);

  // Active Chapter
  const activeChapter = useMemo(() => {
    return session.chapters.find((c) => c.id === session.activeChapterId) || session.chapters[0];
  }, [session.chapters, session.activeChapterId]);

  // Update content of active chapter
  const handleContentChange = (newContent: string) => {
    const wordCount = newContent.trim().split(/\s+/).filter(Boolean).length;
    setSession((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      chapters: prev.chapters.map((c) =>
        c.id === prev.activeChapterId
          ? { ...c, content: newContent, wordCount, updatedAt: new Date().toLocaleTimeString('vi-VN') }
          : c
      ),
    }));
  };

  // Add Chapter
  const handleAddChapter = () => {
    const newChap: StoryChapter = {
      id: `chap_${Date.now()}`,
      title: `Chương ${session.chapters.length + 1}: Diễn Biến Mới`,
      content: '',
      wordCount: 0,
      updatedAt: new Date().toLocaleTimeString('vi-VN'),
    };
    setSession((prev) => ({
      ...prev,
      chapters: [...prev.chapters, newChap],
      activeChapterId: newChap.id,
    }));
  };

  // Switch Chapter
  const handleSelectChapter = (id: string) => {
    setSession((prev) => ({ ...prev, activeChapterId: id }));
  };

  // Export functions
  const handleExport = (type: 'md' | 'txt' | 'json') => {
    let content = '';
    let mimeType = 'text/plain';
    let ext = 'txt';

    if (type === 'md') {
      content = `# ${session.title}\n\n*Thể loại: ${session.genre}*\n\n> ${session.synopsis}\n\n` +
        session.chapters.map((c) => `## ${c.title}\n\n${c.content}\n`).join('\n---\n\n');
      mimeType = 'text/markdown';
      ext = 'md';
    } else if (type === 'txt') {
      content = `${session.title}\n\n` + session.chapters.map((c) => `${c.title}\n\n${c.content}\n`).join('\n\n');
      mimeType = 'text/plain';
      ext = 'txt';
    } else {
      content = JSON.stringify(session, null, 2);
      mimeType = 'application/json';
      ext = 'json';
    }

    const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${session.title.toLowerCase().replace(/\s+/g, '_')}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Send Roleplay message
  const handleSendRoleplay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleplayInput.trim() || isGenerating) return;

    const userMsg: RoleplayMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      speakerName: session.characters[0]?.name || 'Nhân vật chính',
      text: roleplayInput.trim(),
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setSession((prev) => ({
      ...prev,
      roleplayMessages: [...prev.roleplayMessages, userMsg],
    }));
    setRoleplayInput('');
    onGenerateContinue();
  };

  // Execute Dice Roller Plugin with Hot-Kick Guard
  const handleRollDice = (sides: number) => {
    const dicePlugin = activePlugins.find((p) => p.id === 'dice_roller_rpg');
    if (!dicePlugin) {
      const res = Math.floor(Math.random() * sides) + 1;
      setDiceHistory((prev) => [{ sides, result: res, note: '' }, ...prev.slice(0, 9)]);
      return;
    }

    executePluginSafely(
      dicePlugin,
      () => {
        const fn = new Function(dicePlugin.code);
        const instance = fn();
        const outcome = instance.roll(sides);
        setDiceHistory((prev) => [outcome, ...prev.slice(0, 9)]);
      },
      (pluginId, error) => {
        onPluginCrash(pluginId, error);
      }
    );
  };

  // Execute Lore Name Generator Plugin with Hot-Kick Guard
  const handleGenerateName = (genre: string) => {
    const namePlugin = activePlugins.find((p) => p.id === 'lore_name_generator');
    if (!namePlugin) return;

    executePluginSafely(
      namePlugin,
      () => {
        const fn = new Function(namePlugin.code);
        const instance = fn();
        const name = instance.generateName(genre);
        setGeneratedName(name);
      },
      (pluginId, error) => {
        onPluginCrash(pluginId, error);
      }
    );
  };

  // Theme Canvas styling
  const canvasThemeStyles = {
    paper: 'bg-[#faf8f5] text-[#2c2825]',
    dark: 'bg-[#0f1115] text-[#e5e7eb]',
    slate: 'bg-white text-neutral-900',
  }[theme];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Top Workspace Action Strip */}
      <div className="h-12 border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 shrink-0 overflow-x-auto scrollbar-none">
        {/* Toggle Left Sidebar + Mode Selector */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsLeftDrawerOpen(!isLeftDrawerOpen)}
            title="Ẩn / Hiện danh sách chương & bối cảnh"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors ${
              isLeftDrawerOpen
                ? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white'
                : 'border-neutral-200 dark:border-neutral-800 text-neutral-500'
            }`}
          >
            <Sidebar className="h-3.5 w-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Chương</span>
            <span className="font-mono text-[10px]">({session.chapters.length})</span>
          </button>

          <div className="flex rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 p-0.5 text-xs font-semibold">
            <button
              onClick={() => setSession((p) => ({ ...p, mode: 'novel' }))}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md transition-colors ${
                session.mode === 'novel'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-2xs font-bold'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <PenTool className="h-3 w-3" />
              <span>{t.novelMode}</span>
            </button>
            <button
              onClick={() => setSession((p) => ({ ...p, mode: 'roleplay' }))}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md transition-colors ${
                session.mode === 'roleplay'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-2xs font-bold'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <MessageSquare className="h-3 w-3" />
              <span>{t.roleplayMode}</span>
            </button>
          </div>
        </div>

        {/* Central & Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Web Search Grounding Toggle */}
          <button
            onClick={() =>
              setTuningConfig((prev) => ({ ...prev, enableWebSearch: !prev.enableWebSearch }))
            }
            title={t.searchGroundingDesc}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors border ${
              tuningConfig.enableWebSearch
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700'
            }`}
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Web Search</span>
            <span
              className={`h-2 w-2 rounded-full ${
                tuningConfig.enableWebSearch ? 'bg-emerald-500' : 'bg-neutral-300 dark:bg-neutral-600'
              }`}
            />
          </button>

          {/* AI Council Quick Button */}
          <button
            onClick={onOpenCouncil}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2.5 py-1 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-2xs"
          >
            <Users className="h-3.5 w-3.5 text-indigo-500" />
            <span>Hội Đồng AI</span>
          </button>

          {/* Generate Continue button */}
          <button
            onClick={onGenerateContinue}
            disabled={isGenerating}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-xs"
          >
            <Sparkles className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Đang viết...' : t.generateNext}</span>
          </button>

          {/* Toggle Right Mod Widgets Dock */}
          <button
            onClick={() => setIsRightDockOpen(!isRightDockOpen)}
            title="Ẩn / Hiện thanh công cụ Mod Widgets (Xúc xắc, Nhân vật, Sinh tên)"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors ${
              isRightDockOpen
                ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300'
                : 'border-neutral-200 dark:border-neutral-800 text-neutral-500'
            }`}
          >
            <Dices className="h-3.5 w-3.5 text-purple-600" />
            <span className="hidden sm:inline">Mod Widgets</span>
          </button>

          {/* Export Dropdown */}
          <div className="flex items-center gap-1 border-l border-neutral-200 dark:border-neutral-700 pl-1.5">
            <button
              onClick={() => handleExport('md')}
              title={t.exportMd}
              className="px-2 py-1 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-mono font-bold"
            >
              MD
            </button>
            <button
              onClick={() => handleExport('txt')}
              title={t.exportTxt}
              className="px-2 py-1 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-mono font-bold"
            >
              TXT
            </button>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Left Chapters + Center Editor + Right Active Mod Dock */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Drawer: Chapters & Lore (Collapsible) */}
        {isLeftDrawerOpen && (
          <aside className="w-56 sm:w-64 border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50/90 dark:bg-neutral-950/90 flex flex-col justify-between shrink-0 transition-all duration-150">
            <div className="p-3 overflow-y-auto space-y-4">
              {/* Chapters */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                  <span>Chương Hồi ({session.chapters.length})</span>
                  <button
                    onClick={handleAddChapter}
                    className="p-1 text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 rounded"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  {session.chapters.map((chap) => (
                    <button
                      key={chap.id}
                      onClick={() => handleSelectChapter(chap.id)}
                      className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                        session.activeChapterId === chap.id
                          ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold shadow-2xs border border-neutral-200 dark:border-neutral-700'
                          : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900'
                      }`}
                    >
                      <span className="truncate">{chap.title}</span>
                      <span className="text-[10px] font-mono text-neutral-400 tabular-nums">
                        {chap.wordCount}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Synopsis */}
              <div className="border-t border-neutral-200 dark:border-neutral-800 pt-3">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                  {t.synopsis}
                </span>
                <textarea
                  rows={3}
                  value={session.synopsis}
                  onChange={(e) => setSession((p) => ({ ...p, synopsis: e.target.value }))}
                  placeholder="Ghi chú bối cảnh câu chuyện..."
                  className="w-full text-xs p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 resize-none focus:outline-none"
                />
              </div>

              {/* Characters Preview */}
              <div className="border-t border-neutral-200 dark:border-neutral-800 pt-3">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">
                  Nhân Vật ({session.characters.length})
                </span>
                <div className="space-y-1 text-xs">
                  {session.characters.map((ch) => (
                    <div key={ch.id} className="p-1.5 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                      <div className="font-semibold text-neutral-900 dark:text-white">{ch.name}</div>
                      <div className="text-[11px] text-neutral-500 truncate">{ch.role} · {ch.traits}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Quick Tools */}
            <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
              <button
                onClick={onOpenKeys}
                className="hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                API Key
              </button>
              <button
                onClick={onOpenPlugins}
                className="text-purple-600 hover:underline"
              >
                Quản lý Mod
              </button>
              <button
                onClick={onOpenDevLab}
                className="text-emerald-600 hover:underline font-mono"
              >
                Dev Lab
              </button>
            </div>
          </aside>
        )}

        {/* Center: Writing / Roleplay Canvas */}
        <main className={`flex-1 flex flex-col overflow-hidden ${canvasThemeStyles}`}>
          {session.mode === 'novel' ? (
            /* Novel Writing Mode */
            <div className="flex-1 overflow-y-auto px-4 sm:px-10 py-6 max-w-4xl mx-auto w-full flex flex-col">
              <input
                type="text"
                value={activeChapter ? activeChapter.title : ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setSession((prev) => ({
                    ...prev,
                    chapters: prev.chapters.map((c) =>
                      c.id === prev.activeChapterId ? { ...c, title: val } : c
                    ),
                  }));
                }}
                placeholder="Tiêu đề chương..."
                className="text-xl sm:text-2xl font-bold tracking-tight bg-transparent border-none focus:outline-none mb-4 placeholder-neutral-400"
              />

              <textarea
                value={activeChapter ? activeChapter.content : ''}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Bắt đầu viết tác phẩm của bạn tại đây... Hãy nhập những dòng văn đầu tiên hoặc nhấn 'Viết Tiếp Diễn Biến' để AI cùng tham gia sáng tác."
                className="flex-1 w-full bg-transparent resize-none border-none focus:outline-none text-base leading-relaxed font-sans placeholder-neutral-400 min-h-[500px]"
              />
            </div>
          ) : (
            /* Roleplay Text RPG Mode */
            <div className="flex-1 flex flex-col h-full max-w-4xl mx-auto w-full px-4 sm:px-6 py-4">
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {session.roleplayMessages.length === 0 ? (
                  <div className="py-20 text-center text-xs text-neutral-400">
                    Bắt đầu phiên nhập vai bằng cách nhập hành động hoặc lời thoại của nhân vật bên dưới!
                  </div>
                ) : (
                  session.roleplayMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className="text-[11px] text-neutral-400 font-mono mb-1 px-1">
                        {msg.speakerName || (msg.sender === 'user' ? 'Bạn' : 'Người kể chuyện')} · {msg.timestamp}
                      </div>
                      <div
                        className={`rounded-2xl p-3.5 text-xs sm:text-sm max-w-[85%] leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-indigo-600 text-white rounded-br-xs'
                            : 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 shadow-2xs rounded-bl-xs'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{msg.text}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendRoleplay} className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex gap-2">
                <input
                  type="text"
                  value={roleplayInput}
                  onChange={(e) => setRoleplayInput(e.target.value)}
                  placeholder={t.inputPlaceholder}
                  className="flex-1 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-2.5 text-xs sm:text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!roleplayInput.trim() || isGenerating}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-xs"
                >
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:inline">Gửi</span>
                </button>
              </form>
            </div>
          )}
        </main>

        {/* Right Dock: Active Game Mods & Widgets (Collapsible) */}
        {isRightDockOpen && (
          <aside className="w-64 sm:w-72 border-l border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 sm:p-4 overflow-y-auto space-y-4 shrink-0 transition-all duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
              <span className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Dices className="h-4 w-4 text-purple-600" />
                <span>Mod Widgets Đang Chạy</span>
              </span>
              <button
                onClick={onOpenPlugins}
                className="text-[11px] text-indigo-600 hover:underline font-semibold"
              >
                Quản lý ({activePlugins.filter((p) => p.status === 'active').length})
              </button>
            </div>

            {/* Quick Mod Switcher Panel */}
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-2.5 bg-neutral-50/70 dark:bg-neutral-950 space-y-2">
              <div 
                className="flex items-center justify-between cursor-pointer select-none"
                onClick={() => setShowQuickToggles((v) => !v)}
              >
                <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                  <Power className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Bật / Tắt Nhanh Mod</span>
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {showQuickToggles ? '▲ Thu' : '▼ Mở'}
                </span>
              </div>

              {showQuickToggles && (
                <div className="space-y-1.5 pt-1 border-t border-neutral-200/60 dark:border-neutral-800">
                  {activePlugins.map((plugin) => {
                    const isModActive = plugin.status === 'active';
                    const isModCrashed = plugin.status === 'crashed';
                    return (
                      <div
                        key={plugin.id}
                        className="flex items-center justify-between gap-1.5 text-xs py-1 px-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                      >
                        <span className="truncate text-[11px] font-medium text-neutral-800 dark:text-neutral-200" title={plugin.name}>
                          {plugin.name}
                        </span>

                        <button
                          onClick={() => onTogglePlugin(plugin.id)}
                          title={isModActive ? 'Nhấn để TẮT' : 'Nhấn để BẬT'}
                          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono transition-all ${
                            isModActive
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                              : isModCrashed
                              ? 'bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-300'
                              : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500 border border-neutral-300 dark:border-neutral-700'
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              isModActive ? 'bg-emerald-500 animate-pulse' : isModCrashed ? 'bg-red-500' : 'bg-neutral-400'
                            }`}
                          />
                          <span>{isModActive ? 'ON' : 'OFF'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Widget 1: Dice Roller Mod */}
            {activePlugins.some((p) => p.id === 'dice_roller_rpg' && p.status === 'active') && (
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 bg-neutral-50/50 dark:bg-neutral-950 space-y-2.5">
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block">
                  Tung Xúc Xắc RPG
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[4, 6, 8, 10, 12, 20, 100].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleRollDice(s)}
                      className="p-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-mono font-bold text-neutral-900 dark:text-white hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:border-purple-300 transition-colors"
                    >
                      d{s}
                    </button>
                  ))}
                </div>

                {diceHistory.length > 0 && (
                  <div className="text-xs p-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 font-mono">
                    <span className="text-neutral-400">d{diceHistory[0].sides}: </span>
                    <strong className="text-purple-600 font-bold text-sm">
                      {diceHistory[0].result}
                    </strong>
                    <span className="text-[10px] text-amber-600">{diceHistory[0].note}</span>
                  </div>
                )}
              </div>
            )}

            {/* Widget 2: Character Stats Mod */}
            {activePlugins.some((p) => p.id === 'character_stat_sheet' && p.status === 'active') && (
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 bg-neutral-50/50 dark:bg-neutral-950 space-y-2.5">
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block">
                  Chỉ Số Nhân Vật
                </span>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-red-600 font-semibold">Sinh Lực (HP):</span>
                    <span className="font-mono font-bold">{characterHp}/100</span>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full" style={{ width: `${characterHp}%` }} />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-blue-600 font-semibold">Năng Lượng (MP):</span>
                    <span className="font-mono font-bold">{characterMp}/100</span>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full" style={{ width: `${characterMp}%` }} />
                  </div>
                </div>

                <div className="flex gap-1 pt-1">
                  <button
                    onClick={() => setCharacterHp((h) => Math.max(0, h - 10))}
                    className="flex-1 py-1 rounded bg-neutral-200 dark:bg-neutral-800 text-[10px] font-semibold"
                  >
                    -10 HP
                  </button>
                  <button
                    onClick={() => setCharacterHp((h) => Math.min(100, h + 10))}
                    className="flex-1 py-1 rounded bg-neutral-200 dark:bg-neutral-800 text-[10px] font-semibold"
                  >
                    +10 HP
                  </button>
                </div>
              </div>
            )}

            {/* Widget 3: Lore & Name Generator Mod */}
            {activePlugins.some((p) => p.id === 'lore_name_generator' && p.status === 'active') && (
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 bg-neutral-50/50 dark:bg-neutral-950 space-y-2">
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block">
                  Sinh Tên Ngẫu Nhiên
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleGenerateName('xianxia')}
                    className="flex-1 p-1 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[11px] font-semibold"
                  >
                    Tiên Hiệp
                  </button>
                  <button
                    onClick={() => handleGenerateName('fantasy')}
                    className="flex-1 p-1 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[11px] font-semibold"
                  >
                    Kỳ Ảo
                  </button>
                </div>
                {generatedName && (
                  <div className="p-2 rounded bg-indigo-50 dark:bg-indigo-950/40 text-xs font-bold text-indigo-700 dark:text-indigo-300 text-center font-mono">
                    {generatedName}
                  </div>
                )}
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
};
