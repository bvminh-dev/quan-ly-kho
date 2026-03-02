# Dashboard - Báo Cáo Tổng Hợp

## Schema Order (tóm tắt)

```
- exchangeRate: number
- customer: objectId ref: customer
- products: {
  + nameSet?: string
  + priceSet?: number
  + quantitySet?: number
  + saleSet?: number
  + isCalcSet: bool
  + Items: {
    * id: objectId, ref: warehouse
    * quantity: number
    * price: number
    * sale: number
    * customPrice: bool
    * customSale: number
    * unitOfCalculation: string // Kg hoặc Pcs
  }[]
}[]
- totalPrice: number // tổng giá trị đơn hàng (NGN)
- payment: number // âm = khách nợ, dương = khách trả thừa (NGN)
- Debt: number // số tiền nợ cần trả vào hoá đơn này
- Paid: number // số tiền trả dư, được trừ ở hoá đơn này
- createdBy: objectId, ref: user
- isDeleted: bool
- createdAt: datetime
```

---

## Nghiệp vụ tính toán

### Điều kiện lọc đơn hàng hợp lệ

- `isDeleted = false`
- `state` **không thuộc** `báo giá` và `hoàn tác`

### Quy đổi USD

```
Giá trị USD = totalPrice / exchangeRate
```

### Tổng thu về trong kỳ

- Duyệt `order.history`:
  - `type = 'khách trả'` → cộng `moneyPaidNGN` / `moneyPaidDolar`
  - `type = 'hoàn tiền'` → trừ `moneyPaidNGN` / `moneyPaidDolar`

### Tổng nợ khách hàng trong kỳ

```
Tổng nợ NGN = totalPrice - tổng thu về NGN
Tổng nợ USD = (totalPrice / exchangeRate) - tổng thu về USD
```

### Tổng số lượng theo đơn vị

- Duyệt `products[].items[]`:
  - `unitOfCalculation = 'Kg'` → cộng vào `totalOrdersKg`
  - `unitOfCalculation = 'Pcs'` → cộng vào `totalOrdersPcs`

---

## Các API báo cáo

**Tham số chung (query string):**

- `period`: `day` | `month` | `year`
- `date`: ISO date string (`2026-03-02` | `2026-03` | `2026`)

---

### 1. GET /dashboard/orders — Báo cáo theo đơn hàng

**Response:**

```json
{
  "totalOrdersKg": 150.5,
  "totalOrdersPcs": 30,
  "totalValueNGN": 50000000,
  "totalValueUSD": 3125.5,
  "totalCollectedNGN": 40000000,
  "totalCollectedUSD": 2500.25
}
```

---

### 2. GET /dashboard/customers — Báo cáo theo khách hàng

**Response:** Mảng, mỗi phần tử là:

```json
{
  "customerId": "...",
  "customerName": "Nguyễn Văn A",
  "totalOrdersKg": 100.5,
  "totalOrdersPcs": 20,
  "totalPaidNGN": 30000000,
  "totalPaidUSD": 1875,
  "totalDebtNGN": 10000000,
  "totalDebtUSD": 625
}
```

---

### 3. GET /dashboard/staff — Báo cáo theo nhân viên bán hàng

**Response:** Mảng, mỗi phần tử là:

```json
{
  "staffId": "...",
  "staffName": "Nguyễn Văn B",
  "totalOrdersKg": 80.5,
  "totalOrdersPcs": 10,
  "totalCustomers": 15,
  "totalValueNGN": 40000000,
  "totalValueUSD": 2500,
  "totalCollectedNGN": 32000000,
  "totalCollectedUSD": 2000
}
```
