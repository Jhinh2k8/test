import React, { useState } from 'react';
import { ApiKeyItem, TuningConfig, Language } from '../types';
import { I18N } from '../utils/i18n';
import { 
  Key, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  X, 
  Sliders, 
  Search, 
  Sparkles,
  ShieldAlert,
  Activity
} from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeys: ApiKeyItem[];
  setApiKeys: React.Dispatch<React.SetStateAction<ApiKeyItem[]>>;
  activeKeyId: string;
  setActiveKeyId: (id: string) => void;
  tuningConfig: TuningConfig;
  setTuningConfig: React.Dispatch<React.SetStateAction<TuningConfig>>;
  lang: Language;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKeys,
  setApiKeys,
  activeKeyId,
  setActiveKeyId,
  tuningConfig,
  setTuningConfig,
  lang,
}) => {
  const t = I18N[lang];
  const [newKeyLabel, setNewKeyLabel] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [testingKeyId, setTestingKeyId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'keys' | 'tuning'>('keys');

  if (!isOpen) return null;

  const handleAddKey = () => {
    if (!newKeyValue.trim()) return;
    const item: ApiKeyItem = {
      id: `key_${Date.now()}`,
      label: newKeyLabel.trim() || 'API Key',
      key: newKeyValue.trim(),
      provider: 'gemini',
      status: 'untested',
    };
    setApiKeys((prev) => [...prev, item]);
    if (!activeKeyId) setActiveKeyId(item.id);
    setNewKeyLabel('');
    setNewKeyValue('');
  };

  const handleRemoveKey = (id: string) => {
    setApiKeys((prev) => prev.filter((k) => k.id !== id));
    if (activeKeyId === id) {
      const remaining = apiKeys.filter((k) => k.id !== id);
      if (remaining.length > 0) setActiveKeyId(remaining[0].id);
    }
  };

  const handlePingTest = async (keyItem: ApiKeyItem) => {
    setTestingKeyId(keyItem.id);
    const start = Date.now();
    try {
      // Test key via quick ping or lightweight prompt
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'ping test',
          customApiKey: keyItem.key,
          maxOutputTokens: 10,
        }),
      });
      const data = await res.json();
      const latencyMs = Date.now() - start;

      setApiKeys((prev) =>
        prev.map((k) =>
          k.id === keyItem.id
            ? {
                ...k,
                status: data.ok ? 'active' : 'error',
                latencyMs,
                lastChecked: new Date().toLocaleTimeString('vi-VN'),
              }
            : k
        )
      );
    } catch {
      setApiKeys((prev) =>
        prev.map((k) =>
          k.id === keyItem.id
            ? {
                ...k,
                status: 'error',
                latencyMs: Date.now() - start,
                lastChecked: new Date().toLocaleTimeString('vi-VN'),
              }
            : k
        )
      );
    } finally {
      setTestingKeyId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div 
        className="w-full max-w-2xl rounded-2xl bg-white dark:bg-neutral-900 shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-6 py-4 bg-neutral-50/50 dark:bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
              <Key className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">{t.keyManagerTitle}</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{t.keyManagerDesc}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-0.5 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('keys')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTab === 'keys' ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Danh Sách Key
              </button>
              <button
                onClick={() => setActiveTab('tuning')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTab === 'tuning' ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Tham Số Sinh AI
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'keys' ? (
            <div className="space-y-5">
              {/* Add Key Form */}
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950 p-4 space-y-3">
                <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  {t.addKey} (Gemini AI Key hoặc Endpoint tương thích)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Nhãn (ví dụ: Key Gemini Cá Nhân)"
                    value={newKeyLabel}
                    onChange={(e) => setNewKeyLabel(e.target.value)}
                    className="rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-1.5 text-xs text-neutral-900 dark:text-white"
                  />
                  <input
                    type="password"
                    placeholder="Dán API Key (AIzaSy...)"
                    value={newKeyValue}
                    onChange={(e) => setNewKeyValue(e.target.value)}
                    className="sm:col-span-2 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-1.5 text-xs font-mono text-neutral-900 dark:text-white"
                  />
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleAddKey}
                    disabled={!newKeyValue.trim()}
                    className="flex items-center gap-1.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-4 py-1.5 text-xs font-semibold disabled:opacity-50 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Lưu Key Mới</span>
                  </button>
                </div>
              </div>

              {/* Existing Keys List */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-neutral-500">Các API Key đã lưu trữ:</div>
                {apiKeys.length === 0 ? (
                  <div className="py-8 text-center text-xs text-neutral-400">
                    Chưa có API Key nào được nhập. Mặc định hệ thống sẽ dùng Key tích hợp trong môi trường.
                  </div>
                ) : (
                  apiKeys.map((k) => {
                    const isSelected = activeKeyId === k.id;
                    return (
                      <div
                        key={k.id}
                        onClick={() => setActiveKeyId(k.id)}
                        className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20 ring-1 ring-indigo-300'
                            : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            checked={isSelected}
                            onChange={() => setActiveKeyId(k.id)}
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <div>
                            <div className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                              <span>{k.label}</span>
                              {isSelected && (
                                <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-mono">
                                  Đang Dùng
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-neutral-400 mt-0.5">
                              {k.key.slice(0, 8)}••••••••{k.key.slice(-4)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {k.status === 'active' && (
                            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 font-semibold">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>{k.latencyMs}ms</span>
                            </span>
                          )}
                          {k.status === 'error' && (
                            <span className="flex items-center gap-1 text-[11px] font-mono text-red-600 font-semibold">
                              <AlertCircle className="h-3.5 w-3.5" />
                              <span>Lỗi</span>
                            </span>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePingTest(k);
                            }}
                            disabled={testingKeyId === k.id}
                            className="flex items-center gap-1 rounded-md border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-2.5 py-1 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 transition-colors"
                          >
                            <Activity className={`h-3 w-3 ${testingKeyId === k.id ? 'animate-spin' : ''}`} />
                            <span>{testingKeyId === k.id ? 'Đang test...' : 'Ping Test'}</span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveKey(k.id);
                            }}
                            className="p-1 text-neutral-400 hover:text-red-600 rounded transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            /* Tuning Parameters View */
            <div className="space-y-5 text-xs">
              {/* Web Search Grounding Toggle */}
              <div className="flex items-start justify-between p-4 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-950/30">
                <div className="flex gap-3">
                  <Search className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-sm text-neutral-900 dark:text-white">
                      {t.searchGrounding}
                    </div>
                    <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-0.5">
                      {t.searchGroundingDesc}
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={tuningConfig.enableWebSearch}
                  onChange={(e) =>
                    setTuningConfig((prev) => ({ ...prev, enableWebSearch: e.target.checked }))
                  }
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-5 w-5 mt-1"
                />
              </div>

              {/* Model Choice */}
              <div>
                <label className="block font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                  Mô Hình AI (AI Model)
                </label>
                <select
                  value={tuningConfig.model}
                  onChange={(e) => setTuningConfig((prev) => ({ ...prev, model: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-2 text-xs font-mono text-neutral-900 dark:text-white"
                >
                  <option value="gemini-3.8-flash">gemini-3.8-flash (Tốc độ cao, tối ưu viết truyện & hỗ trợ web search)</option>
                  <option value="gemini-4-argon">gemini-4-argon (Tư duy sâu sắc, văn phong phức tạp)</option>
                  <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Siêu nhẹ, phản hồi tức thì)</option>
                </select>
              </div>

              {/* Response Style Preset */}
              <div>
                <label className="block font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                  Phong Cách Văn Phong Mặc Định (Response Style)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'novel', label: t.styleNovel },
                    { id: 'scifi', label: t.styleScifi },
                    { id: 'fantasy', label: t.styleFantasy },
                    { id: 'rpg_chat', label: t.styleRpg },
                    { id: 'romance', label: t.styleRomance },
                    { id: 'custom', label: 'Tùy chỉnh tự do' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setTuningConfig((p) => ({ ...p, responseStyle: s.id as any }))}
                      className={`p-2 rounded-lg border text-xs font-medium text-left transition-colors ${
                        tuningConfig.responseStyle === s.id
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold'
                          : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Temperature Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-semibold text-neutral-800 dark:text-neutral-200">
                  <span>{t.temperature}</span>
                  <span className="font-mono tabular-nums text-indigo-600 font-bold">
                    {tuningConfig.temperature}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.5"
                  step="0.05"
                  value={tuningConfig.temperature}
                  onChange={(e) =>
                    setTuningConfig((prev) => ({ ...prev, temperature: parseFloat(e.target.value) }))
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-neutral-400">
                  <span>Nhất quán, bám sát cốt truyện (0.2)</span>
                  <span>Bay bổng, plot twist bất ngờ (1.2)</span>
                </div>
              </div>

              {/* Max Output Tokens */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-semibold text-neutral-800 dark:text-neutral-200">
                  <span>{t.maxTokens}</span>
                  <span className="font-mono tabular-nums text-indigo-600 font-bold">
                    {tuningConfig.maxOutputTokens} tokens
                  </span>
                </div>
                <div className="flex gap-2">
                  {[512, 1024, 2048, 4096, 8192].map((tok) => (
                    <button
                      key={tok}
                      onClick={() => setTuningConfig((p) => ({ ...p, maxOutputTokens: tok }))}
                      className={`flex-1 py-1.5 rounded-md border text-xs font-mono font-semibold ${
                        tuningConfig.maxOutputTokens === tok
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-transparent'
                          : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900'
                      }`}
                    >
                      {tok}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-6 py-3.5">
          <button
            onClick={onClose}
            className="rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-5 py-2 text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
