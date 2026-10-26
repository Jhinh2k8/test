import { Language } from '../types';

export const I18N = {
  vi: {
    appTitle: 'NovelCraft Studio',
    appSubtitle: 'Sáng tác văn học, nhập vai & Modding an toàn',
    navWriting: 'Bàn Viết & Sáng Tác',
    navCouncil: 'Hội Đồng AI',
    navPlugins: 'Quản Lý Plugin (Mod)',
    navKeys: 'Quản Lý API Key',
    navDevLab: 'Phòng Thử Nghiệm Dev',
    navImport: 'Nạp Script / File',
    
    // Writing Canvas
    novelMode: 'Viết Tiểu Thuyết',
    roleplayMode: 'Nhập Vai (Roleplay)',
    newChapter: 'Chương Mới',
    synopsis: 'Tóm tắt / Bối cảnh',
    wordCount: 'Số từ',
    readingTime: 'phút đọc',
    searchGrounding: 'Tìm kiếm Web (Google Search)',
    searchGroundingDesc: 'Tự động tra cứu thông tin và kiến thức mới trên Internet',
    generateNext: 'Viết Tiếp Diễn Biến',
    consultCouncil: 'Hỏi Hội Đồng AI',
    exportOptions: 'Xuất Tác Phẩm',
    exportMd: 'Xuất file Markdown',
    exportTxt: 'Xuất file TXT',
    exportJson: 'Sao lưu JSON',
    
    // Roleplay
    characterName: 'Nhân vật của bạn',
    narrator: 'Người Kể Chuyện',
    sendAction: 'Gửi Hành Động / Lời Thoại',
    inputPlaceholder: 'Nhập hành động (trong dấu *hành động*) hoặc lời thoại nhân vật...',
    
    // AI Council
    councilTitle: 'Hội Đồng AI Cố Vấn (AI Council)',
    councilDesc: 'Đa góc nhìn phản biện, phát triển ý tưởng và gỡ nút thắt cốt truyện.',
    customizePrompt: 'Tùy biến Prompt',
    addMember: 'Thêm Thành Viên Mới',
    runCouncilPrompt: 'Hội Đồng Đánh Giá',
    
    // Plugins
    pluginTitle: 'Trung Tâm Plugin & Mod (Game Modding Engine)',
    pluginDesc: 'Cài đặt mod mở rộng tính năng với màng bọc an toàn tự động kick mod khi phát sinh lỗi.',
    installPlugin: 'Cài Đặt Mod Mới',
    pluginStatusActive: 'Đang Chạy',
    pluginStatusDisabled: 'Đã Tắt',
    pluginStatusRejected: 'Bị Từ Chối (Lỗi Khởi Động)',
    pluginStatusCrashed: 'Đã Bị Kick (Lỗi Runtime)',
    diagnosticReport: 'Báo Cáo Lỗi Chẩn Đoán',
    retestAndMount: 'Kiểm Tra & Nạp Lại Mod',
    editCode: 'Sửa Mã Nguồn',
    
    // API Keys
    keyManagerTitle: 'Trình Quản Lý API Key & Tham Số',
    keyManagerDesc: 'Lưu trữ nhiều key, kiểm tra kết nối mạng và tùy chỉnh độ dài token, nhiệt độ sáng tạo.',
    addKey: 'Thêm API Key',
    pingTest: 'Kiểm Tra Kết Nối',
    tuningTitle: 'Tham Số Sinh & Phong Cách Văn Phong',
    maxTokens: 'Giới Hạn Token Tối Đa',
    temperature: 'Độ Sáng Tạo (Temperature)',
    styleNovel: 'Tiểu thuyết Văn học',
    styleScifi: 'Khoa học Viễn tưởng',
    styleFantasy: 'Kỳ ảo / Kiếm hiệp',
    styleRpg: 'Hội thoại Nhập vai RPG',
    styleRomance: 'Lãng mạn / Tâm lý',
    
    // Dev Lab
    devLabTitle: 'Phòng Thí Nghiệm Nhà Phát Triển (Dev Testing Lab)',
    devLabDesc: 'Khu vực thử nghiệm code plugin, giả lập crash và kiểm tra log thô dành riêng cho bạn.',
    testSnippet: 'Chạy Thử Đoạn Mã Sandbox',
    simulateCrash: 'Giả Lập Crash (Thử Nghiệm Tự Ngắt)',
    rawInspector: 'Thanh Tra Dữ Liệu Thô & Token',
    
    // Common
    save: 'Lưu',
    cancel: 'Hủy',
    close: 'Đóng',
    active: 'Đang chọn',
    switchLang: 'Language',
  },
  en: {
    appTitle: 'NovelCraft Studio',
    appSubtitle: 'Story Writing, Roleplay & Safe Modding Engine',
    navWriting: 'Writing Workspace',
    navCouncil: 'AI Council',
    navPlugins: 'Plugin (Mod) Manager',
    navKeys: 'API Key Vault',
    navDevLab: 'Developer Lab',
    navImport: 'Import Script / File',
    
    // Writing Canvas
    novelMode: 'Novel Prose',
    roleplayMode: 'Roleplay (Text RPG)',
    newChapter: 'New Chapter',
    synopsis: 'Synopsis / Setting',
    wordCount: 'words',
    readingTime: 'min read',
    searchGrounding: 'Web Search (Google Search)',
    searchGroundingDesc: 'Automatically search real-time web knowledge and world facts',
    generateNext: 'Generate Continue',
    consultCouncil: 'Consult AI Council',
    exportOptions: 'Export Manuscript',
    exportMd: 'Export Markdown',
    exportTxt: 'Export Plain Text',
    exportJson: 'Backup JSON',
    
    // Roleplay
    characterName: 'Your Character',
    narrator: 'Narrator',
    sendAction: 'Send Action / Dialog',
    inputPlaceholder: 'Enter your action (in *asterisks*) or character speech...',
    
    // AI Council
    councilTitle: 'AI Advisory Council',
    councilDesc: 'Multi-perspective critiques, plot twists, and character consistency.',
    customizePrompt: 'Customize Prompt',
    addMember: 'Add Council Member',
    runCouncilPrompt: 'Council Deliberation',
    
    // Plugins
    pluginTitle: 'Modding & Plugin Engine',
    pluginDesc: 'Install mod extensions with game-like fail-safe auto-kick guardian.',
    installPlugin: 'Install New Mod',
    pluginStatusActive: 'Active',
    pluginStatusDisabled: 'Disabled',
    pluginStatusRejected: 'Rejected (Preflight Error)',
    pluginStatusCrashed: 'Kicked Out (Runtime Error)',
    diagnosticReport: 'Crash Diagnostics Report',
    retestAndMount: 'Re-test & Mount Mod',
    editCode: 'Edit Mod Code',
    
    // API Keys
    keyManagerTitle: 'API Key Vault & Tuning',
    keyManagerDesc: 'Manage multiple keys, ping latency test, and adjust tokens & temperature.',
    addKey: 'Add API Key',
    pingTest: 'Ping Test',
    tuningTitle: 'Generation & Style Tuning',
    maxTokens: 'Max Output Tokens',
    temperature: 'Temperature (Creativity)',
    styleNovel: 'Literary Prose',
    styleScifi: 'Hard Sci-Fi',
    styleFantasy: 'Epic Fantasy',
    styleRpg: 'RPG Script / Dialog',
    styleRomance: 'Romance / Drama',
    
    // Dev Lab
    devLabTitle: 'Developer & Testing Lab',
    devLabDesc: 'Dedicated playground to test plugin snippets, simulate crashes, and inspect raw logs.',
    testSnippet: 'Run Sandbox Code Snippet',
    simulateCrash: 'Simulate Crash (Test Auto-Kick)',
    rawInspector: 'Raw Prompt & Token Inspector',
    
    // Common
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    active: 'Active',
    switchLang: 'Ngôn ngữ',
  },
};
