import React, { useState } from 'react';
import { PluginMod, PluginErrorReport, Language } from '../types';
import { I18N } from '../utils/i18n';
import { testPluginPreflight } from '../utils/pluginEngine';
import { 
  Puzzle, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Code, 
  RotateCcw, 
  X, 
  Play, 
  FileCode,
  ShieldAlert,
  Bug,
  HelpCircle,
  Copy,
  Power
} from 'lucide-react';

interface PluginManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  plugins: PluginMod[];
  setPlugins: React.Dispatch<React.SetStateAction<PluginMod[]>>;
  onPluginStatusChange: (pluginId: string, newStatus: 'active' | 'disabled') => void;
  lang: Language;
}

export const PluginManagerModal: React.FC<PluginManagerModalProps> = ({
  isOpen,
  onClose,
  plugins,
  setPlugins,
  onPluginStatusChange,
  lang,
}) => {
  const t = I18N[lang];
  const [editingPlugin, setEditingPlugin] = useState<PluginMod | null>(null);
  const [editedCode, setEditedCode] = useState('');
  const [viewingError, setViewingError] = useState<PluginErrorReport | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newModName, setNewModName] = useState('');
  const [newModDesc, setNewModDesc] = useState('');
  const [newModCode, setNewModCode] = useState(`// Plugin Template
return {
  name: "Plugin Tùy Biến Của Bạn",
  run: function() {
    return "Plugin đang chạy bình thường";
  }
};`);

  if (!isOpen) return null;

  const handleToggle = (plugin: PluginMod) => {
    if (plugin.status === 'active') {
      onPluginStatusChange(plugin.id, 'disabled');
    } else {
      // Pre-flight test
      const test = testPluginPreflight(plugin.code);
      if (!test.ok && test.error) {
        setPlugins((prev) =>
          prev.map((p) =>
            p.id === plugin.id
              ? { ...p, status: 'rejected', errorReport: test.error }
              : p
          )
        );
        setViewingError(test.error);
      } else {
        onPluginStatusChange(plugin.id, 'active');
      }
    }
  };

  const handleOpenEditor = (plugin: PluginMod) => {
    setEditingPlugin(plugin);
    setEditedCode(plugin.code);
  };

  const handleSaveAndRetest = () => {
    if (!editingPlugin) return;
    const test = testPluginPreflight(editedCode);
    if (!test.ok && test.error) {
      setPlugins((prev) =>
        prev.map((p) =>
          p.id === editingPlugin.id
            ? { ...p, code: editedCode, status: 'rejected', errorReport: test.error }
            : p
        )
      );
      setViewingError(test.error);
    } else {
      setPlugins((prev) =>
        prev.map((p) =>
          p.id === editingPlugin.id
            ? { ...p, code: editedCode, status: 'active', errorReport: undefined }
            : p
        )
      );
      setEditingPlugin(null);
    }
  };

  const handleAddNewPlugin = () => {
    if (!newModName.trim()) return;
    const test = testPluginPreflight(newModCode);
    const newPlugin: PluginMod = {
      id: `mod_${Date.now()}`,
      name: newModName.trim(),
      version: '1.0.0',
      author: 'User',
      category: 'widget',
      description: newModDesc.trim() || 'Mod do người dùng cài đặt.',
      code: newModCode,
      status: test.ok ? 'active' : 'rejected',
      errorReport: test.error,
    };
    setPlugins((prev) => [...prev, newPlugin]);
    setIsAddingNew(false);
    setNewModName('');
    setNewModDesc('');
    if (!test.ok && test.error) {
      setViewingError(test.error);
    }
  };

  const handleDelete = (id: string) => {
    setPlugins((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div 
        className="w-full max-w-3xl rounded-2xl bg-white dark:bg-neutral-900 shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-6 py-4 bg-neutral-50/50 dark:bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-white shadow-xs">
              <Puzzle className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">{t.pluginTitle}</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{t.pluginDesc}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddingNew(true)}
              className="flex items-center gap-1.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-3 py-1.5 text-xs font-semibold hover:opacity-90 transition-opacity shadow-2xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t.installPlugin}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Add New Mod Form */}
          {isAddingNew && (
            <div className="rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/30 dark:bg-purple-950/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 dark:text-purple-200">
                  Cài Đặt Mod Mới (Kiểm tra Sandbox trước khi nạp)
                </span>
                <button onClick={() => setIsAddingNew(false)} className="text-neutral-400 hover:text-neutral-600">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Tên Mod (ví dụ: Bảng Tung Xúc Xắc Mở Rộng)"
                  value={newModName}
                  onChange={(e) => setNewModName(e.target.value)}
                  className="rounded-md border border-neutral-200 dark:border-neutral-700 p-2 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Mô tả chức năng ngắn gọn..."
                  value={newModDesc}
                  onChange={(e) => setNewModDesc(e.target.value)}
                  className="rounded-md border border-neutral-200 dark:border-neutral-700 p-2 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                  Mã nguồn JavaScript của Mod:
                </label>
                <textarea
                  rows={5}
                  value={newModCode}
                  onChange={(e) => setNewModCode(e.target.value)}
                  className="w-full rounded-md border border-neutral-200 dark:border-neutral-700 p-2.5 font-mono text-xs bg-neutral-950 text-neutral-100"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsAddingNew(false)}
                  className="rounded-md border border-neutral-200 dark:border-neutral-700 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAddNewPlugin}
                  className="flex items-center gap-1 rounded-md bg-purple-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-purple-700"
                >
                  <Play className="h-3 w-3" />
                  <span>Kiểm Định & Nạp Mod</span>
                </button>
              </div>
            </div>
          )}

          {/* Plugin list */}
          <div className="space-y-3">
            {plugins.map((plugin) => {
              const isActive = plugin.status === 'active';
              const isRejected = plugin.status === 'rejected';
              const isCrashed = plugin.status === 'crashed';

              return (
                <div
                  key={plugin.id}
                  className={`rounded-xl border p-4 transition-all flex flex-col justify-between gap-3 ${
                    isCrashed || isRejected
                      ? 'border-red-300 dark:border-red-900/60 bg-red-50/20 dark:bg-red-950/20'
                      : isActive
                      ? 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-2xs'
                      : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                          {plugin.name}
                        </h4>
                        <span className="text-[11px] font-mono text-neutral-400">v{plugin.version}</span>
                        {/* Status Badge */}
                        {isActive && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>{t.pluginStatusActive}</span>
                          </span>
                        )}
                        {plugin.status === 'disabled' && (
                          <span className="text-[10px] text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                            {t.pluginStatusDisabled}
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                            <AlertTriangle className="h-3 w-3" />
                            <span>{t.pluginStatusRejected}</span>
                          </span>
                        )}
                        {isCrashed && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800 animate-pulse">
                            <Bug className="h-3 w-3" />
                            <span>{t.pluginStatusCrashed}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                        {plugin.description}
                      </p>
                    </div>

                    {/* Controls: Clear Switch Toggle */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        onClick={() => handleToggle(plugin)}
                        title={isActive ? 'Nhấn để TẮT Plugin này' : 'Nhấn để BẬT Plugin này'}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs border ${
                          isActive
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
                            : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                        }`}
                      >
                        {/* Switch Track & Thumb */}
                        <div
                          className={`w-7 h-4 rounded-full transition-colors relative flex items-center p-0.5 ${
                            isActive ? 'bg-emerald-600' : 'bg-neutral-400 dark:bg-neutral-600'
                          }`}
                        >
                          <div
                            className={`w-3 h-3 rounded-full bg-white shadow-xs transition-transform transform ${
                              isActive ? 'translate-x-3' : 'translate-x-0'
                            }`}
                          />
                        </div>
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <Power className="h-3 w-3" />
                          {isActive ? 'BẬT (ON)' : 'TẮT (OFF)'}
                        </span>
                      </button>

                      <button
                        onClick={() => handleOpenEditor(plugin)}
                        title="Chỉnh sửa mã nguồn"
                        className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      >
                        <Code className="h-4 w-4" />
                      </button>

                      {plugin.errorReport && (
                        <button
                          onClick={() => setViewingError(plugin.errorReport!)}
                          title="Xem báo cáo lỗi"
                          className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 hover:bg-red-200 transition-colors"
                        >
                          <ShieldAlert className="h-4 w-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(plugin.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Crash alert banner */}
                  {(isCrashed || isRejected) && plugin.errorReport && (
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-red-100/60 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-xs">
                      <div className="flex items-center gap-2 text-red-800 dark:text-red-300">
                        <Bug className="h-4 w-4 shrink-0" />
                        <span className="truncate max-w-md font-mono">
                          {plugin.errorReport.message}
                        </span>
                      </div>
                      <button
                        onClick={() => handleOpenEditor(plugin)}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
                      >
                        Sửa code ngay &rarr;
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-6 py-3.5">
          <span className="text-xs text-neutral-500">
            Hệ thống tự động kích hoạt bảo vệ Watchdog trong suốt quá trình viết và nhập vai.
          </span>
          <button
            onClick={onClose}
            className="rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-5 py-1.5 text-xs font-semibold hover:opacity-90"
          >
            {t.close}
          </button>
        </div>
      </div>

      {/* In-App Mod Code Editor Modal */}
      {editingPlugin && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-neutral-900 shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-6 py-4 bg-neutral-50 dark:bg-neutral-950">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-purple-600" />
                  <span>Trình Sửa Mã Nguồn: {editingPlugin.name}</span>
                </h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Chỉnh sửa mã JavaScript và bấm "Kiểm Tra & Nạp Lại" để Sandbox kiểm tra tự động.
                </p>
              </div>
              <button onClick={() => setEditingPlugin(null)} className="text-neutral-400 hover:text-neutral-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-auto bg-neutral-950 text-neutral-100 font-mono text-xs">
              <textarea
                rows={16}
                value={editedCode}
                onChange={(e) => setEditedCode(e.target.value)}
                className="w-full h-full bg-transparent resize-none border-none focus:outline-none text-neutral-100 font-mono leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800 px-6 py-3.5 bg-neutral-50 dark:bg-neutral-950">
              <span className="text-[11px] text-neutral-400">Sandbox sẽ chạy thử nghiệm trước khi cho phép nạp.</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingPlugin(null)}
                  className="rounded-lg border border-neutral-200 dark:border-neutral-700 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveAndRetest}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Kiểm Tra & Nạp Lại</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Report Modal */}
      {viewingError && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-2xl border border-red-200 dark:border-red-900/60 space-y-4">
            <div className="flex items-center justify-between border-b border-red-100 dark:border-red-900/40 pb-3">
              <div className="flex items-center gap-2 text-red-600">
                <ShieldAlert className="h-5 w-5" />
                <h3 className="text-sm font-bold">{t.diagnosticReport}</h3>
              </div>
              <button onClick={() => setViewingError(null)} className="text-neutral-400 hover:text-neutral-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200 font-semibold">
                {viewingError.message}
              </div>
              {viewingError.line && (
                <div className="text-[11px] font-mono text-neutral-500">
                  Dòng phát sinh lỗi: <strong className="text-red-600">Dòng {viewingError.line}</strong>
                </div>
              )}
              {viewingError.stack && (
                <pre className="rounded-lg bg-neutral-950 p-3 text-[10px] font-mono text-neutral-300 max-h-48 overflow-auto whitespace-pre-wrap">
                  {viewingError.stack}
                </pre>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingError(null)}
                className="rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-4 py-1.5 text-xs font-semibold"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
