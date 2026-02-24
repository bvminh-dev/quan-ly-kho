# Quản lý lịch sử xuất nhập kho

Dưới đây là schema của BE:
``
Schema cho nhập kho `history-enter` gồm các field:
- warehouseId: objectId, ref: warehouse
- item: Lưu dư thừa từ schema warehouse
- inches: Lưu dư thừa từ schema warehouse
- quality: Lưu dư thừa từ schema warehouse
- style: Lưu dư thừa từ schema warehouse
- color: Lưu dư thừa từ schema warehouse
- type: string, các giá trị bao gồm: Tạo mới, nhập thêm hàng, hoàn đơn, sửa giá, xóa
- metadata: object, để lưu thông tin liên quan đến lần thay đổi đó
  - Khi type = tạo mới, metadata gồm thông tin:
    - totalAmount: number // tổng số lượng
    - priceHigh: number // giá cao
    - priceLow: number // giá thấp
    - sale: number // giảm giá
  - Khi type = nhâp thêm hàng, metadata gồm thông tin:
    - quantity: number // số lượng nhập thêm
  - Khi type = hoàn đơn, metadata gồm thông tin:
    - quantityRevert: number // số lượng hoàn đơn
    - orderId: objectId, ref: order // Id đơn hàng bị hoàn
  - khi type = sửa giá, metadata gồm:
    - priceHighNew: number // giá cao mới
    - priceHighOld: number // giá cao cũ
    - priceLowNew: number // giá thấp mới
    - priceLowOld: number // giá thấp cũ
    - saleNew: number // sale mới
    - saleOld: number // sale cũ
- note?: string // ghi chú
```

```
Schema cho xuất kho `history-export` gồm các field:
- warehouseId: objectId, ref: warehouse
- item: Lưu dư thừa từ schema warehouse
- inches: Lưu dư thừa từ schema warehouse
- quality: Lưu dư thừa từ schema warehouse
- style: Lưu dư thừa từ schema warehouse
- color: Lưu dư thừa từ schema warehouse
- priceHigh: number // giá cao, Lưu dư thừa từ schema warehouse
- priceLow: number // giá thấp, Lưu dư thừa từ schema warehouse
- sale: number // giảm giá, Lưu dư thừa từ schema warehouse
- orderId: objectId, ref: order // Id đơn hàng
- type: string // loại đơn theo giá cao hoặc giá thấp với 1 trong các giá trị sau: cao, thấp, lưu dư thừa từ schema order
- priceOrder: number // giá bán của đơn hàng lúc đó
- saleOrder: number // giá sale của đơn hàng lúc đó
- quantityOrder: number // tổng số lượng bán của đơn hàng lúc đó
- stateOrder: string // là một trong các giá trị sau: Khách trả | hoàn đơn
- paymentOrder: number // Số tiền khách vừa trả (giá trị dương), số tiền vừa hoàn đơn (giá trị âm)
- note?: string // ghi chú
```