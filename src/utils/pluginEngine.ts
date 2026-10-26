import { PluginMod, PluginErrorReport } from '../types';

/**
 * Pre-flight Sandbox Test: Runs dry-run evaluation on plugin code before allowing it to mount.
 * If it has syntax errors, runtime initialization errors, or missing hooks:
 * It KICKS the plugin out immediately and returns an error report.
 */
export function testPluginPreflight(code: string): { ok: boolean; error?: PluginErrorReport } {
  try {
    // 1. Syntax check and construction
    const pluginFactory = new Function('context', `
      "use strict";
      try {
        ${code}
      } catch (e) {
        throw e;
      }
    `);

    // 2. Dry-run invocation with mock context
    const mockContext = {
      api: { ping: () => true },
      story: { title: 'Test Novel', currentText: 'Mock content for preflight test' },
      registerWidget: () => {},
      registerHook: () => {},
    };

    const instance = pluginFactory(mockContext);

    // If returned an instance, verify basic contract
    if (instance && typeof instance === 'object') {
      if (instance.init && typeof instance.init === 'function') {
        instance.init();
      }
    }

    return { ok: true };
  } catch (err: any) {
    const errorMsg = err.message || 'Lỗi không xác định khi chạy thử nghiệm Sandbox';
    const stack = err.stack || '';
    
    // Attempt to extract line number from stack
    const match = stack.match(/<anonymous>:(\d+):(\d+)/) || stack.match(/Function:(\d+):(\d+)/);
    const line = match ? parseInt(match[1], 10) : undefined;

    return {
      ok: false,
      error: {
        message: errorMsg,
        stack,
        line,
        phase: 'preflight',
        timestamp: new Date().toLocaleTimeString('vi-VN'),
      },
    };
  }
}

/**
 * Runtime Hot-Kick Guardian: Safely executes a plugin hook.
 * If the plugin suddenly throws an error during user interaction,
 * it instantly KICKS the plugin out (disables it) and reports the crash.
 */
export function executePluginSafely<T>(
  plugin: PluginMod,
  action: () => T,
  onKickOut: (pluginId: string, report: PluginErrorReport) => void
): T | null {
  try {
    return action();
  } catch (err: any) {
    const report: PluginErrorReport = {
      message: err.message || 'Lỗi bất ngờ phát sinh trong quá trình chạy plugin',
      stack: err.stack,
      phase: 'runtime',
      timestamp: new Date().toLocaleTimeString('vi-VN'),
    };

    // Instantly kick plugin out
    onKickOut(plugin.id, report);
    return null;
  }
}

/**
 * Default pre-installed mod collection
 */
export const DEFAULT_PLUGINS: PluginMod[] = [
  {
    id: 'dice_roller_rpg',
    name: 'Xúc Xắc RPG Đa Diện (Dice Roller d20/d100)',
    version: '1.2.0',
    author: 'NovelCraft Team',
    category: 'rpg',
    description: 'Bàn tung xúc xắc RPG d4, d6, d8, d10, d12, d20, d100 có tính điểm chí mạng cho các cảnh chiến đấu và nhập vai.',
    status: 'active',
    code: `// Plugin: Xúc Xắc RPG
return {
  name: "Bàn Tung Xúc Xắc RPG",
  roll: function(sides) {
    var result = Math.floor(Math.random() * sides) + 1;
    var note = "";
    if (sides === 20) {
      if (result === 20) note = " (ĐẠI THÀNH CÔNG - CRITICAL!)";
      else if (result === 1) note = " (ĐẠI THẤT BẠI - FUMBLE!)";
    }
    return { sides: sides, result: result, note: note };
  }
};`,
  },
  {
    id: 'character_stat_sheet',
    name: 'Thẻ Chỉ Số & Trạng Thái Nhân Vật',
    version: '1.0.4',
    author: 'Roleplay Studio',
    category: 'widget',
    description: 'Bảng theo dõi nhanh máu (HP), năng lượng (MP/Mana), cấp độ và trang bị của nhân vật trong phiên nhập vai.',
    status: 'active',
    code: `// Plugin: Character Stats
return {
  name: "Hồ Sơ Nhân Vật",
  calculatePower: function(hp, mp, atk) {
    return (hp * 0.4) + (mp * 0.3) + (atk * 2.5);
  }
};`,
  },
  {
    id: 'word_speed_analytics',
    name: 'Phân Tích Tốc Độ Đọc & Nhịp Văn',
    version: '2.1.0',
    author: 'Literary Tools',
    category: 'tool',
    description: 'Đo lường thời gian đọc dự kiến, độ phức tạp của câu và nhịp điệu của chương truyện đang viết.',
    status: 'active',
    code: `// Plugin: Word & Readability Analytics
return {
  analyze: function(text) {
    if (!text) return { words: 0, readMins: 0, sentences: 0 };
    var words = text.trim().split(/\\s+/).filter(Boolean).length;
    var sentences = text.split(/[.!?]+/).filter(Boolean).length;
    var readMins = Math.ceil(words / 220); // 220 wpm
    return {
      words: words,
      readMins: readMins,
      sentences: sentences,
      avgWordPerSentence: sentences > 0 ? (words / sentences).toFixed(1) : 0
    };
  }
};`,
  },
  {
    id: 'lore_name_generator',
    name: 'Bộ Sinh Tên & Địa Danh Giả Tưởng',
    version: '1.1.0',
    author: 'Worldforge',
    category: 'tool',
    description: 'Tạo nhanh tên nhân vật phong cách Tiên hiệp, Kỳ ảo phương Tây hoặc Sci-Fi cùng các bảo vật và địa danh huyền bí.',
    status: 'active',
    code: `// Plugin: Name & Lore Generator
return {
  generateName: function(type) {
    var xianxia = ["Vân Thiên", "Tiêu Lạc", "Dạ Mặc", "Hàn Lập", "Bạch Thiển", "Sở Phong"];
    var fantasy = ["Aethelgard", "Vespera", "Kaelen", "Morrigan", "Sylas", "Elowen"];
    var scifi = ["Nova-9", "Aero Vance", "Cortex-Z", "Orion Stark", "Vega Prime"];
    var pool = type === "scifi" ? scifi : (type === "fantasy" ? fantasy : xianxia);
    return pool[Math.floor(Math.random() * pool.length)];
  }
};`,
  },
  {
    id: 'rpg_inventory_ui',
    name: 'Túi Đồ & Trang Bị Nhân Vật (UI Widget)',
    version: '1.3.0',
    author: 'RPG Studio',
    category: 'widget',
    description: 'Plugin giao diện tương tác: Hiển thị túi đồ RPG 4 ô vật phẩm (Bình máu, Linh thạch, Bùa chú, Kiếm gỗ) có nút bấm sử dụng trực tiếp.',
    status: 'active',
    code: `// Plugin: UI RPG Inventory Widget
return {
  name: "Túi Đồ & Vật Phẩm",
  getItems: function() {
    return [
      { id: 1, name: "Bình Hồi Phục", icon: "🧪", desc: "Hồi +25 HP", count: 3 },
      { id: 2, name: "Linh Thạch", icon: "💎", desc: "Tăng +15 Mana", count: 8 },
      { id: 3, name: "Bùa Dịch Chuyển", icon: "📜", desc: "Thoát hiểm khẩn cấp", count: 1 },
      { id: 4, name: "Cổ Kiếm Gỗ", icon: "🗡️", desc: "Vật gia truyền", count: 1 }
    ];
  },
  useItem: function(itemId) {
    return { success: true, message: "Đã sử dụng vật phẩm thành công!" };
  }
};`,
  },
  {
    id: 'cyberpunk_neon_theme',
    name: 'Giao Diện Neon Kỳ Ảo (UI Theme Mod)',
    version: '1.0.1',
    author: 'Visual Crafter',
    category: 'ui_theme',
    description: 'Plugin mod đổi giao diện (UI Theme): Thêm viền ánh sáng Neon huyền bí, đổ bóng dạ quang và thanh trạng thái phong cách Sci-Fi.',
    status: 'disabled',
    customCss: `
      /* Scoped Cyberpunk Neon UI Theme Injected by Plugin */
      .novelcraft-theme-mod {
        border-color: #6366f1 !important;
        box-shadow: 0 0 15px rgba(99, 102, 241, 0.25) !important;
      }
    `,
    code: `// Plugin: UI Theme Mod
return {
  name: "Neon Glow Theme",
  themeColor: "#6366f1",
  accentGlow: "0 0 12px rgba(99, 102, 241, 0.4)",
  applyEffect: function() {
    return "Đã áp dụng hiệu ứng viền Neon dạ quang cho giao diện studio.";
  }
};`,
  },
  {
    id: 'demo_bad_script',
    name: 'Plugin Giả Lập Lỗi (Demo Hot-Kick Test)',
    version: '0.9.0',
    author: 'Testing Lab',
    category: 'tool',
    description: 'Plugin chứa lỗi mẫu để bạn kiểm tra tính năng Hot-Kick và xem hệ thống bắt lỗi tự động mà không làm sập ứng dụng.',
    status: 'disabled',
    code: `// Plugin Demo: Chứa lỗi Null Pointer có chủ đích
return {
  testCrash: function() {
    var undefinedObj = null;
    return undefinedObj.willCauseCrash(); // Ném lỗi runtime để test Auto-Kick
  }
};`,
  },
];
