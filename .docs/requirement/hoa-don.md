# View hoá đơn

- Nếu như đơn nào không có discount thì không hiện phần discount
- Dưới phần discount sẽ có thêm mục “Debt” (tiền nợ), tiền nợ này sẽ nhập bên phần “Giỏ hàng” theo dollar ($)
- Trong trường hợp không có nợ thì không có xuất hiện Debt
- Đối với trường hợp khách vẫn còn tiền thừa của đơn trước thì sẽ có thêm mục Paid, số tiền Paid được nhập bên phần “Giỏ hàng” theo dollar.
- Phần Debt, Paid hiển thị ngay trên Total (USD):
- Bổ sung thêm “Ghi chú”, phần ghi chú này nhiều nhất là 2 dòng nên thu gọn lại phần này, không để trình bày lớn, cỡ chữ nhỏ hơn, nếu ghi chú không ghi gì thì không có phần ghi chú trong trình bày.
- Để tạo được 1 set thì số lượng các vật phẩm trong đó phải bằng nhau, số lượng set = số lượng vật phẩm và mỗi set thì số lượng vật phẩm bằng 1. Ví dụ: Vật phẩm A set số lượng là 8, vật phẩm B set số lượng là 8 thì khi tạo set thì số lượng set là 8 với mỗi set có 1 A và 1 B. Khi tách set thì số lượng vật phẩm bằng số lượng set. Nếu số lượng vật phẩm không bằng nhau thì thông báo cho người dùng biết. 1 set có bao nhiêu sản phẩm thì khi tách set cũng có bằng đấy sản phẩm thôi, Tên set phải unique, vì khi tôi tạo set 1, sau đó tạo set 2, rồi tôi xoá set 1, và lại tạo set mới thì tên set mới lại là set 2 bị trùng, hãy sửa lại cho tôi
