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

### Nghiệp vụ:
- Khi tạo customer cần kiểm tra customer có trùng tên trong hệ thống với isDeleted = false không. Bất kỳ user nào trong hệ thống đều có quyền tạo customer
- Chỉ user role = admin mới có quyền xóa `customer`
- Như vậy khi tạo đơn hàng (trạng thái chỉ cần chuyển sang đã chốt thì ghi nhận khách nợ vào). Khi khách hàng trả thì tính toán lại số tiền khách nợ, khi hoàn đơn thì xoá khoản nợ của đơn hàng đó đi

## Kho hàng
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

### Nghiệp vụ
- Ai cũng có quyền thêm warehouse


## Đơn hàng

### Schema `order` gồm:
- type: string // loại đơn theo giá cao hoặc giá thấp với 1 trong các giá trị sau: cao, thấp
- state: string // trạng thái đơn hàng gồm các giá trị sau: 
  + Báo giá: đơn hàng vừa được tạo, chưa xác nhận với khách, có thể chỉnh sửa tự do
  + Đã chốt: khách đã xác nhận đơn, chỉ cho phép chỉnh sửa thông qua nghiệp vụ chuyển sang trạng thái chỉnh sửa
  + Chỉnh sửa: trạng thái tạm khi đang cập nhật lại sản phẩm/giá; sau khi lưu xong thì có thể chuyển lại sang đã chốt hoặc báo giá tùy nghiệp vụ
  + Hoàn tác: đơn hàng bị hủy/hoàn tác toàn bộ, kho được cộng trả lại (xem chi tiết phần nghiệp vụ)
  + Đã xong: đơn hàng đã thanh toán đủ, đã xuất kho xong
  + Đã giao: đơn hàng đã giao cho khách hàng (tương đương với Đã xong)
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
    * unitOfCalculation: string // đơn vị tính, là 1 trong các giá trị: Kg hoặc Pcs
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

### Nghiệp vụ
- User trong hệ thống đều có quyền tạo đơn hàng, thông tin bắt buộc gồm: Tỷ giá, khách hàng. products phải có ít nhất 1 element. Item phải điền số lượng, đơn giá, giảm giá. Khi tạo đơn hàng, state mặc định là: Báo giá. Khi tạo thành công thì tính toán số lượng của từng item rồi update lại vào bản ghi đó trong warehouse với các giá trị: Số lượng khả dụng, số lượng chiếm dụng
- Khi state chuyển sang chỉnh sửa thì tính toán lại số lượng hàng hóa đã chiếm dụng rồi update lại đúng bản ghi đó trong warehouse
- User ai cũng có quyền thêm lịch sử đơn hàng. Khi thêm lịch sử đơn hàng cần điền: moneyPaidNGN, exchangeRate, moneyPaidDolar, datePaid. Với type = hoàn tiền thì lấy số tiền payment + thêm tiền hoàn để khách nợ thêm số tiền hoàn đó.
- User ai cũng có quyền hoàn tác đơn hàng. trước khi hoàn tác cần phải kiểm tra: payment là số âm và (-1) * payment = totalPrice thì mới cho phép hoàn tác, và bắt buộc phải điền. Khi hoàn tác thì lấy số lượng hàng cộng lại vào số lượng khả dụng của hàng hóa đó trong kho, và trừ số lượng chiếm hữu đi
- Khi ở trạng thái báo giá, chốt đơn thì hàng trong kho không được trừ. Hàng trong kho chuyển sang chiếm dụng khi hàng chỉ cần nhận được 1 ít tiền. Khi tiền nhận được bằng 0 thì mới cho phép hoàn đơn. Khi hoàn đơn, hàng chiếm dụng bị trừ đi và hàng trong kho cộng bằng số hàng chiếm dụng đó. Khi hàng chuyển sang trạng thái đã giao thì mới trừ ở chiếm dụng.
- Cách tính totalPrice =  số lượng item (* số lượng set) * dơn giá (tuỳ theo item trong set hay ngoài set) * tỷ giá 
- Khi chốt đơn cũng không được tự động ghi nhận debt, Lưu ý quan trọng Debt, Paid nhận từ FE
- Danh sách đơn hàng hiển thị như sau:
  + Với role admin thì show hết tất cả đơn hàng trong hệ thống
  + Với role khác admin thì chỉ lấy được đơn hàng của current user đang call api (lọc theo createdBy)
- Quy trình chuyển trạng thái đơn hàng:
  + Flow chính: Báo giá -> Đã chốt -> Chỉnh sửa -> Đã chốt -> Đã giao
  + Flow hoàn tác: Báo giá -> Đã chốt -> Chỉnh sửa -> Hoàn tác
  + Lưu ý: Trạng thái "Đã giao" tương đương với "Đã xong", khi chuyển sang "Đã giao" thì áp dụng các nghiệp vụ giống như "Đã xong"
- Quản lý kho hàng theo trạng thái đơn hàng:
  + Khi đơn hàng ở trạng thái "Báo giá" hoặc "Đã chốt": không trừ số lượng trong kho (`totalAmount`), chỉ cập nhật số lượng chiếm dụng (`amountOccupied`) và số lượng khả dụng (`amountAviable`)
  + Đơn hàng chỉ ghi nhận thanh toán khi đang ở trạng thái "Đã chốt"
  + Khi nhận được một phần tiền thanh toán (có lịch sử thanh toán), hàng trong kho được tính là đã chiếm dụng (cập nhật `amountOccupied` và giảm `amountAviable`)
  + Chỉ khi chuyển sang trạng thái "Đã giao" (hoặc "Đã xong") mới trừ số lượng trong kho (`totalAmount` và `amountOccupied`)


```
