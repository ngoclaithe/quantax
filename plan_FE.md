Thiết kế prototype hoàn chỉnh cho nền tảng Binary Option DEX
(hướng Web3, on-chain settlement),
bao gồm:
1) User Trading App (feature-rich)
2) Admin Dashboard (Back Office)

MỤC TIÊU SẢN PHẨM
- Binary Option nhưng UX/feature ngang tầm trading app hiện đại
- Giữ user lâu bằng copy trade, profile, analytics
- Chuẩn để triển khai bằng Next.js + React + TypeScript + Zustand

================================================================
NGÔN NGỮ & PHONG CÁCH
================================================================
- Ngôn ngữ giao diện: Tiếng Việt
- Phong cách: Fintech / Web3 / Professional
- Dark mode chủ đạo, light mode optional
- Màu sắc:
  - Xanh lá: WIN / UP
  - Đỏ: LOSE / DOWN
  - Gradient Web3 cho điểm nhấn
- Typography: rõ ràng, ưu tiên số liệu & chart

================================================================
TECH CONTEXT (DÙNG ĐỂ THIẾT KẾ)
================================================================
- Frontend: Next.js (App Router) + React + TypeScript
- State management: Zustand (chia theo domain)
- Data fetching: React Query
- Realtime: WebSocket
- Chart: TradingView / Recharts
- Wallet: MetaMask, WalletConnect
- Blockchain: EVM-compatible
- Oracle: On-chain price feed
- Settlement: Smart contract
- Admin BO: role-based access

================================================================
PHẦN A – USER TRADING APP (ADVANCED)
================================================================

--------------------------------
A1. Landing / Onboarding
--------------------------------
- Hero:
  - Tên nền tảng
  - Tỷ lệ payout nổi bật
  - CTA: Kết nối ví / Trade ngay
- Thông số real-time:
  - Volume 24h
  - Tổng số lệnh
  - Top trader
- Giới thiệu:
  - Binary Option là gì
  - Copy trade hoạt động thế nào

--------------------------------
A2. Wallet & Account
--------------------------------
- Kết nối ví:
  - MetaMask
  - WalletConnect
- Hiển thị:
  - Address
  - Network
  - Balance
- Account overview:
  - Total PnL
  - Win rate
  - Copy trade status

--------------------------------
A3. Trading Terminal (Binary Option)
--------------------------------
- Chart giá:
  - Line / Candle
  - Timeframe linh hoạt
- Panel đặt lệnh:
  - Chọn cặp giao dịch
  - Thời gian cược
  - Số tiền
  - Payout %
  - Estimated profit
- Action:
  - UP (xanh)
  - DOWN (đỏ)
- Trạng thái lệnh:
  - Pending
  - Locked
  - Settled (Win/Lose)
- Hiển thị countdown realtime

--------------------------------
A4. Lệnh & Lịch Sử
--------------------------------
- Open orders
- Closed orders
- Filter:
  - Pair
  - Timeframe
  - Result
- Tx hash on-chain
- Chi tiết lệnh

--------------------------------
A5. Copy Trade
--------------------------------
- Danh sách trader:
  - Avatar
  - Win rate
  - ROI
  - Số follower
  - Risk score
- Trang chi tiết trader:
  - Biểu đồ hiệu suất
  - Lịch sử lệnh
  - Thống kê win/lose
- Copy settings:
  - % vốn copy
  - Max amount mỗi lệnh
  - Stop copy
- Trạng thái copy real-time

--------------------------------
A6. Leaderboard
--------------------------------
- Top trader theo:
  - ROI
  - Win rate
  - PnL
- Filter theo thời gian

--------------------------------
A7. Portfolio & Analytics
--------------------------------
- Tổng tài sản
- Biểu đồ PnL
- Phân bổ lệnh
- Thống kê theo pair / timeframe

--------------------------------
A8. Hồ Sơ Cá Nhân
--------------------------------
- Public profile:
  - Trading stats
  - Bio
- Bật / tắt cho phép copy
- Chia sẻ profile

--------------------------------
A9. Notifications
--------------------------------
- Lệnh copy thành công
- Kết quả lệnh
- Cảnh báo rủi ro

--------------------------------
A10. Settings
--------------------------------
- Slippage / Fee info
- Copy trade default
- Giao diện
- Ngôn ngữ

--------------------------------
A11. Error / Empty State
--------------------------------
- Wallet chưa kết nối
- Oracle delay
- Tx failed

================================================================
PHẦN B – ADMIN DASHBOARD (BO)
================================================================

--------------------------------
B1. Admin Login
--------------------------------
- Login + 2FA
- Security warning

--------------------------------
B2. Dashboard Tổng Quan
--------------------------------
- KPI:
  - Total Volume
  - Total Payout
  - House Profit
  - Active Traders
- Chart:
  - Win / Lose ratio
  - Volume theo pair
- Real-time alert

--------------------------------
B3. Trade & Order Monitoring
--------------------------------
- Real-time order stream
- Filter theo pair / result
- Phát hiện bất thường

--------------------------------
B4. Trader & Copy Trade Monitoring
--------------------------------
- Top trader
- Copy volume
- Risk score
- Tạm dừng copy nếu cần

--------------------------------
B5. Pair & Payout Config
--------------------------------
- Enable / Disable pair
- Điều chỉnh payout %
- Timeframe config

--------------------------------
B6. Oracle & Price Feed
--------------------------------
- Oracle status
- Update delay
- Fail alert

--------------------------------
B7. Pool & Risk Management
--------------------------------
- Pool balance
- Exposure theo pair
- Risk alert

--------------------------------
B8. Analytics & Report
--------------------------------
- User growth
- Trading behavior
- Export CSV

--------------------------------
B9. System Settings
--------------------------------
- Network
- Fee
- Maintenance mode
- Pause trading

--------------------------------
B10. Role & Permission
--------------------------------
- Admin
- Operator
- Viewer

--------------------------------
B11. Log & Audit
--------------------------------
- Admin actions
- System events

================================================================
DESIGN SYSTEM
================================================================
- Trading button (UP/DOWN)
- Chart component
- Trader card
- Copy trade modal
- Risk badge
- Toast / Notification

================================================================
UX NGUYÊN TẮC
================================================================
- Trading nhanh, ít click
- Copy trade minh bạch
- Cảnh báo rủi ro rõ ràng
- Ưu tiên real-time

================================================================
OUTPUT
================================================================
- Prototype đầy đủ User App & Admin BO
- Flow rõ ràng giữa các màn
- Sẵn sàng triển khai Next.js + React + TypeScript + Zustand
