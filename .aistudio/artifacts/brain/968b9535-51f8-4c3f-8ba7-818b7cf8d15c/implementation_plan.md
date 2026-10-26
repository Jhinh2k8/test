# NovelCraft & Roleplay Studio (Trình Viết Truyện, Nhập Vai & Hệ Thống Modding)

Ứng dụng chuyên sâu phục vụ sáng tác văn học, tiểu thuyết và nhập vai (Roleplay), sở hữu cơ chế **Modding Plugin kiểu Game Mod Loader** (kiểm thử sơ bộ trước khi nạp và tự động "kick" plugin ra ngay khi phát sinh lỗi runtime), bảng Hội đồng AI (AI Council) tùy biến prompt không giới hạn, nạp script/prompt từ file, quản lý đa API Key, tùy chỉnh sâu tham số sinh (Max tokens, Temperature, phong cách phản hồi, bộ lọc an toàn), tìm kiếm web tự động (Search Grounding), Developer Testing Lab và đóng gói PWA cho PC/APK.

---

## User Review & Critical Decisions: Cơ Chế Modding Plugin Kiểu Game

> [!IMPORTANT]
> Cơ chế Plugin đã được thiết kế chính xác theo mô hình Modding Game (như Minecraft Forge / SMAPI / Skyrim Mod Organizer):

```
                       ┌──────────────────────────────────────┐
                       │    Người dùng cài đặt / Bật Mod     │
                       └──────────────────┬───────────────────┘
                                          │
                                          ▼
                      ┌────────────────────────────────────────┐
                      │ Giai đoạn 1: Pre-Flight Sandbox Test  │
                      │ (Kiểm tra cú pháp, sandbox dry-run)   │
                      └──────────────┬──────────────────┬──────┘
                                     │                  │
                             [Phát hiện lỗi]       [Vượt qua]
                                     │                  │
                                     ▼                  ▼
                    ┌────────────────────────┐  ┌───────────────────────┐
                    │ KICK RA NGAY LẬP TỨC   │  │ NẠP VÀO GAME / APP    │
                    │ + Báo cáo dòng & lý do │  │ (Plugin hoạt động)    │
                    └────────────────────────┘  └───────────┬───────────┘
                                                            │
                                         [Bỗng nhiên phát sinh lỗi khi chạy]
                                                            │
                                                            ▼
                                                ┌───────────────────────┐
                                                │ Giai đoạn 2: Hot-Kick │
                                                │ - Tự động đá mod ra   │
                                                │ - Hiện thông báo lỗi  │
                                                │ - Giữ an toàn bài viết│
                                                └───────────────────────┘
```

1. **Giai đoạn 1: Pre-flight Sandbox Verification (Kiểm định sơ bộ)**:
   - Khi người dùng cài đặt hoặc bật một plugin/mod, hệ thống sẽ đưa code vào môi trường giả lập (Sandbox Dry-Run) để kiểm tra:
     - Tính hợp lệ của cấu trúc manifest (id, tên, version, quyền hạn).
     - Lỗi cú pháp JavaScript / JSON.
     - Hàm khởi tạo (Lifecycle Hook `init()`).
   - Nếu phát hiện lỗi: **Lập tức KICK plugin ra ngoài** (ngăn không cho bật), chuyển trạng thái sang `REJECTED/CRASHED`, và hiển thị hộp thoại báo lỗi chi tiết (dòng code bị sai, thông điệp lỗi cụ thể) kèm nút "Mở Code để Sửa".
   - Nếu an toàn: Cho phép nạp vào hệ thống chính thức.

2. **Giai đoạn 2: Live Runtime Hot-Kick Guardian (Tự động đá plugin ra khi đang chạy mà gặp lỗi)**:
   - Trong quá trình người dùng đang viết truyện hoặc nhập vai, các thao tác của plugin (vẽ UI widget, xử lý text hook, lắng nghe sự kiện, chạy lệnh macro) đều được bọc trong vòng bảo vệ `PluginWatchdog`.
   - Nếu một plugin đang chạy mà **bỗng nhiên gây lỗi** (lỗi null pointer, lặp vô tận vượt quá timeout 2000ms, bộ nhớ bất thường):
     - Hệ thống sẽ **ngay lập tức "KICK" plugin đó ra** (tự động chuyển trạng thái sang `DISABLED_CRASHED` và gỡ khỏi DOM trong 10ms).
     - Bật thông báo: *"Plugin [Tên Plugin] đã bị tự động ngắt vì phát sinh lỗi trong quá trình chạy!"*.
     - Ghi nhận chi tiết Stack Trace vào **Trung tâm Chẩn đoán Lỗi (Crash Diagnostics Center)**.
     - **Tác phẩm văn học, phiên nhập vai và dữ liệu đang viết của người dùng được bảo vệ 100% nguyên vẹn, không hề bị reload hay gián đoạn.**

---

## 1. Overview & Core Features

- **Tên ứng dụng**: **NovelCraft Studio** (hay *Roleplay & Lore Engine*).
- **Hệ thống Plugin Modding**:
  - Tải mod từ file ngoài (`.js`, `.json`).
  - Danh sách mod mẫu cài sẵn: *Xúc xắc RPG (Dice Roller d20/d100)*, *Thẻ Chỉ số Nhân vật (Character Sheet)*, *Phân tích Tốc độ Đọc & Số từ*, *Bộ Sinh Tên & Địa danh Ngẫu nhiên*.
  - Bộ công cụ sửa code trực tiếp (In-app Mod Editor) để người dùng sửa lại code bị kick và thử chạy lại ngay (Hot-Reload).
- **Hội đồng AI (AI Council) Tùy biến**:
  - Tùy biến prompt, đổi nhiệm vụ hoặc tạo vai trò mới (Kiến trúc sư Cốt truyện, Chuyên gia Nhân vật, Phê bình Văn học, Thủ thư Bối cảnh, hoặc tự tạo Kẻ phản diện...).
- **Tham số AI Chuyên sâu & Tìm kiếm Web (Search Grounding)**:
  - Tùy chỉnh Max Tokens, Temperature, Top-P, phong cách phản hồi và bộ lọc an toàn.
  - Tự động tra cứu Google Search khi cần cập nhật dữ liệu, bối cảnh thực tế hoặc sự kiện mới.
- **Quản lý Đa API Key**:
  - Lưu nhiều key, kiểm tra kết nối (Ping Test) đo tốc độ mạng thực tế.
- **Trình nạp Script & Prompt từ File**:
  - Kéo thả file `.prompt`, `.txt`, `.json` nạp nhanh thư viện kịch bản.
- **Developer / Testing Lab**:
  - Không gian thử nghiệm riêng dành cho bạn để test mod, giả lập crash và kiểm tra log thô.
- **Đóng gói PWA (PC & Android APK)**:
  - Cài đặt chạy độc lập trên máy tính (PC) hoặc cài đặt lên điện thoại Android (APK).

---

## 2. Technical Architecture & Component Structure

```
┌────────────────────────────────────────────────────────────────────────┐
│                      NovelCraft & Roleplay Studio                      │
├───────────────────────┬────────────────────────────────────────────────┤
│   Core Storage Layer  │ LocalStorage / IndexedDB (Novels, Mods, Keys)  │
├───────────────────────┼────────────────────────────────────────────────┤
│   API & Key Vault     │ Multi-Key Vault · Ping Test · Model Switcher   │
│   AI Engine Service   │ Gemini 3.8 Flash / Argon · Search Grounding    │
│                       │ Max Tokens · Temperature · Style Tuning        │
├───────────────────────┼────────────────────────────────────────────────┤
│  Dynamic AI Council   │ Customizable System Prompts · Dynamic Roles    │
├───────────────────────┼────────────────────────────────────────────────┤
│ Script & File Import  │ Drag & Drop .prompt, .json, .txt, .js scripts  │
├───────────────────────┼────────────────────────────────────────────────┤
│ Game-Mod Plugin Engine│ 1. Pre-flight Sandbox Test (Syntax & Lifecycle)│
│   (Hot-Kick Guardian) │ 2. Live Runtime Crash Watchdog (Auto-Kick)     │
│                       │ 3. Diagnostic Report & In-App Code Editor      │
├───────────────────────┼────────────────────────────────────────────────┤
│ Developer Testing Lab │ Raw Prompt Inspector · Crash Simulator · Logs  │
├───────────────────────┼────────────────────────────────────────────────┤
│ PWA & APK Packaging   │ Manifest, Offline Service Worker, Install Flow │
└───────────────────────┴────────────────────────────────────────────────┘
```

---

## 3. Implementation Steps Planned

1. **PWA & Packaging Setup**: Cấu hình `manifest.json`, icon chuẩn và service worker cho khả năng cài đặt PC & APK.
2. **Localization Engine**: Chuyển đổi ngôn ngữ Tiếng Việt & English cho toàn bộ giao diện.
3. **AI Engine với Search Grounding & Parameter Tuning**:
   - Backend endpoint `/api/ai/generate` hỗ trợ `googleSearch`, `maxOutputTokens`, `temperature`, `topP`, `systemInstruction`.
4. **API Key Vault**: Quản lý nhiều key kèm tính năng Ping Test đo độ trễ mạng thực tế.
5. **Game-Mod Plugin Engine (Safe Sandbox & Hot-Kick Guardian)**:
   - Cơ chế chạy thử nghiệm trước khi nạp (Pre-flight test).
   - Cơ chế tự động đá plugin ra khi phát sinh lỗi runtime (Live Hot-Kick).
   - Trình hiển thị báo cáo chẩn đoán lỗi kèm bộ sửa mã code trực quan (In-app Mod Code Editor).
   - 4 Plugin mẫu sẵn có (Dice Roller RPG, Character Sheet, Word Counter, Lore Generator).
6. **Dynamic AI Council Module**: Bảng Hội đồng AI tùy biến linh hoạt, cho phép sửa prompt, thêm vai trò mới.
7. **Script & Prompt File Importer**: Hỗ trợ kéo thả file `.txt`, `.json`, `.prompt`, `.js` để nạp kho prompt và lorebook.
8. **Writing & Roleplay Canvas**: Soạn thảo văn bản tập trung, tích hợp chế độ nhập vai đối thoại hai chiều, nút bật/tắt Web Search, xuất Markdown/TXT/JSON.
9. **Developer / Testing Lab**: Không gian thử nghiệm riêng biệt để bạn chạy thử plugin mới, giả lập crash và kiểm tra log dữ liệu thô.
