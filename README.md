# Đèn Gỗ Sài Gòn

Shop đèn gỗ thủ công bằng tiếng Việt. Dự án gồm backend NestJS + MongoDB và frontend React + Vite + Tailwind CSS.

## Chạy nhanh (3 terminal)

```bash
# 1) MongoDB (Docker, map ra cổng 27018)
docker start dgs-mongo || docker run -d --name dgs-mongo -p 127.0.0.1:27018:27017 mongo:8

# 2) Backend -> http://localhost:3000/api
cd backend && npm run start:dev

# 3) Frontend -> http://localhost:5173  (terminal khác)
cd frontend && npm run dev
```

Kiểm tra backend sống: `curl http://localhost:3000/api/health` → `{"ok":true,...}`

Đăng nhập admin tại `http://localhost:5173/admin` bằng `ADMIN_EMAIL` / `ADMIN_PASSWORD` trong `backend/.env`.

> Phần **tồn kho** chưa hoàn thiện — sẽ phát triển sau. Hiện tại dùng cờ **Ẩn/Hiện** (`isPublished`) để giấu sản phẩm chưa có giá khỏi trang khách.

## Chức năng

### Khách hàng

- Trang chủ với slideshow banner do admin quản lý.
- Danh sách đèn: tìm theo tên, lọc theo loại, sắp xếp theo giá.
- Chi tiết sản phẩm, giỏ hàng lưu trên `localStorage`, đặt hàng không cần đăng nhập.
- Khi đặt hàng: hệ thống lưu snapshot tên/giá sản phẩm và gửi email cho admin. Email lỗi không làm mất đơn.
- Blog/tin tức và trang chi tiết bài viết.
- Giao diện responsive, hỗ trợ focus bằng bàn phím.

### Admin

- Một tài khoản JWT duy nhất, tự tạo từ biến môi trường khi backend kết nối MongoDB lần đầu.
- Quản lý sản phẩm: CRUD, nhiều ảnh, loại đèn, cờ nổi bật và cờ **Ẩn/Hiện** (`isPublished`). Sản phẩm đang ẩn không xuất hiện ở trang khách và trả về 404 khi truy cập trực tiếp theo slug.
- Quản lý banner: upload Cloudinary, tối đa 5 banner hoạt động, kéo-thả để đổi thứ tự slideshow.
- Quản lý bài viết: TipTap, chèn ảnh Cloudinary, đăng/ẩn bài.
- Quản lý đơn: xem chi tiết và đổi trạng thái `mới` / `đang xử lý` / `đã giao` / `đã hủy`.

## Yêu cầu

- Node.js 22+
- MongoDB local hoặc MongoDB Atlas
- Tài khoản [Cloudinary](https://cloudinary.com/) free tier để upload ảnh thật
- Tài khoản [Brevo](https://www.brevo.com/) free tier để gửi email SMTP

## Cài đặt

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

Sửa các biến quan trọng trong `backend/.env`:

```env
# 27018 nếu chạy MongoDB bằng Docker như mục "Chạy nhanh"; 27017 nếu cài mongod trực tiếp trên máy
MONGODB_URI=mongodb://127.0.0.1:27018/den-go-sai-gon
JWT_SECRET=mot-chuoi-bi-mat-dai-va-ngau-nhien
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=mat-khau-admin-manh
ADMIN_EMAIL_TO=admin@example.com
```

Lần kết nối MongoDB đầu tiên, backend tự tạo admin từ `ADMIN_EMAIL` và `ADMIN_PASSWORD`. Những lần sau backend **không ghi đè** mật khẩu trong database.

Backend chạy tại `http://localhost:3000/api`. Kiểm tra nhanh:

```bash
curl http://localhost:3000/api/health
```

### 2. Frontend

Mở terminal khác:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend chạy tại `http://localhost:5173`.

## Cloudinary

Lấy `Cloud name`, `API Key`, `API Secret` tại Cloudinary Dashboard và điền vào:

```env
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

Admin upload JPEG/PNG/WebP, tối đa 5 MB/ảnh. Backend nhận file bằng Multer memory storage, upload qua Cloudinary SDK và chỉ lưu URL trả về vào MongoDB.

## Brevo SMTP

Brevo free plan có hạn mức 300 email/ngày, phù hợp shop nhỏ và ổn định hơn Gmail SMTP khi chạy production.

1. Tạo tài khoản Brevo và xác thực người gửi/domain.
2. Vào **Transactional → SMTP & API → SMTP**, lấy SMTP login và SMTP key.
3. Cập nhật:

```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-brevo-smtp-login
SMTP_PASS=your-brevo-smtp-key
SMTP_FROM="Đèn Gỗ Sài Gòn <shop@example.com>"
SMTP_SECURE=false
```

`ADMIN_EMAIL_TO` là địa chỉ nhận thông báo khi có đơn mới. Nếu chưa cấu hình SMTP, đơn vẫn được lưu; backend ghi cảnh báo vào log.

## Dữ liệu demo

Khi `SEED_DEMO=true`, backend tạo một banner, bốn sản phẩm và một bài viết demo **nếu collection sản phẩm đang trống**. Ảnh demo sử dụng URL Unsplash. Đặt `SEED_DEMO=false` để tắt.

## Deploy VPS bằng Docker Compose

Mô hình production dùng một domain duy nhất: Caddy nhận HTTP/HTTPS ở cổng `80`/`443`, chuyển `/api/*` vào backend NestJS và chuyển các route còn lại vào frontend Nginx. Frontend build với `VITE_API_URL=/api`, nên trình duyệt không gọi trực tiếp cổng backend. MongoDB chạy cùng Docker Compose trên VPS (service `mongo`), chỉ lắng nghe trong mạng nội bộ — không mở cổng `27017` ra internet.

### 1. Chuẩn bị DNS và VPS

Trỏ bản ghi `A` của domain về IP VPS:

```text
@     A     <VPS_IP>
www   A     <VPS_IP>
```

Trên VPS Ubuntu/Debian, cài Docker:

```bash
sudo apt update
sudo apt install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo tee /etc/apt/keyrings/docker.asc >/dev/null
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
```

Đăng xuất rồi SSH lại để quyền `docker` có hiệu lực.

### 2. Clone source và tạo file môi trường production

```bash
mkdir -p ~/apps
cd ~/apps
git clone git@github.com:quangphucqn/websitedengosaigon.git dengosaigon
cd dengosaigon
cp .env.example .env
nano .env
```

Cập nhật `.env` trên VPS bằng giá trị thật. `MONGO_INITDB_ROOT_PASSWORD` và mật khẩu trong `MONGODB_URI` phải giống nhau. Host trong URI là `mongo` (tên service Docker), không phải `localhost`.

```env
DOMAIN=your-domain.com
MONGO_INITDB_ROOT_USERNAME=dengosaigon
MONGO_INITDB_ROOT_PASSWORD=mat-khau-mongo-manh
MONGO_INITDB_DATABASE=den-go-sai-gon
MONGODB_URI=mongodb://dengosaigon:mat-khau-mongo-manh@mongo:27017/den-go-sai-gon?authSource=admin
JWT_SECRET=chuoi-random-rat-dai
FRONTEND_URL=https://your-domain.com
ADMIN_EMAIL=admin@your-domain.com
ADMIN_PASSWORD=mat-khau-admin-manh
ADMIN_EMAIL_TO=admin@your-domain.com
SEED_DEMO=false
```

Nếu mật khẩu Mongo có ký tự đặc biệt (`@`, `:`, `/`, `#`, `%`), encode URL trong `MONGODB_URI`. Không commit file `.env`; file này chỉ nằm trên VPS.

### 3. Chạy lần đầu trên VPS

```bash
cd ~/apps/dengosaigon
docker compose up -d --build
```

Lần đầu Mongo cần vài chục giây để khởi tạo user. Kiểm tra:

```bash
docker compose ps
curl -fsS https://your-domain.com/api/health
docker compose logs -f mongo backend
```

Admin production vào tại:

```text
https://your-domain.com/admin
```

### 4. Tạo script deploy trên VPS

Script trong repo là `scripts/deploy.sh`. Tạo wrapper để GitHub Actions gọi cố định:

```bash
mkdir -p ~/bin
cat > ~/bin/deploy-dengosaigon <<'EOF'
#!/usr/bin/env bash
set -Eeuo pipefail
cd "$HOME/apps/dengosaigon"
./scripts/deploy.sh
EOF
chmod +x ~/bin/deploy-dengosaigon
```

Script sẽ `git fetch`, reset về `origin/main`, build lại Docker image, chạy `docker compose up -d --build --remove-orphans` và kiểm tra `GET /api/health` trong container backend.

### 5. Cấu hình CI/CD GitHub Actions

Workflow `.github/workflows/deploy-production.yml` chạy khi push vào `main` hoặc bấm `workflow_dispatch` thủ công. Job `verify` build backend/frontend trước; nếu build lỗi thì không deploy.

Tạo SSH key riêng cho deploy trên máy cá nhân:

```bash
ssh-keygen -t ed25519 -C "github-actions-dengosaigon" -f ~/.ssh/dengosaigon_actions
```

Thêm public key vào VPS:

```bash
ssh-copy-id -i ~/.ssh/dengosaigon_actions.pub <vps-user>@<vps-ip>
```

Lấy host key VPS để chống MITM:

```bash
ssh-keyscan -p 22 <vps-ip>
```

Vào GitHub repository → **Settings → Secrets and variables → Actions → New repository secret**, thêm:

```text
VPS_HOST=<vps-ip-hoac-domain>
VPS_PORT=22
VPS_USER=<vps-user>
VPS_SSH_PRIVATE_KEY=<noi-dung-file-~/.ssh/dengosaigon_actions>
VPS_KNOWN_HOSTS=<ket-qua-ssh-keyscan>
```

Sau đó mỗi lần push lên `main`, GitHub Actions sẽ SSH vào VPS và chạy `~/bin/deploy-dengosaigon`.

### 6. Rollback nhanh

Nếu bản mới lỗi, SSH vào VPS và quay về commit trước:

```bash
cd ~/apps/dengosaigon
git log --oneline -5
git reset --hard <commit-cu>
docker compose up -d --build --remove-orphans
```

Volume `mongo_data` giữ nguyên khi rebuild app. Không chạy `docker compose down -v` trừ khi cố ý xóa database.

Backup Mongo trên VPS:

```bash
docker compose exec -T mongo mongodump \
  -u "$MONGO_INITDB_ROOT_USERNAME" \
  -p "$MONGO_INITDB_ROOT_PASSWORD" \
  --authenticationDatabase admin \
  --archive > ~/mongo-backup-$(date +%F).archive
```

## Lệnh kiểm tra

```bash
# Backend
cd backend
npm run build
npm run lint

# Frontend
cd frontend
npm run build
npm run lint
```

## Cấu trúc

```text
backend/
  src/
    auth/       # admin bootstrap, JWT login
    products/   # catalog
    banners/    # slideshow + thứ tự
    orders/     # kiểm tra kho, tạo đơn, hoàn kho khi hủy
    posts/      # bài viết đã sanitize HTML
    uploads/    # Multer + Cloudinary
    mail/       # Nodemailer SMTP Brevo
    seed/       # dữ liệu demo tùy chọn
frontend/
  src/
    pages/      # các trang khách
    pages/admin/# dashboard
    components/ # layout, cards, TipTap editor
    api/        # fetch client và upload
    store/      # Zustand cart persist
```

## API tóm tắt

Các route công khai:

- `GET /api/products`, `GET /api/products/:slug`
- `GET /api/banners`
- `POST /api/orders`
- `GET /api/posts`, `GET /api/posts/:slug`
- `POST /api/auth/login`

Các route còn lại cần header `Authorization: Bearer <JWT>`.
