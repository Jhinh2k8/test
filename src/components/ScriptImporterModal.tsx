import React, { useState } from 'react';
import { Language, PluginMod } from '../types';
import { I18N } from '../utils/i18n';
import { testPluginPreflight } from '../utils/pluginEngine';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  X, 
  Sparkles, 
  FileCode, 
  BookOpen, 
  Layers 
} from 'lucide-react';

interface ScriptImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onImportContent: (type: 'text' | 'plugin' | 'lore', data: any) => void;
}

export const ScriptImporterModal: React.FC<ScriptImporterModalProps> = ({
  isOpen,
  onClose,
  lang,
  onImportContent,
}) => {
  const t = I18N[lang];
  const [dragActive, setDragActive] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const fileName = file.name.toLowerCase();

      if (fileName.endsWith('.js')) {
        // Plugin file
        const test = testPluginPreflight(text);
        const mod: PluginMod = {
          id: `mod_${Date.now()}`,
          name: file.name.replace('.js', ''),
          version: '1.0.0',
          author: 'Imported',
          category: 'widget',
          description: 'Mod nạp từ tệp tin bên ngoài',
          code: text,
          status: test.ok ? 'active' : 'rejected',
          errorReport: test.error,
        };
        onImportContent('plugin', mod);
        setSuccessMsg(`Đã nạp plugin "${file.name}"! Trạng thái: ${test.ok ? 'Khởi chạy thành công' : 'Bị từ chối do lỗi'}`);
      } else if (fileName.endsWith('.json')) {
        try {
          const parsed = JSON.parse(text);
          onImportContent('lore', parsed);
          setSuccessMsg(`Đã nạp dữ liệu cấu trúc JSON từ "${file.name}"!`);
        } catch {
          setSuccessMsg('Tệp JSON không hợp lệ.');
        }
      } else {
        // Text / Prompt file (.txt, .prompt, .md)
        onImportContent('text', text);
        setSuccessMsg(`Đã nạp nội dung văn bản từ "${file.name}" vào chương hiện tại!`);
      }
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-neutral-900 shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-6 py-4 bg-neutral-50/50 dark:bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
              <Upload className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">{t.navImport}</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Hỗ trợ các định dạng .prompt, .txt, .json, .js
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drag & Drop Area */}
        <div className="p-6 space-y-4">
          <label
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
              dragActive
                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20'
                : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 bg-neutral-50/40 dark:bg-neutral-950/40'
            }`}
          >
            <Upload className="h-8 w-8 text-neutral-400 mb-2" />
            <div className="text-sm font-semibold text-neutral-900 dark:text-white">
              Kéo thả tệp vào đây hoặc nhấn để chọn tệp
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              .prompt / .txt (Prompt, chương truyện) · .js (Plugin Mod) · .json (Lorebook)
            </div>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".prompt,.txt,.json,.js,.md"
              className="hidden"
            />
          </label>

          {successMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Preset Templates */}
          <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <span className="text-xs font-semibold text-neutral-500">Mẫu nạp sẵn nhanh:</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => {
                  onImportContent('text', 'Bối cảnh: Thế giới hậu tận thế năm 2184, nơi các AI cổ đại thức tỉnh dưới lòng đại dương...');
                  setSuccessMsg('Đã nạp prompt bối cảnh mẫu Cyberpunk!');
                }}
                className="p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                <div className="font-semibold text-neutral-900 dark:text-white">Bối Cảnh Hậu Tận Thế</div>
                <div className="text-[10px] text-neutral-400">Sci-Fi Prompt</div>
              </button>

              <button
                onClick={() => {
                  onImportContent('text', 'Bối cảnh: Tu chân giới Đông Hoang, nơi tông môn phân tranh và linh khí dần cạn kiệt...');
                  setSuccessMsg('Đã nạp prompt bối cảnh Tiên hiệp!');
                }}
                className="p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                <div className="font-semibold text-neutral-900 dark:text-white">Bối Cảnh Tiên Hiệp Kỳ Ảo</div>
                <div className="text-[10px] text-neutral-400">Fantasy Prompt</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
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
