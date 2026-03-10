# Hướng dẫn Deploy lên Railway

## 1. Tạo project trên Railway

1. Đăng nhập [railway.app](https://railway.app)
2. **New Project** → **Deploy from GitHub repo**
3. Chọn repo `ThaoPT99/tailieu-lichsu` và branch `main`

## 2. Thêm PostgreSQL

1. Trong project → **+ New** → **Database** → **PostgreSQL**
2. Click vào service PostgreSQL → **Variables** → copy `DATABASE_URL`
3. Vào service **web** (Next.js) → **Variables** → **+ New Variable** → thêm `DATABASE_URL` = (paste URL vừa copy)
4. Hoặc dùng **Reference**: + New Variable → chọn "Add Reference" → Postgres → `DATABASE_URL`

## 3. Cấu hình Variables

Trong service **web** (Next.js), thêm các biến môi trường:

| Biến | Mô tả | Ví dụ |
|------|-------|-------|
| `NIXPACKS_NODE_VERSION` | Tùy chọn nếu cần Node cụ thể | `20` |
| `DATABASE_URL` | Từ PostgreSQL service | (Railway điền) |
| `NEXT_PUBLIC_APP_URL` | URL app sau khi deploy | `https://xxx.railway.app` |
| `VNPAY_TMN_CODE` | Mã merchant VNPAY | Từ sandbox.vnpayment.vn |
| `VNPAY_HASH_SECRET` | Secret key VNPAY | Từ sandbox |
| `VNPAY_URL` | URL cổng thanh toán | `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html` |
| `ADMIN_USERNAME` | Tên đăng nhập admin | `admin` |
| `ADMIN_PASSWORD` | Mật khẩu admin (plain text, tự hash khi tạo) | `your-secure-password` |
| `BANK_NAME` | Tên ngân hàng (cho Chuyển khoản) | Vietcombank |
| `BANK_ACCOUNT_NUMBER` | Số tài khoản | 0123456789 |
| `BANK_BRANCH` | Chi nhánh | Hà Nội |
| `BANK_RECIPIENT_NAME` | Chủ tài khoản | NGUYEN VAN A |
| `CONTACT_INFO` | Thông tin liên hệ khi có thắc mắc | Email/SĐT |

Admin được tạo tự động khi đăng nhập lần đầu nếu chưa có tài khoản nào.

**Chuyển khoản** hoạt động ngay không cần VNPAY/Momo. Admin vào Quản trị → xác nhận đơn khi khách đã chuyển tiền.

## 4. Railway Volume (lưu file upload) – **BẮT BUỘC**

Nếu không có Volume, file upload sẽ **mất sau mỗi lần deploy** → download bị 404.

1. **+ New** → **Volume**
2. Mount path: `/data`
3. Trong Variables của service web thêm: `UPLOADS_DIR=/data`
4. **Redeploy** và **tải lên lại tài liệu** qua trang Quản trị (file cũ không còn)

## 5. Custom domain (tùy chọn)

1. Vào service web → **Settings** → **Networking**
2. **Generate Domain** hoặc **Custom Domain**
3. Cập nhật `NEXT_PUBLIC_APP_URL` = domain mới
4. Cập nhật `vnp_ReturnUrl` và `vnp_IpnUrl` trong VNPAY (tự lấy từ `NEXT_PUBLIC_APP_URL`)

## 6. Tạo tài khoản Admin

Truy cập `/admin` và đăng nhập với `ADMIN_USERNAME` / `ADMIN_PASSWORD` đã cấu hình. Nếu chưa có admin nào, hệ thống tự tạo từ biến môi trường.

## Lưu ý

- **PPTX preview**: Chuyển PPTX → PDF cần LibreOffice. Railway mặc định không có. PPTX vẫn upload được nhưng không có preview PDF. Có thể thêm buildpack cài LibreOffice nếu cần.
- **Momo**: Thêm biến `MOMO_*` nếu dùng thanh toán Momo.
