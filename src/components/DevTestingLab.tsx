import React, { useState } from 'react';
import { Language, PluginErrorReport } from '../types';
import { I18N } from '../utils/i18n';
import { testPluginPreflight } from '../utils/pluginEngine';
import { 
  Terminal, 
  Play, 
  Bug, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Code2, 
  Search,
  Activity,
  Layers,
  X
} from 'lucide-react';

interface DevTestingLabProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSimulateCrash: (mockReport: PluginErrorReport) => void;
}

export const DevTestingLab: React.FC<DevTestingLabProps> = ({
  isOpen,
  onClose,
  lang,
  onSimulateCrash,
}) => {
  const t = I18N[lang];
  const [testScript, setTestScript] = useState(`// Thử nghiệm mã Sandbox
function calculateXp(level) {
  return level * 100 * 1.5;
}
return { result: calculateXp(5) };`);
  const [scriptOutput, setScriptOutput] = useState<string | null>(null);
  const [promptInput, setPromptInput] = useState('Tóm tắt ý tưởng tiểu thuyết kỳ ảo');
  const [promptOutput, setPromptOutput] = useState<any>(null);
  const [isPromptLoading, setIsPromptLoading] = useState(false);

  if (!isOpen) return null;

  const handleRunSandbox = () => {
    try {
      const fn = new Function(testScript);
      const res = fn();
      setScriptOutput(`Thành công (Success):\n${JSON.stringify(res, null, 2)}`);
    } catch (err: any) {
      setScriptOutput(`Phát hiện lỗi (Caught in Sandbox):\n${err.message}\n${err.stack || ''}`);
    }
  };

  const handleTriggerSimulatedCrash = () => {
    const mockReport: PluginErrorReport = {
      message: 'Uncaught TypeError: Cannot read property "executeDirective" of undefined (Simulated Crash)',
      stack: 'TypeError: Cannot read property "executeDirective" of undefined\n    at <anonymous>:4:21\n    at executePluginSafely (pluginEngine.ts:62)',
      line: 4,
      phase: 'runtime',
      timestamp: new Date().toLocaleTimeString('vi-VN'),
    };
    onSimulateCrash(mockReport);
  };

  const handleTestRawPrompt = async () => {
    if (!promptInput.trim()) return;
    setIsPromptLoading(true);
    setPromptOutput(null);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptInput,
          enableWebSearch: true,
          maxOutputTokens: 256,
        }),
      });
      const data = await res.json();
      setPromptOutput(data);
    } catch (err: any) {
      setPromptOutput({ ok: false, error: err.message });
    } finally {
      setIsPromptLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-4xl rounded-2xl bg-white dark:bg-neutral-900 shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-6 py-4 bg-neutral-950 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
              <Terminal className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold">{t.devLabTitle}</h3>
              <p className="text-xs text-neutral-400">{t.devLabDesc}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Hot-Kick Crash Simulator */}
          <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/20 dark:bg-red-950/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-red-900 dark:text-red-300">
                <Bug className="h-4 w-4 text-red-600" />
                <span>Giả Lập Crash & Kiểm Thử Cơ Chế Hot-Kick Tự Động</span>
              </div>
              <button
                onClick={handleTriggerSimulatedCrash}
                className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors shadow-xs"
              >
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Kích Hoạt Lỗi Thử Nghiệm</span>
              </button>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Nhấn nút trên để ném một ngoại lệ runtime giả lập. Bạn sẽ thấy hệ thống lập tức tự động ngắt mod, hiện thông báo lỗi và giữ an toàn 100% cho bài viết của bạn mà không hề sập app!
            </p>
          </div>

          {/* Section 2: Code Sandbox Runner */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-neutral-900 dark:text-white flex items-center gap-2">
                <Code2 className="h-4 w-4 text-indigo-600" />
                <span>Chạy Thử Nghiệm Đoạn Mã JavaScript trong Sandbox</span>
              </span>
              <button
                onClick={handleRunSandbox}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                <Play className="h-3 w-3" />
                <span>Thực Thi</span>
              </button>
            </div>

            <textarea
              rows={4}
              value={testScript}
              onChange={(e) => setTestScript(e.target.value)}
              className="w-full rounded-lg bg-neutral-950 p-3 font-mono text-xs text-neutral-100 focus:outline-none"
            />

            {scriptOutput && (
              <pre className="rounded-lg bg-neutral-900 p-3 font-mono text-[11px] text-neutral-200 max-h-36 overflow-auto whitespace-pre-wrap">
                {scriptOutput}
              </pre>
            )}
          </div>

          {/* Section 3: Raw AI Prompt & Web Search Grounding Inspector */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-neutral-900 dark:text-white flex items-center gap-2">
                <Search className="h-4 w-4 text-emerald-600" />
                <span>Kiểm Tra Phản Hồi AI Thô & Tra Cứu Web (Search Grounding)</span>
              </span>
              <button
                onClick={handleTestRawPrompt}
                disabled={isPromptLoading}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                <Activity className={`h-3 w-3 ${isPromptLoading ? 'animate-spin' : ''}`} />
                <span>{isPromptLoading ? 'Đang gửi...' : 'Test Request'}</span>
              </button>
            </div>

            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="Nhập prompt muốn test tra cứu..."
              className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 p-2 text-xs text-neutral-900 dark:text-white bg-neutral-50 dark:bg-neutral-800"
            />

            {promptOutput && (
              <pre className="rounded-lg bg-neutral-950 p-3 font-mono text-[11px] text-neutral-200 max-h-48 overflow-auto whitespace-pre-wrap">
                {JSON.stringify(promptOutput, null, 2)}
              </pre>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-6 py-3.5">
          <button
            onClick={onClose}
            className="rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-5 py-2 text-xs font-semibold"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
