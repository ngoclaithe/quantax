# Backend Plan – Binary Option DEX (NestJS)

> Mục tiêu: xây dựng backend cho Binary Option DEX (có copy trade), chuẩn **SOLID**, **scalable**, dễ mở rộng, phù hợp production.

---

## 1. Tech Stack

* **Framework**: NestJS
* **Language**: TypeScript
* **API**: REST + WebSocket
* **DB**: PostgreSQL (primary), Redis (cache / realtime)
* **ORM**: Prisma (hoặc TypeORM)
* **Auth**:

  * User: Wallet-based (signature)
  * Admin: JWT + 2FA
* **Message / Realtime**: Redis PubSub / Socket.IO
* **Blockchain**: EVM-compatible
* **Oracle**: External price feed + on-chain verification

---

## 2. High-level Architecture

```
Client (Next.js)
   │
   ├── REST API
   ├── WebSocket (price, order, copy trade)
   │
NestJS API Gateway
   │
   ├── Domain Modules
   │
   ├── Application Layer (Use cases)
   │
   ├── Infrastructure Layer
   │     ├── DB
   │     ├── Cache
   │     ├── Blockchain
   │     └── Oracle
   │
PostgreSQL / Redis / Blockchain
```

Tuân theo **Clean Architecture + SOLID**:

* Controller: chỉ nhận/trả dữ liệu
* Service: orchestration
* Domain: business logic thuần
* Infrastructure: triển khai kỹ thuật

---

## 3. Module Breakdown (Domain-driven)

### 3.1 Auth Module

**Responsibility**

* Wallet authentication (user)
* Admin authentication

**Components**

* `AuthController`
* `AuthService`
* `WalletAuthService`
* `AdminAuthService`

**SOLID**

* SRP: User auth và Admin auth tách service
* DIP: Controller phụ thuộc interface `IAuthService`

---

### 3.2 User Module

**Responsibility**

* User profile
* Public trading stats

**Entities**

* User
* UserStats

**Services**

* `UserService`
* `UserStatsService`

---

### 3.3 Trading Module (Binary Option Core)

**Responsibility**

* Đặt lệnh Binary Option
* Settle lệnh

**Entities**

* TradeOrder
* TradeResult

**Services**

* `TradeCommandService` (create order)
* `TradeSettlementService`

**Interfaces**

* `IPriceFeed`
* `ISettlementEngine`

**SOLID**

* OCP: thêm kiểu settlement khác không sửa logic cũ

---

### 3.4 Copy Trade Module

**Responsibility**

* Theo dõi trader
* Tạo lệnh copy

**Entities**

* CopyTrader
* CopyFollower
* CopyRule

**Services**

* `CopyTradeService`
* `CopyExecutionService`

**Flow**

1. Trader mở lệnh
2. Emit event
3. CopyExecutionService tạo lệnh follower

---

### 3.5 Wallet Module

**Responsibility**

* Balance
* Lock / unlock khi đặt lệnh

**Services**

* `WalletService`
* `BalanceLockService`

---

### 3.6 Oracle Module

**Responsibility**

* Lấy giá
* Validate độ trễ

**Interfaces**

* `IOracleProvider`

**Implementations**

* `ChainlinkOracle`
* `InternalOracle`

---

### 3.7 Risk Module

**Responsibility**

* Kiểm soát rủi ro platform

**Rules**

* Max exposure theo pair
* Copy trade limit

**Services**

* `RiskAssessmentService`
* `ExposureService`

---

### 3.8 Admin Module

**Responsibility**

* Dashboard
* Config
* Pause system

**Services**

* `AdminConfigService`
* `AdminMonitoringService`

---

## 4. Folder Structure (Proposed)

```
src/
├── modules/
│   ├── auth/
│   ├── user/
│   ├── trading/
│   ├── copy-trade/
│   ├── wallet/
│   ├── oracle/
│   ├── risk/
│   └── admin/
│
├── common/
│   ├── decorators/
│   ├── guards/
│   ├── interceptors/
│   ├── filters/
│   └── interfaces/
│
├── infrastructure/
│   ├── database/
│   ├── redis/
│   ├── blockchain/
│   └── oracle/
│
├── events/
│   ├── trade.events.ts
│   └── copy.events.ts
│
└── main.ts
```

---

## 5. Event-driven Design

* Dùng Domain Events:

  * `TradeCreatedEvent`
  * `TradeSettledEvent`
  * `CopyTradeTriggeredEvent`

Lợi ích:

* Loose coupling
* Scale sang microservice dễ

---

## 6. SOLID Mapping

* **S**: mỗi service 1 trách nhiệm
* **O**: interface cho Oracle, Settlement
* **L**: các implementation thay thế được
* **I**: interface nhỏ, rõ
* **D**: inject abstraction, không inject class cụ thể

---

## 7. Scaling Strategy

* WebSocket scale bằng Redis adapter
* Oracle cache Redis
* Trade settlement async
* Tách service khi cần:

  * Trading Engine
  * Copy Trade Engine

---

## 8. Security

* Rate limit
* Signature verify
* Admin audit log
* Pause trading khi bất thường

---

## 9. ERD (Entity Relationship Diagram)

### 9.1 User & Auth

**User**

* id (uuid, pk)
* wallet_address (varchar, unique)
* nickname
* avatar_url
* is_public (boolean)
* created_at

**UserStats**

* user_id (fk -> User.id)
* total_trades
* win_trades
* lose_trades
* total_pnl
* win_rate

---

### 9.2 Wallet & Balance

**Wallet**

* id (uuid, pk)
* user_id (fk)
* balance
* locked_balance
* updated_at

**WalletTransaction**

* id
* wallet_id (fk)
* type (DEPOSIT | WITHDRAW | LOCK | UNLOCK | SETTLE)
* amount
* tx_hash
* created_at

---

### 9.3 Trading (Binary Option)

**TradeOrder**

* id
* user_id (fk)
* pair (BTC/USD)
* direction (UP | DOWN)
* amount
* payout_rate
* entry_price
* open_time
* expire_time
* status (PENDING | LOCKED | SETTLED)

**TradeResult**

* trade_id (fk)
* settle_price
* result (WIN | LOSE)
* profit
* settled_at

---

### 9.4 Copy Trade

**CopyTrader**

* user_id (fk)
* is_enabled
* risk_score
* created_at

**CopyFollower**

* id
* trader_id (fk -> User.id)
* follower_id (fk -> User.id)
* copy_type (FIXED | PERCENT)
* copy_value
* max_amount
* stop_loss
* is_active

**CopyTradeOrder**

* id
* source_trade_id (fk -> TradeOrder.id)
* follower_trade_id (fk -> TradeOrder.id)

---

### 9.5 Pair & Payout

**TradingPair**

* id
* symbol
* payout_rate
* is_active

---

### 9.6 Oracle & Price Feed

**PriceFeedLog**

* id
* pair
* price
* source
* created_at

---

### 9.7 Admin & Audit

**AdminUser**

* id
* email
* role
* password_hash
* created_at

**AdminLog**

* id
* admin_id (fk)
* action
* metadata
* created_at

================================================================

## 10. API SPEC (REST + WebSocket)

### 10.1 Auth

**POST /auth/wallet/login**

* body: { walletAddress, signature }
* response: { accessToken }

**POST /auth/admin/login**

* body: { email, password, otp }

---

### 10.2 User

**GET /users/me**

* response: User + UserStats

**GET /users/:id/public-profile**

---

### 10.3 Trading

**POST /trades**

* body: { pair, direction, amount, timeframe }

**GET /trades/my**

* query: status, from, to

**GET /trades/:id**

---

### 10.4 Copy Trade

**GET /copy-trade/traders**

**POST /copy-trade/follow**

* body: { traderId, copyType, value, maxAmount }

**POST /copy-trade/unfollow**

---

### 10.5 Wallet

**GET /wallet**

**GET /wallet/transactions**

---

### 10.6 Admin

**GET /admin/dashboard**

**GET /admin/trades**

**POST /admin/pairs**

**POST /admin/system/pause**

---

### 10.7 WebSocket Events

* price:update
* trade:created
* trade:settled
* copy:executed

================================================================

## 11. Next Steps

* Implement schema (Prisma)
* Viết contract settlement
* Load test copy trade
