import React, { useState } from 'react';
import { AiCouncilMember, ApiKeyItem, Language } from '../types';
import { I18N } from '../utils/i18n';
import { 
  Users, 
  Sparkles, 
  Settings, 
  Plus, 
  Check, 
  Play, 
  Send, 
  X, 
  BookOpen, 
  MessageSquare, 
  Globe2, 
  Compass, 
  Key, 
  Eye, 
  CornerDownRight, 
  CheckCircle2, 
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface AiCouncilDrawerProps {
  councilMembers: AiCouncilMember[];
  setCouncilMembers: React.Dispatch<React.SetStateAction<AiCouncilMember[]>>;
  currentStoryText: string;
  mainChatContext?: string;
  apiKeys: ApiKeyItem[];
  onRunCouncilMember: (member: AiCouncilMember, promptText: string) => Promise<string>;
  onInjectToMainChat?: (senderName: string, text: string) => void;
  lang: Language;
  onClose: () => void;
}

export const DEFAULT_COUNCIL: AiCouncilMember[] = [
  {
    id: 'plot_architect',
    name: 'Kiến Trúc Sư Cốt Truyện',
    title: 'Plot Architect & Twist Weaver',
    avatarIcon: 'Compass',
    description: 'Chuyên phân tích diễn biến mạch truyện, nút thắt cao trào và gỡ bế tắc ý tưởng.',
    systemPrompt: `Bạn là Kiến trúc sư Cốt truyện bậc thầy. Hãy theo dõi toàn bộ diễn biến cuộc trò chuyện/truyện chính được cấp quyền xem, sau đó:
1. Chỉ ra 2 điểm mạnh về mạch kịch tính.
2. Đề xuất 3 hướng rẽ bất ngờ (Plot Twist) cho đoạn tiếp theo.
3. Đặt ra một cái bẫy hoặc bí mật chưa được giải đáp để kích thích người đọc.`,
    enabled: true,
    temperature: 0.8,
    canViewMainChat: true,
  },
  {
    id: 'character_expert',
    name: 'Chuyên Gia Nhân Vật',
    title: 'Character Psychology & Dialogue',
    avatarIcon: 'MessageSquare',
    description: 'Kiểm tra tâm lý nhân vật, sự tự nhiên trong đối thoại và mâu thuẫn nội tâm.',
    systemPrompt: `Bạn là Chuyên gia Tâm lý Nhân vật và Thoại. Hãy đọc lịch sử cuộc trò chuyện và truyện chính, sau đó phân tích:
1. Động cơ hành động của các nhân vật trong đoạn văn có nhất quán không?
2. Nhận xét về độ tự nhiên của các câu thoại (có bị kịch quá không?).
3. Gợi ý một chi tiết nhỏ (cử chỉ, thói quen, ánh mắt) giúp nhân vật sống động hơn.`,
    enabled: true,
    temperature: 0.7,
    canViewMainChat: true,
  },
  {
    id: 'literary_critic',
    name: 'Nhà Phê Bình Văn Học',
    title: 'Literary Critic & Pacing',
    avatarIcon: 'BookOpen',
    description: 'Đánh giá nhịp độ, phong cách biểu đạt, cảm xúc và tính gợi hình.',
    systemPrompt: `Bạn là Nhà Phê Bình Văn Học nghiêm túc nhưng giàu tinh thần xây dựng. Hãy đọc diễn biến chính và nhận xét:
1. Nhịp điệu câu văn (Pacing): Đoạn này quá nhanh hay quá lê thê?
2. Từ ngữ và hình ảnh gợi cảm: Có chỗ nào dùng sáo rỗng hoặc lặp từ không?
3. Gợi ý 1 đoạn viết lại ngắn để tăng sức gợi cảm xúc.`,
    enabled: true,
    temperature: 0.6,
    canViewMainChat: true,
  },
  {
    id: 'world_builder',
    name: 'Thủ Thư Bối Cảnh',
    title: 'Worldbuilder & Lore Keeper',
    avatarIcon: 'Globe2',
    description: 'Giám sát tính logic của thế giới, bối cảnh lịch sử, phép thuật hoặc công nghệ.',
    systemPrompt: `Bạn là Thủ thư Quản lý Bối cảnh (Worldbuilder). Hãy theo dõi toàn bộ lịch sử câu chuyện/chat và kiểm tra:
1. Tính logic của các quy tắc thế giới trong đoạn truyện.
2. Chi tiết nào về môi trường, thời tiết hoặc văn hóa có thể đào sâu thêm?
3. Cảnh báo những điểm mâu thuẫn (plot hole) có thể xảy ra.`,
    enabled: true,
    temperature: 0.75,
    canViewMainChat: true,
  },
];

export const AiCouncilDrawer: React.FC<AiCouncilDrawerProps> = ({
  councilMembers,
  setCouncilMembers,
  currentStoryText,
  mainChatContext,
  apiKeys,
  onRunCouncilMember,
  onInjectToMainChat,
  lang,
  onClose,
}) => {
  const t = I18N[lang];
  const [selectedMemberId, setSelectedMemberId] = useState<string>(councilMembers[0]?.id || 'plot_architect');
  const [editingMember, setEditingMember] = useState<AiCouncilMember | null>(null);
  const [councilResponses, setCouncilResponses] = useState<Record<string, { text: string; time: string }>>({});
  const [runningMemberId, setRunningMemberId] = useState<string | null>(null);
  const [customQuestion, setCustomQuestion] = useState('');
  const [showChatContextPreview, setShowChatContextPreview] = useState(false);
  const [injectedSuccess, setInjectedSuccess] = useState<string | null>(null);

  const activeMember = councilMembers.find((m) => m.id === selectedMemberId) || councilMembers[0];

  const handleSaveMember = (updated: AiCouncilMember) => {
    setCouncilMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    setEditingMember(null);
  };

  const handleAddMember = () => {
    const newMember: AiCouncilMember = {
      id: `member_${Date.now()}`,
      name: 'Cố Vấn Mới',
      title: 'Custom Specialist',
      avatarIcon: 'Sparkles',
      description: 'Cố vấn có API key hoặc mô hình riêng, có quyền xem toàn bộ chat chính.',
      systemPrompt: 'Bạn là một cố vấn chuyên biệt. Hãy theo dõi câu chuyện/chat chính và đưa ra phản hồi sắc sảo.',
      enabled: true,
      temperature: 0.7,
      canViewMainChat: true,
      apiKeyId: 'default',
    };
    setCouncilMembers((prev) => [...prev, newMember]);
    setEditingMember(newMember);
  };

  const handleConsult = async (member: AiCouncilMember) => {
    setRunningMemberId(member.id);
    try {
      // Build full context with permissions
      let contextFeed = '';
      if (member.canViewMainChat !== false) {
        if (mainChatContext && mainChatContext.trim()) {
          contextFeed += `\n--- [LỊCH SỬ CHAT VÀ ĐỐI THOẠI CHÍNH TRONG PHÒNG] ---\n${mainChatContext}\n`;
        }
        if (currentStoryText && currentStoryText.trim()) {
          contextFeed += `\n--- [NỘI DUNG CHƯƠNG TRUYỆN CHÍNH HIỆN TẠI] ---\n"""\n${currentStoryText.slice(-3500)}\n"""\n`;
        }
      }

      const promptToSend = customQuestion.trim()
        ? `${contextFeed}\n\n[YÊU CẦU / CÂU HỎI TỪ NGƯỜI DÙNG]: ${customQuestion}`
        : `${contextFeed}\n\n[YÊU CẦU]: Dựa trên toàn bộ nội dung chat và chương truyện trên, hãy đưa ra nhận định chuyên sâu theo vai trò của bạn.`;

      const response = await onRunCouncilMember(member, promptToSend);
      setCouncilResponses((prev) => ({
        ...prev,
        [member.id]: {
          text: response,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
      }));
    } finally {
      setRunningMemberId(null);
    }
  };

  const handleInjectReply = (member: AiCouncilMember) => {
    const reply = councilResponses[member.id]?.text;
    if (!reply || !onInjectToMainChat) return;
    onInjectToMainChat(member.name, reply);
    setInjectedSuccess(member.id);
    setTimeout(() => setInjectedSuccess(null), 3000);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white dark:bg-neutral-900 shadow-2xl border-l border-neutral-200 dark:border-neutral-800 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-6 py-4 bg-neutral-50/60 dark:bg-neutral-950">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">{t.councilTitle}</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Có quyền xem chat chính & hỗ trợ nhét API key AI riêng cho từng thành viên
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Member Selector Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto px-6 py-3 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs">
        {councilMembers.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedMemberId(m.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium ${
              selectedMemberId === m.id
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            <span>{m.name}</span>
            {m.customApiKey && (
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" title="Đang dùng Key riêng" />
            )}
          </button>
        ))}
        <button
          onClick={handleAddMember}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-indigo-500 hover:text-indigo-600 transition-colors whitespace-nowrap"
        >
          <Plus className="h-3 w-3" />
          <span>Thêm vai trò</span>
        </button>
      </div>

      {/* Active Member Details & Consult Body */}
      {activeMember && (
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Member Card */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950 p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <span>{activeMember.name}</span>
                  <span className="text-xs font-mono text-neutral-400 font-normal">({activeMember.title})</span>
                </h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                  {activeMember.description}
                </p>
              </div>

              <button
                onClick={() => setEditingMember(activeMember)}
                className="flex items-center gap-1 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2.5 py-1 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 transition-colors shrink-0 shadow-2xs"
              >
                <Settings className="h-3.5 w-3.5" />
                <span>Cài Đặt & Key AI</span>
              </button>
            </div>

            {/* Badges strip: API Key & Main Chat Permission Status */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                <Eye className="h-3 w-3" />
                <span>{activeMember.canViewMainChat !== false ? 'Có quyền đọc Chat/Truyện chính' : 'Chỉ xem prompt riêng'}</span>
              </span>

              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <Key className="h-3 w-3" />
                <span>
                  {activeMember.customApiKey
                    ? 'Key Riêng: ' + activeMember.customApiKey.slice(0, 6) + '...'
                    : activeMember.apiKeyId && activeMember.apiKeyId !== 'default'
                    ? 'Dùng Key: ' + (apiKeys.find((k) => k.id === activeMember.apiKeyId)?.label || activeMember.apiKeyId)
                    : 'Dùng Key App Mặc Định'}
                </span>
              </span>
            </div>

            {/* Context feed accordion */}
            <div className="pt-1">
              <button
                onClick={() => setShowChatContextPreview(!showChatContextPreview)}
                className="flex items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300"
              >
                {showChatContextPreview ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                <span>Xem trước nội dung chat chính gửi cho cố vấn</span>
              </button>

              {showChatContextPreview && (
                <div className="mt-2 p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[11px] font-mono text-neutral-600 dark:text-neutral-400 max-h-32 overflow-y-auto whitespace-pre-wrap">
                  {mainChatContext || currentStoryText
                    ? `${mainChatContext ? 'Lịch sử chat:\n' + mainChatContext + '\n\n' : ''}${currentStoryText ? 'Chương truyện:\n' + currentStoryText.slice(-600) : ''}`
                    : 'Chưa có nội dung chat hoặc văn bản.'}
                </div>
              )}
            </div>

            {/* Custom Question input */}
            <div className="pt-1">
              <input
                type="text"
                placeholder="Hỏi riêng thành viên này (hoặc để trống để cố vấn tự động phân tích chat chính)..."
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Consult Trigger Button */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-neutral-400">
                Model: {activeMember.customModel || 'gemini-3.8-flash'}
              </span>
              <button
                onClick={() => handleConsult(activeMember)}
                disabled={runningMemberId === activeMember.id}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-xs"
              >
                <Play className={`h-3 w-3 ${runningMemberId === activeMember.id ? 'animate-spin' : ''}`} />
                <span>{runningMemberId === activeMember.id ? 'Đang phân tích...' : 'Tham Vấn Ngay'}</span>
              </button>
            </div>
          </div>

          {/* Response Display */}
          {councilResponses[activeMember.id] ? (
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2.5">
                <span className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Ý Kiến Của {activeMember.name}</span>
                </span>
                <span className="text-[11px] font-mono text-neutral-400">
                  {councilResponses[activeMember.id].time}
                </span>
              </div>

              <div className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-wrap font-sans">
                {councilResponses[activeMember.id].text}
              </div>

              {/* Action: Inject into Main Chat */}
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <span className="text-[11px] text-neutral-400">
                  {injectedSuccess === activeMember.id ? '✓ Đã đưa vào cuộc hội thoại chính!' : 'Có thể đưa lời khuyên này vào cuộc hội thoại chính:'}
                </span>
                <button
                  onClick={() => handleInjectReply(activeMember)}
                  className="flex items-center gap-1.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-3 py-1 text-xs font-semibold hover:bg-indigo-100 transition-colors"
                >
                  <CornerDownRight className="h-3.5 w-3.5" />
                  <span>Đưa Vào Chat Chính</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 p-8 text-center text-xs text-neutral-400">
              Nhấn <strong>"Tham Vấn Ngay"</strong> để cố vấn {activeMember.name} đọc diễn biến chat chính và đưa ra phản hồi.
            </div>
          )}
        </div>
      )}

      {/* Edit System Prompt & Key Settings Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Settings className="h-4 w-4 text-indigo-600" />
                <span>Cài Đặt Cố Vấn: {editingMember.name}</span>
              </h3>
              <button
                onClick={() => setEditingMember(null)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Tên & Chức Danh Cố Vấn
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={editingMember.name}
                    onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                    className="w-full rounded-md border border-neutral-200 dark:border-neutral-700 p-2 text-neutral-900 dark:text-white bg-white dark:bg-neutral-800"
                  />
                  <input
                    type="text"
                    placeholder="Chức danh phụ..."
                    value={editingMember.title}
                    onChange={(e) => setEditingMember({ ...editingMember, title: e.target.value })}
                    className="w-full rounded-md border border-neutral-200 dark:border-neutral-700 p-2 text-neutral-900 dark:text-white bg-white dark:bg-neutral-800"
                  />
                </div>
              </div>

              {/* Dedicated API Key section */}
              <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/20 space-y-2.5">
                <div className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-amber-600" />
                  <span>Cấu Hình API Key Riêng Cho Cố Vấn Này</span>
                </div>
                <p className="text-[11px] text-neutral-500">
                  Bạn có thể chọn một API Key đã lưu trong Kho hoặc dán Key AI riêng biệt để cố vấn này chạy độc lập.
                </p>

                <div className="space-y-2">
                  <div>
                    <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                      Nguồn API Key:
                    </span>
                    <select
                      value={editingMember.apiKeyId || 'default'}
                      onChange={(e) => setEditingMember({ ...editingMember, apiKeyId: e.target.value })}
                      className="w-full rounded-md border border-neutral-200 dark:border-neutral-700 p-1.5 text-xs bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    >
                      <option value="default">Dùng API Key mặc định của ứng dụng</option>
                      {apiKeys.map((k) => (
                        <option key={k.id} value={k.id}>
                          Dùng Key từ Kho: {k.label} ({k.key ? k.key.slice(0, 6) + '...' : 'Built-in'})
                        </option>
                      ))}
                      <option value="custom">Nhập Key riêng trực tiếp bên dưới</option>
                    </select>
                  </div>

                  {editingMember.apiKeyId === 'custom' && (
                    <div>
                      <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                        Dán API Key riêng của cố vấn:
                      </span>
                      <input
                        type="password"
                        placeholder="sk-... hoặc AIzaSy..."
                        value={editingMember.customApiKey || ''}
                        onChange={(e) => setEditingMember({ ...editingMember, customApiKey: e.target.value })}
                        className="w-full rounded-md border border-neutral-200 dark:border-neutral-700 p-1.5 font-mono text-xs bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      />
                    </div>
                  )}

                  <div>
                    <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                      Mô hình AI gán cho cố vấn:
                    </span>
                    <select
                      value={editingMember.customModel || 'gemini-3.8-flash'}
                      onChange={(e) => setEditingMember({ ...editingMember, customModel: e.target.value })}
                      className="w-full rounded-md border border-neutral-200 dark:border-neutral-700 p-1.5 text-xs bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono"
                    >
                      <option value="gemini-3.8-flash">gemini-3.8-flash (Tốc độ, phản hồi sắc bén)</option>
                      <option value="gemini-4-argon">gemini-4-argon (Tư duy sâu sắc, phân tích văn học cao cấp)</option>
                      <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Siêu nhẹ)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Main Chat Permission Toggle */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40">
                <input
                  type="checkbox"
                  id="canViewChatCheck"
                  checked={editingMember.canViewMainChat !== false}
                  onChange={(e) => setEditingMember({ ...editingMember, canViewMainChat: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 mt-0.5"
                />
                <label htmlFor="canViewChatCheck" className="cursor-pointer">
                  <div className="font-semibold text-neutral-900 dark:text-white">
                    Cho Phép Xem Toàn Bộ Cuộc Trò Chuyện & Nội Dung Chính
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    Cố vấn sẽ đọc toàn bộ diễn biến các tin nhắn roleplay hoặc nội dung chương đang viết để đưa ra lời giải đáp và phản hồi chính xác nhất.
                  </div>
                </label>
              </div>

              {/* System Prompt */}
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  System Prompt (Chỉ dẫn hành vi, nhiệm vụ & tính cách)
                </label>
                <textarea
                  rows={5}
                  value={editingMember.systemPrompt}
                  onChange={(e) => setEditingMember({ ...editingMember, systemPrompt: e.target.value })}
                  className="w-full rounded-md border border-neutral-200 dark:border-neutral-700 p-2.5 font-mono text-xs text-neutral-900 dark:text-white bg-white dark:bg-neutral-800 leading-relaxed"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                onClick={() => setEditingMember(null)}
                className="rounded-lg border border-neutral-200 dark:border-neutral-700 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300"
              >
                Hủy
              </button>
              <button
                onClick={() => handleSaveMember(editingMember)}
                className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
