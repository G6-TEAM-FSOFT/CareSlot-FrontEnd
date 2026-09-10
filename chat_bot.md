# Kế Hoạch Triển Khai Floating Chatbot Widget ("Trợ Lý Care Slot")

Bản kế hoạch chi tiết xây dựng giao diện và tích hợp API cho Chatbot AI Gemini trên Frontend (ReactJS), đã được đối chiếu chuẩn xác 100% với Backend Controller `CareSlotChatController` (`/api/v1/chat`).

---

## 1. Yêu Cầu Giao Diện & Trải Nghiệm Người Dùng (UI/UX)

- **Vị trí và Giao diện Nổi (Floating Widget)**:
  - Cố định ở góc dưới cùng bên phải (`bottom-6 right-6`, `z-50`).
  - **Trạng thái đóng**: Nút tròn nổi (Floating Action Button - FAB) có icon `MessageSquare` (`lucide-react`), màu xanh y tế primary, hover scale nhẹ (`hover:scale-105`), có tooltip hoặc hiệu ứng gợi ý.
  - **Trạng thái mở**: Khung chat kích thước rộng 380px - 420px, cao 560px - 620px (trên mobile bung tràn viền responsive), bo góc 2xl (`rounded-2xl`), đổ bóng nổi bật (`shadow-2xl border border-slate-100`). Icon FAB chuyển sang dấu `X` để đóng.

- **Cấu trúc Khung Chat (Chat Window)**:
  - **Header**:
    - Avatar Trợ lý Care Slot + Tên "Trợ lý Care Slot" + Badge "Online" màu xanh lá.
    - Nút **"Tạo cuộc trò chuyện mới"** (`RefreshCw` icon) có tooltip "Đoạn chat mới".
    - Nút **Thu nhỏ / Đóng** (`X` icon).
  - **Message Area (Body)**:
    - Cuộn độc lập (`overflow-y-auto`) và tự động cuộn xuống tin nhắn mới nhất (`auto-scroll to bottom`).
    - Phân biệt rõ ràng tin nhắn 2 bên:
      - **Bot (trái)**: Avatar robot/y tế nhỏ, bubble nền xám nhạt (`bg-slate-100 text-slate-800`), chữ đen. Hỗ trợ render định dạng **Markdown** (`react-markdown`).
      - **User (phải)**: Bubble màu primary (`bg-blue-600 text-white`), chữ trắng.
    - **Typing Indicator**: Animation 3 chấm nhảy nhảy (`animate-bounce`) khi đang chờ API `/consult` phản hồi.
    - **Banner Cảnh báo Y tế**: Dòng chữ nhỏ dưới cùng khuyên bệnh nhân mang tính tham khảo y tế, không thay thế chẩn đoán chuyên sâu từ bác sĩ.
  - **Input Footer**:
    - Textarea/Input tự động co giãn 1-3 dòng (placeholder: *"Mô tả triệu chứng của bạn (ví dụ: đau đầu, sốt nhẹ...)..."*).
    - Bấm `Enter` để gửi, `Shift + Enter` để xuống dòng.
    - Nút gửi (`Send` icon) disabled khi input rỗng, đang chờ bot phản hồi (`loading`), hoặc khi bị khóa do Rate Limit.

---

## 2. Tích Hợp API Backend (`CareSlotChatController`)

Sử dụng axios instance tại `src/config/axios.js` (`baseURL: /api/v1`).

### Danh sách API Endpoints:

1. **Khởi tạo Session trò chuyện mới**:
   - `POST /chat/session/new`
   - Response: `{ code: 1000, message: "...", data: { sessionId: "uuid-string" } }`
   - Lưu `sessionId` vào `sessionStorage` (hoặc `localStorage`).

2. **Lấy Lời chào Động (Auto-Greeting)**:
   - `GET /chat/welcome`
   - Response: `{ code: 1000, data: "Xin chào [Tên bệnh nhân]! Em là Trợ lý AI Care Slot..." }`
   - Hiển thị làm tin nhắn đầu tiên nếu session chưa có lịch sử.

3. **Lấy Lịch sử Trò chuyện theo Session**:
   - `GET /chat/history?sessionId={sessionId}`
   - Response: `{ code: 1000, data: [ { role: "user" | "model", parts: [ { text: "..." } ] } ] }`
   - Map `role === "user"` -> User bubble, `role === "model"` -> Bot bubble.

4. **Gửi Tin nhắn Mô tả Triệu chứng**:
   - `POST /chat/consult?sessionId={sessionId}`
   - Body: `{ "message": "Nội dung câu hỏi của người dùng" }`
   - Response (200 OK): `{ code: 1000, data: "Chuỗi câu trả lời từ Gemini..." }`
   - Response (429 Rate Limit): `{ code: 1009, message: "Bạn đã gửi quá nhiều yêu cầu chat, vui lòng thử lại sau 1 phút" }` -> Hiển thị toast/bubble cảnh báo + Cooldown 60s.

---

## 3. Cấu Trúc Module Component (`src/components/chatbot/`)

```
src/
├── services/
│   └── chatService.js           # Service gọi 4 API chatbot
├── components/
│   └── chatbot/
│       ├── ChatWidget.jsx       # Wrapper container & state đóng/mở Widget
│       ├── ChatHeader.jsx       # Header bar + nút New Session + nút Đóng
│       ├── ChatMessageList.jsx  # Danh sách tin nhắn + Auto scroll ref
│       ├── ChatMessageItem.jsx  # Item tin nhắn + ReactMarkdown + Typing indicator
│       └── ChatInput.jsx        # Footer input + nút Send + disable/cooldown handling
```

---

## 4. Quản Lý Trạng Thái & Luồng Xử Lý (State & Flow Logic)

1. **Khi mở Widget lần đầu / Khởi chạy**:
   - Kiểm tra `sessionId` trong `sessionStorage`.
   - Nếu **chưa có**: Gọi `POST /chat/session/new` để lấy `sessionId` mới -> Gọi `GET /chat/welcome` lấy lời chào tự động -> Lưu `sessionId`.
   - Nếu **đã có**: Gọi `GET /chat/history?sessionId=...` khôi phục cuộc trò chuyện cũ.

2. **Khi bấm nút "Tạo đoạn chat mới" (New Session)**:
   - Xóa `sessionId` cũ trong `sessionStorage`.
   - Gọi `POST /chat/session/new` lấy `sessionId` mới.
   - Set danh sách tin nhắn rỗng, gọi `GET /chat/welcome` nạp lời chào mới.

3. **Khi Người dùng Gửi Tin nhắn**:
   - Append tin nhắn của User vào danh sách `messages` lập tức (UI responsive).
   - Set `isLoading = true` (hiển thị Typing Indicator).
   - Gọi `POST /chat/consult?sessionId=...` với body `{ message }`.
   - Khi BE trả về `data`: Append tin nhắn của Bot vào `messages`, set `isLoading = false`.
   - Bắt lỗi HTTP 429 (`code: 1009`): Append tin nhắn cảnh báo đỏ của hệ thống + kích hoạt đếm ngược cooldown 60s cho ô input.

---

## 5. Thư Viện Cần Thiết & Styling

- **Tailwind CSS**: Dùng utility class (`bg-blue-600`, `rounded-2xl`, `shadow-2xl`, `animate-bounce`, v.v.).
- **Lucide Icons**: `MessageSquare`, `X`, `Send`, `Bot`, `User`, `RefreshCw`, `Sparkles`.
- **Markdown Renderer**: `react-markdown` (để format văn bản in đậm, gạch đầu dòng từ Gemini).