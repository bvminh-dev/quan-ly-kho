# Quản lý đơn hàng

## Trạng thái đơn hàng

- Khi báo giá xong, ngươi dùng ghi nhận thanh toán thì update api đã chốt, sau đó mới ghi nhận thanh toán.

## Số tiền ghi nhận thanh toán:

- Người dùng nhập số tiền NGN, input tiền USD hãy disable không cho nhập cho tôi.

## Không được sửa đơn hàng khi trạng thái là Hoàn tác

- Khi đơn hàng ở trạng thái `Hoàn tác` thì button chỉnh sửa, Hoàn đơn, Ghi nhận thanh toán bị disable

## Danh sách đơn hàng với số tiền hiểu như sau:

- totalPrice: number // tổng giá trị đơn hàng theo đơn vị ₦ (NGN)
- payment: number // số tiền khách trả thừa, trả thiếu, với giá

## Bổ sung

- Trạng thái đơn hàng có thêm trạng thái `Đã xong`. Thì button chỉnh sửa, Hoàn đơn, Ghi nhận thanh toán bị disable

- Disable hoàn đơn khi số tiền khách hàng đã trả > 0

# Tài liệu bussiness cho khách hàng, đơn hàng, kho ở phía BE:

```
### Schema `customer` gồm:
- name: string, unique // tên khách
- payment: number // tổng tiền của khách có thể nợ hoặc chuyển thừa tiền. Với giá trị âm nghĩa là khách nợ, giá trị dương nghĩa là khách đang trả tiền thừa (đơn giá USD)
- note: string
- createdBy: objectId, ref: user
- updatedBy: objectId, ref: user
- createdAt: datetime
- updatedAt: datetime
- isDeleted: bool
- deleteBy: ObjectId, ref: user

### Schema `warehouse` gồm
- inches: number // là 1 strong các giá trị: 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30
- item: string // là 1 trong các giá trị: CLOSURE, FRONTAL, WEFT
- quality: string // là 1 trong các giá trị: SDD, DD, VIP, SINGLEDONOR, 2X4, 2X4 SINGLEDONOR, 2X6, 2X6 SINGLEDONOR, 5X5, 5X5 HD, 5X5 SINGLEDONOR, 5X5 SINGLEDONOR HD, 13X4, 13X4 HD, 13X6, 13X6 HD
- style: string // là 1 trong các giá trị: BONESTRAIGHT, BONESTRAIGHT LỖI, BOUNCE, EGG LỖI, EGGCURLS
- color: string // là 1 trong các giá trị: NATURAL, BROWN COPPER, BURGUNDY, GREY, PIANO RED, BURGUNDYN, BROWN TIP, BROWN CŨ, BROWN LẪN
- totalAmount: number // tổng số lượng
- amountOccupied: number // tổng số lượng chiếm dụng
- amountAviable: number // tổng số lượng khả dụng
- unitOfCalculation: string // đơn vị tính, là 1 trong các giá trị: Kg hoặc Pcs
- priceHigh: number // giá cao
- priceLow: number // giá thấp
- sale: number // giảm giá
- createdBy: objectId, ref: user
- updatedBy: objectId, ref: user
- createdAt: datetime
- updatedAt: datetime
- isDeleted: bool
- deleteBy: ObjectId, ref: user


### Schema `order` gồm:
- type: string // loại đơn theo giá cao hoặc giá thấp với 1 trong các giá trị sau: cao, thấp
- state: string // trạng thái đơn hàng gồm các giá trị sau:
  + Báo giá: đơn hàng vừa được tạo, chưa xác nhận với khách, có thể chỉnh sửa tự do
  + Đã chốt: khách đã xác nhận đơn, chỉ cho phép chỉnh sửa thông qua nghiệp vụ chuyển sang trạng thái chỉnh sửa
  + Chỉnh sửa: trạng thái tạm khi đang cập nhật lại sản phẩm/giá; sau khi lưu xong thì có thể chuyển lại sang đã chốt hoặc báo giá tùy nghiệp vụ
  + Hoàn tác: đơn hàng bị hủy/hoàn tác toàn bộ, kho được cộng trả lại (xem chi tiết phần nghiệp vụ)
  + Đã xong: đơn hàng đã thanh toán đủ, đã xuất kho xong
- exchangeRate: number // tỷ giá
- customer: objectId ref: customer
- totalPrice: number // tổng giá trị đơn hàng theo đơn vị NGN
- payment: number // số tiền khách trả thừa, trả thiếu, với giá trị âm là khách nợ, giá trị dương là khách trả thừa theo đơn vị NGN
- Debt: number // số tiền khách nợ cần trả vào hoá đơn này
- Paid: number // số tiền khách trả dư, được trừ ở hoá đơn này
- note: string // ghi chú
- products: {
  + nameSet?: string // tên set
  + priceSet?: number // giá set
  + quantitySet?: number // số lượng set
  + saleSet?: number // số tiền giả giá set
  + isCalcSet: bool // có tính theo giá set không, default = false
  + Items: {
    * id: objectId, ref: warehouse
    * quantity: number // số lượng
    * price: number // đơn giá
    * sale: number // giảm giá
    * customPrice: bool // giá có khác với giá của bản ghi được set trong kho không, default = false
    * customSale: number // giảm giá có khác với giảm giá của bản ghi được set trong kho không, default - false
  }[]
}[]
- history: {
  + type: string // là 1 trong các giá trị: hoàn tiền, khách trả
  + exchangeRate: number // tỷ giá
  + moneyPaidNGN: number // tiền theo đơn vị NGN
  + moneyPaidDolar: number // tiền theo đơn vị Dolar
  + paymentMethod: string, // giá trị là 1 trong các giá trị sau: Chuyển khoản | Tiền mặt | Thẻ | Khác
  + datePaid: date // Ngày trả
  + note?: string // ghi chú
}[]
- createdBy: objectId, ref: user
- updatedBy: objectId, ref: user
- createdAt: datetime
- updatedAt: datetime
- isDeleted: bool
- deleteBy: ObjectId, ref: user
```
