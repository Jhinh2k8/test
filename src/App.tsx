import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  StorySession, 
  AiCouncilMember, 
  ApiKeyItem, 
  PluginMod, 
  TuningConfig, 
  Language, 
  AppTheme,
  PluginErrorReport
} from './types';
import { DEFAULT_COUNCIL, AiCouncilDrawer } from './components/AiCouncilDrawer';
import { DEFAULT_PLUGINS, testPluginPreflight } from './utils/pluginEngine';
import { Header } from './components/Header';
import { WritingCanvas } from './components/WritingCanvas';
import { ApiKeyModal } from './components/ApiKeyModal';
import { PluginManagerModal } from './components/PluginManagerModal';
import { ScriptImporterModal } from './components/ScriptImporterModal';
import { DevTestingLab } from './components/DevTestingLab';
import { I18N } from './utils/i18n';
import { CheckCircle2, AlertTriangle, Bug } from 'lucide-react';

const STORAGE_KEY = 'novelcraft_studio_v1';

const INITIAL_STORY: StorySession = {
  id: 'story_default',
  title: 'Hành Trình Khởi Nguyên: Biên Niên Sử Vô Tận',
  mode: 'novel',
  genre: 'Tiên Hiệp Kỳ Ảo',
  synopsis: 'Thế giới nơi linh khí suy vi, các tông môn thượng cổ đóng cửa quy ẩn. Một thiếu niên vô danh tình cờ phát hiện ra bia đá chứa tri thức của nền văn minh cổ...',
  activeChapterId: 'chap_1',
  chapters: [
    {
      id: 'chap_1',
      title: 'Chương 1: Tiếng Chuông Gió Lúc Hoàng Hôn',
      content: `Gió thu thổi qua vách đá Cửu Tiêu, cuốn theo những mảnh lá phong đỏ thẫm rơi lả tả xuống bậc thềm đá phủ đầy rêu xanh.

Lâm Thần đứng bên rìa vực sâu, ngón tay khẽ miết lên chuôi kiếm gỗ cũ kỹ. Ba năm kể từ ngày tông môn sụp đổ, hắn vẫn giữ thói quen đứng đây mỗi buổi chiều tà, lắng nghe tiếng chuông gió phát ra từ phế tích đại điện phía xa.

"Sư huynh, sương mù dưới hẻm núi lại bắt đầu đổi sang màu tím rồi." Giọng nói trong trẻo của tiểu sư muội vang lên từ phía sau gốc tùng cổ thụ.`,
      wordCount: 112,
      updatedAt: new Date().toLocaleTimeString('vi-VN'),
    },
  ],
  roleplayMessages: [
    {
      id: 'msg_1',
      sender: 'narrator',
      text: 'Bạn đang đứng trước cánh cổng dẫn vào Hầm Ngục Cổ Đại. Tiếng gió rít qua khe đá mang theo mùi lưu huỳnh nồng nặc. Trên tay bạn là một thanh kiếm gỗ và một lá bùa hộ thân phát sáng le lói. Bạn sẽ làm gì?',
      timestamp: '12:00',
    },
  ],
  characters: [
    {
      id: 'char_1',
      name: 'Lâm Thần',
      role: 'Nhân vật chính',
      traits: 'Trầm tĩnh, quyết đoán, mang huyết mạch kiếm tu cổ đại',
      bio: 'Đệ tử duy nhất còn sót lại của Cửu Tiêu Kiếm Tông sau thảm họa diệt môn.',
    },
  ],
  loreItems: [
    {
      id: 'lore_1',
      title: 'Cửu Tiêu Kiếm Phái',
      content: 'Tông môn cổ xưa nhất vùng Đông Hoang, tinh thông trận pháp và kiếm đạo.',
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function App() {
  const [lang, setLang] = useState<Language>('vi');
  const [theme, setTheme] = useState<AppTheme>('paper');
  const [activeModal, setActiveModal] = useState<'council' | 'plugins' | 'keys' | 'devlab' | 'import' | null>(null);

  // Core Studio State
  const [session, setSession] = useState<StorySession>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.session) return parsed.session;
      }
    } catch {}
    return INITIAL_STORY;
  });

  const [councilMembers, setCouncilMembers] = useState<AiCouncilMember[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.councilMembers) return parsed.councilMembers;
      }
    } catch {}
    return DEFAULT_COUNCIL;
  });

  const [plugins, setPlugins] = useState<PluginMod[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.plugins) return parsed.plugins;
      }
    } catch {}
    return DEFAULT_PLUGINS;
  });

  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.apiKeys) return parsed.apiKeys;
      }
    } catch {}
    return [
      {
        id: 'key_default',
        label: 'Môi Trường Tích Hợp (Built-in)',
        key: '',
        provider: 'gemini',
        status: 'active',
      },
    ];
  });

  const [activeKeyId, setActiveKeyId] = useState<string>('key_default');

  const [tuningConfig, setTuningConfig] = useState<TuningConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.tuningConfig) return parsed.tuningConfig;
      }
    } catch {}
    return {
      model: 'gemini-3.8-flash',
      temperature: 0.75,
      maxOutputTokens: 2048,
      topP: 0.9,
      responseStyle: 'novel',
      enableWebSearch: false,
      safetyLevel: 'standard',
    };
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'alert' | 'crash' } | null>(null);
  const [pwaPrompt, setPwaPrompt] = useState<any>(null);

  const showToast = (text: string, type: 'success' | 'alert' | 'crash' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // PWA install listener
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setPwaPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallPwa = () => {
    if (!pwaPrompt) return;
    pwaPrompt.prompt();
    pwaPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        showToast('Đang cài đặt ứng dụng NovelCraft Studio lên thiết bị của bạn!');
      }
      setPwaPrompt(null);
    });
  };

  // LocalStorage Auto-save
  useEffect(() => {
    try {
      const stateToSave = {
        session,
        councilMembers,
        plugins,
        apiKeys,
        activeKeyId,
        tuningConfig,
        lang,
        theme,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch {}
  }, [session, councilMembers, plugins, apiKeys, activeKeyId, tuningConfig, lang, theme]);

  // Safe Plugin Crash Watchdog handler (Hot-Kick Guardian)
  const handlePluginCrash = (pluginId: string, error: PluginErrorReport) => {
    setPlugins((prev) =>
      prev.map((p) =>
        p.id === pluginId
          ? {
              ...p,
              status: 'crashed',
              errorReport: error,
            }
          : p
      )
    );

    const crashedMod = plugins.find((p) => p.id === pluginId);
    showToast(
      `Plugin "${crashedMod?.name || pluginId}" đã bị tự động KICK ra ngoài do phát sinh lỗi runtime! Bài viết của bạn vẫn an toàn 100%.`,
      'crash'
    );
  };

  // Toggle single plugin ON / OFF with pre-flight check
  const handleTogglePlugin = (pluginId: string) => {
    const plugin = plugins.find((p) => p.id === pluginId);
    if (!plugin) return;

    if (plugin.status === 'active') {
      setPlugins((prev) =>
        prev.map((p) => (p.id === pluginId ? { ...p, status: 'disabled' } : p))
      );
      showToast(`Đã tắt mod "${plugin.name}"`);
    } else {
      const test = testPluginPreflight(plugin.code);
      if (!test.ok && test.error) {
        setPlugins((prev) =>
          prev.map((p) =>
            p.id === pluginId
              ? { ...p, status: 'rejected', errorReport: test.error }
              : p
          )
        );
        showToast(`Không thể bật mod "${plugin.name}": ${test.error.message}`, 'crash');
      } else {
        setPlugins((prev) =>
          prev.map((p) =>
            p.id === pluginId
              ? { ...p, status: 'active', errorReport: undefined }
              : p
          )
        );
        showToast(`Đã kích hoạt mod "${plugin.name}" thành công!`);
      }
    }
  };

  // AI Generation Trigger (Continue Story / Roleplay reply)
  const handleGenerateContinue = async () => {
    setIsGenerating(true);
    const activeKey = apiKeys.find((k) => k.id === activeKeyId);

    // Build context
    let promptContent = '';
    let systemInstruction = '';

    if (session.mode === 'novel') {
      const activeChap = session.chapters.find((c) => c.id === session.activeChapterId);
      const textToContinue = activeChap?.content || '';
      promptContent = `Bối cảnh: ${session.synopsis}\n\nTác phẩm: "${session.title}" (${session.genre})\n\nNội dung chương hiện tại:\n"""\n${textToContinue.slice(-4000)}\n"""\n\nHãy viết tiếp diễn biến tiếp theo một cách hấp dẫn, giàu cảm xúc, giữ đúng văn phong. Không lặp lại đoạn văn cũ.`;
      systemInstruction = `Bạn là đại văn hào sáng tác chuyên sâu thể loại ${session.genre}. Hãy viết bằng tiếng Việt mượt mà, sâu lắng.`;
    } else {
      // Roleplay mode
      const recentMessages = session.roleplayMessages.slice(-6).map((m) => `${m.speakerName || m.sender}: ${m.text}`).join('\n');
      promptContent = `Bối cảnh thế giới: ${session.synopsis}\n\nLịch sử đối thoại gần nhất:\n${recentMessages}\n\nHãy nhập vai Người kể chuyện (Narrator) và các nhân vật xung quanh để phản hồi lại hành động mới nhất của người chơi. Hãy mô tả kết quả hành động và tạo ra cơ hội hành động tiếp theo.`;
      systemInstruction = 'Bạn là Dungeon Master và người dẫn chuyện tương tác cho game Text RPG nhập vai.';
    }

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptContent,
          systemInstruction,
          temperature: tuningConfig.temperature,
          maxOutputTokens: tuningConfig.maxOutputTokens,
          topP: tuningConfig.topP,
          enableWebSearch: tuningConfig.enableWebSearch,
          customApiKey: activeKey?.key || '',
          model: tuningConfig.model,
        }),
      });

      const data = await res.json();
      if (!data.ok) {
        showToast(data.error || 'Lỗi khi gọi mô hình AI.', 'alert');
        return;
      }

      if (session.mode === 'novel') {
        // Append generated text to active chapter
        setSession((prev) => ({
          ...prev,
          chapters: prev.chapters.map((c) =>
            c.id === prev.activeChapterId
              ? {
                  ...c,
                  content: (c.content ? c.content + '\n\n' : '') + data.text,
                  wordCount: ((c.content ? c.content + '\n\n' : '') + data.text).trim().split(/\s+/).filter(Boolean).length,
                  updatedAt: new Date().toLocaleTimeString('vi-VN'),
                }
              : c
          ),
        }));
        showToast('Đã viết tiếp thành công!');
      } else {
        // Append message to roleplay log
        const narratorReply = {
          id: `msg_${Date.now()}`,
          sender: 'narrator' as const,
          speakerName: 'Người Kể Chuyện',
          text: data.text,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        };
        setSession((prev) => ({
          ...prev,
          roleplayMessages: [...prev.roleplayMessages, narratorReply],
        }));
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi kết nối khi gọi AI', 'alert');
    } finally {
      setIsGenerating(false);
    }
  };

  // Council consultation handler with dedicated member key & model resolution
  const handleRunCouncilMember = async (member: AiCouncilMember, promptText: string): Promise<string> => {
    let keyToUse = '';
    if (member.customApiKey && member.customApiKey.trim()) {
      keyToUse = member.customApiKey.trim();
    } else if (member.apiKeyId && member.apiKeyId !== 'default') {
      const foundKey = apiKeys.find((k) => k.id === member.apiKeyId);
      keyToUse = foundKey?.key || '';
    } else {
      const activeKey = apiKeys.find((k) => k.id === activeKeyId);
      keyToUse = activeKey?.key || '';
    }

    const modelToUse = member.customModel || tuningConfig.model || 'gemini-3.8-flash';

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          systemInstruction: member.systemPrompt,
          temperature: member.temperature,
          customApiKey: keyToUse,
          model: modelToUse,
        }),
      });
      const data = await res.json();
      if (data.ok && data.text) {
        return data.text;
      }
      return data.error || 'Cố vấn không thể phản hồi vào lúc này.';
    } catch (err: any) {
      return `Lỗi kết nối: ${err.message}`;
    }
  };

  // Inject council member reply into main chat or story
  const handleInjectToMainChat = (senderName: string, text: string) => {
    if (session.mode === 'roleplay') {
      const councilMsg = {
        id: `msg_council_${Date.now()}`,
        sender: 'assistant' as const,
        speakerName: `Cố Vấn [${senderName}]`,
        text: text,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setSession((prev) => ({
        ...prev,
        roleplayMessages: [...prev.roleplayMessages, councilMsg],
      }));
      showToast(`Đã chèn ý kiến của "${senderName}" vào dòng chat chính!`);
    } else {
      setSession((prev) => ({
        ...prev,
        chapters: prev.chapters.map((c) =>
          c.id === prev.activeChapterId
            ? {
                ...c,
                content: (c.content ? c.content + '\n\n' : '') + `> 💬 [Ý Kiến Cố Vấn ${senderName}]:\n> ${text.replace(/\n/g, '\n> ')}`,
                updatedAt: new Date().toLocaleTimeString('vi-VN'),
              }
            : c
        ),
      }));
      showToast(`Đã chèn ghi chú của "${senderName}" vào chương truyện!`);
    }
  };

  // Import handler
  const handleImportContent = (type: 'text' | 'plugin' | 'lore', data: any) => {
    if (type === 'text') {
      setSession((prev) => ({
        ...prev,
        chapters: prev.chapters.map((c) =>
          c.id === prev.activeChapterId
            ? { ...c, content: (c.content ? c.content + '\n\n' : '') + data }
            : c
        ),
      }));
    } else if (type === 'plugin') {
      setPlugins((prev) => [data, ...prev.filter((p) => p.id !== data.id)]);
    } else if (type === 'lore') {
      if (data.title && data.synopsis) {
        setSession((prev) => ({ ...prev, ...data }));
      }
    }
    showToast('Đã nạp tệp thành công!');
  };

  // Active chapter text for council
  const currentChapterText = session.chapters.find((c) => c.id === session.activeChapterId)?.content || '';

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${theme === 'dark' ? 'bg-[#0f1115] text-[#e5e7eb]' : 'bg-neutral-100 text-neutral-900'}`}>
      {/* Header */}
      <Header
        activeView={activeModal || 'writing'}
        setActiveView={(v) => {
          if (v === 'writing') setActiveModal(null);
          else setActiveModal(v);
        }}
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
        onInstallPwa={handleInstallPwa}
        canInstallPwa={!!pwaPrompt}
      />

      {/* Main Workspace Canvas */}
      <WritingCanvas
        session={session}
        setSession={setSession}
        activePlugins={plugins}
        tuningConfig={tuningConfig}
        setTuningConfig={setTuningConfig}
        lang={lang}
        theme={theme}
        isGenerating={isGenerating}
        onGenerateContinue={handleGenerateContinue}
        onOpenCouncil={() => setActiveModal('council')}
        onOpenKeys={() => setActiveModal('keys')}
        onOpenPlugins={() => setActiveModal('plugins')}
        onOpenImporter={() => setActiveModal('import')}
        onOpenDevLab={() => setActiveModal('devlab')}
        onPluginCrash={handlePluginCrash}
        onTogglePlugin={handleTogglePlugin}
      />

      {/* AI Council Drawer */}
      {activeModal === 'council' && (
        <AiCouncilDrawer
          councilMembers={councilMembers}
          setCouncilMembers={setCouncilMembers}
          currentStoryText={currentChapterText}
          mainChatContext={
            session.mode === 'roleplay'
              ? session.roleplayMessages.map((m) => `${m.speakerName || m.sender}: ${m.text}`).join('\n')
              : `Bối cảnh: ${session.synopsis}\nChương hiện tại: ${currentChapterText.slice(-2500)}`
          }
          apiKeys={apiKeys}
          onRunCouncilMember={handleRunCouncilMember}
          onInjectToMainChat={handleInjectToMainChat}
          lang={lang}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* API Key Vault & Tuning Modal */}
      {activeModal === 'keys' && (
        <ApiKeyModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          apiKeys={apiKeys}
          setApiKeys={setApiKeys}
          activeKeyId={activeKeyId}
          setActiveKeyId={setActiveKeyId}
          tuningConfig={tuningConfig}
          setTuningConfig={setTuningConfig}
          lang={lang}
        />
      )}

      {/* Plugin Manager & Code Editor Modal */}
      {activeModal === 'plugins' && (
        <PluginManagerModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          plugins={plugins}
          setPlugins={setPlugins}
          onPluginStatusChange={(pluginId, newStatus) => {
            setPlugins((prev) =>
              prev.map((p) => (p.id === pluginId ? { ...p, status: newStatus } : p))
            );
          }}
          lang={lang}
        />
      )}

      {/* Script & File Importer Modal */}
      {activeModal === 'import' && (
        <ScriptImporterModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          lang={lang}
          onImportContent={handleImportContent}
        />
      )}

      {/* Developer & Testing Lab */}
      {activeModal === 'devlab' && (
        <DevTestingLab
          isOpen={true}
          onClose={() => setActiveModal(null)}
          lang={lang}
          onSimulateCrash={(mockReport) => {
            handlePluginCrash('demo_bad_script', mockReport);
          }}
        />
      )}

      {/* Toast Alert / Crash Guardian Banner */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-60 flex items-center gap-2.5 rounded-xl px-4 py-3 text-xs font-semibold shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150 max-w-md ${
            toastMessage.type === 'crash'
              ? 'bg-red-600 text-white'
              : toastMessage.type === 'alert'
              ? 'bg-amber-600 text-white'
              : 'bg-neutral-900 text-white'
          }`}
        >
          {toastMessage.type === 'crash' ? (
            <Bug className="h-5 w-5 shrink-0 animate-bounce" />
          ) : toastMessage.type === 'alert' ? (
            <AlertTriangle className="h-4 w-4 shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          )}
          <span className="leading-snug">{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
}
