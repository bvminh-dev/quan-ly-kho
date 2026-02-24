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
