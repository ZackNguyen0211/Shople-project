---
marp: true
paginate: true
---

# SHOOPLE

## Web App (Next.js + Supabase)

- Tên SV/nhóm: …
- Môn: Web App Development
- Ngày: 23/12/2025

<!--
Speaker notes:
- Mục tiêu: giới thiệu nhanh bài toán, kiến trúc, demo luồng chính.
-->

---

## 1) Bài toán & Mục tiêu

- Xây dựng nền tảng mua sắm nhiều shop (multi-shop)
- Người dùng: xem sản phẩm, giỏ hàng, đặt hàng
- Chủ shop: đăng ký shop, quản lý sản phẩm/đơn
- Admin: quản lý users/shops/requests

<!--
Speaker notes:
- Nêu ngắn gọn: ai dùng, họ làm gì.
-->

---

## 2) Tech Stack

- Frontend/Backend: **Next.js (App Router)**
- Database: **Supabase (Postgres)**
- Auth: **JWT trong HttpOnly cookie**
- Styling/UI: (theo project) Tailwind + components nội bộ
- Deploy: Vercel (có `vercel.json`)

<!--
Speaker notes:
- Nhấn mạnh: Next App Router cho cả UI + API routes.
-->

---

## 3) Kiến trúc tổng quan (không phải MVC cổ điển)

- **Routing theo thư mục**: `apps/web/app/**`
- UI (Views): `app/(site)/**`, `app/(auth)/**`
- API (Controller-ish): `app/api/**/route.ts`
- Logic/DB (Service-ish): `apps/web/lib/**`

<!--
Speaker notes:
- App Router: page/layout tự compose; route groups (auth)/(site) không hiện trên URL.
-->

---

## 4) Cấu trúc thư mục chính

- `apps/web/app/(site)/...` giao diện site chính
- `apps/web/app/(auth)/...` login/register
- `apps/web/app/api/...` REST-ish endpoints
- `apps/web/lib/...` auth, db, i18n, rate-limit, types
- `apps/web/middleware.ts` bảo vệ route

<!--
Speaker notes:
- Chỉ đúng những phần quan trọng cho thuyết trình.
-->

---

## 5) Auth: Login / Logout / Register

- Token: JWT lưu trong cookie (HttpOnly)
- Login: kiểm tra mật khẩu → set cookie → redirect
- Logout: clear cookie → redirect
- Register: tạo user (+ cart) → set cookie → redirect
- Register shop: tạo user SHOP + shop + request (PENDING)

<!--
Speaker notes:
- Nêu 1 câu: cookie HttpOnly giúp giảm XSS đọc token.
-->

---

## 6) Middleware: bảo vệ route

- Kiểm tra người dùng đã đăng nhập chưa dựa trên **cookie**
- Nếu chưa login và vào trang protected → redirect `/login?next=...`
- Nếu đã login mà vào `/login` `/register` → điều hướng về trang chính
- Không áp dụng cho `/api/*` (API tự handle auth riêng)

<!--
Speaker notes:
- Nhấn điểm quan trọng: middleware chạy trước page.
-->

---

## 7) Data Flow: SSR gọi DB + Client gọi API

- **Server Components (SSR)**: có thể query Supabase trực tiếp (chạy trên server)
- **Client Components** (tương tác): gọi API `/api/...`

Ví dụ:

- Home page SSR lấy batch đầu
- “Load more” trên client gọi `/api/products?skip=...&take=...`

<!--
Speaker notes:
- Giải thích vì sao “frontend gọi DB” vẫn đúng trong Server Components.
-->

---

## 8) Rate Limiting

- Có limiter in-memory theo IP + action
- Dùng cho các endpoint nhạy cảm (vd login, cart, orders...)
- Mục tiêu: giảm spam/bruteforce

<!--
Speaker notes:
- Nêu nhanh: limiter dạng Map, phù hợp demo/lab; production có thể Redis.
-->

---

## 9) i18n (Đổi ngôn ngữ)

- Source of truth: cookie `lang` (vi/en)
- UI switcher: POST `/api/lang` để set cookie
- Sau đó `router.refresh()` để Server Components render lại theo ngôn ngữ

<!--
Speaker notes:
- Nhấn: server đọc cookies() để chọn dict.
-->

---

## 10) Demo (kịch bản đề xuất)

1. Vào trang chủ → xem danh sách sản phẩm
2. Tìm kiếm/Load more (client gọi API)
3. Register/Login
4. Vào Cart/Checkout/Orders (route protected)
5. Đổi ngôn ngữ (vi/en) và thấy UI cập nhật

<!--
Speaker notes:
- Chọn demo gọn, chắc chắn chạy.
-->

---

## 11) Điểm mạnh & Trade-offs

Điểm mạnh

- App Router rõ ràng: UI + API chung một project
- SSR + API tách đúng chỗ: nhanh, đơn giản
- Middleware guard giúp UX mượt

Trade-offs

- Rate-limit in-memory: không scale đa instance
- Một số logic phân tán (SSR query DB vs API)

<!--
Speaker notes:
- Nói cân bằng: biết điểm cần cải thiện.
-->

---

# Q&A

- Cảm ơn thầy/cô và các bạn

<!--
Speaker notes:
- Chuẩn bị câu hỏi: “vì sao SSR query DB?”, “bảo mật cookie?”, “scale rate limit?”
-->
