# SevmezBLOG (v0.1)

Full-stack blog platformu. Go (Gin) backend, Next.js (React) frontend, PostgreSQL veritabanı. JWT tabanlı kimlik doğrulama ve 5 kademeli rol sistemi ile güçlendirilmiş, Docker ile tek komutla ayağa kalkar.

---

## Teknolojiler

| Katman | Teknoloji |
|---|---|
| **Backend** | Go 1.25 · Gin · GORM · JWT |
| **Frontend** | Next.js 16 · React 18 · TypeScript · Tailwind CSS · Shadcn/UI |
| **Veritabanı** | PostgreSQL 15 |
| **Altyapı** | Docker · Docker Compose |

---

## Hızlı Başlangıç

### Gereksinimler

- [Docker](https://docs.docker.com/get-docker/) ve [Docker Compose](https://docs.docker.com/compose/install/)
- Veya lokal geliştirme için: Go 1.25+, Node.js 20+, PostgreSQL 15+

### 1. Repo'yu klonla

```bash
git clone https://github.com/EmirhanSevmez/SevmezBLOG.git
cd SevmezBLOG
```

### 2. Ortam değişkenlerini ayarla

Proje **`.env` dosyası olmadan çalışmaz**. Aşağıdaki iki `.env` dosyasını oluşturmanız gerekiyor:

**Root dizin - `.env`** (Docker Compose için):

```env
# ── Database ──
DB_USER=admin
DB_PASSWORD=secretpassword
DB_NAME=blogdb

# ── JWT ──
JWT_SECRET=super-secret-key-change-me-in-production

# ── Server ──
PORT=8080

# ── Frontend ──
NEXT_PUBLIC_API_URL=http://localhost:8080
```

**Backend dizini - `backend/.env`** (Lokal geliştirme için):

```env
# ── Database ──
DB_HOST=127.0.0.1
DB_USER=admin
DB_PASSWORD=secretpassword
DB_NAME=blogdb
DB_PORT=5432

# ── JWT ──
JWT_SECRET=super-secret-key-change-me-in-production

# ── Server ──
GIN_MODE=release
PORT=8080
```

> **Not:** `.env` dosyaları `.gitignore`'a eklenmiştir ve repo'ya push edilmez. Production ortamında tüm değerleri (özellikle `JWT_SECRET` ve `DB_PASSWORD`) güçlü, benzersiz değerlerle değiştirin.

### 3. Docker ile çalıştır

```bash
docker-compose up --build
```

Hepsi bu kadar. Üç servis ayağa kalkar:

| Servis | Adres |
|---|---|
| Frontend | [http://localhost:3000](http://localhost:3000) |
| Backend API | [http://localhost:8080](http://localhost:8080) |
| PostgreSQL | `localhost:5432` |

### 4. Lokal geliştirme (Docker olmadan)

```bash
# PostgreSQL'i başlat ve blogdb veritabanını oluştur

# Backend
cd backend
go run .

# Frontend (ayrı terminal)
cd frontend
npm install --legacy-peer-deps
npm run dev
```

---

## Varsayılan Admin Hesabı

Uygulama ilk çalıştığında otomatik olarak bir admin hesabı oluşturur:

| Alan | Değer |
|---|---|
| E-posta | `admin@blog.com` |
| Şifre | `admin123` |

> **Uyarı:** Production ortamında giriş yaptıktan sonra admin şifresini mutlaka değiştirin.

---

## Rol Sistemi

5 kademeli hiyerarşik yetkilendirme sistemi:

| Rol | Seviye | Yetkiler |
|---|---|---|
| `visitor` | 0 | Sadece postları okuyabilir |
| `user` | 1 | Yorum yazabilir |
| `approved` | 2 | Post oluşturabilir ve silebilir |
| `moderator` | 3 | Yorumları silebilir, kullanıcıları listeleyebilir |
| `admin` | 4 | Kullanıcı rollerini değiştirebilir, tam yetki |

Yeni kayıt olan kullanıcılar `user` rolüyle başlar. Rol yükseltme yalnızca admin panelinden yapılabilir.

---

## API Endpointleri

### Genel

| Metot | Endpoint | Açıklama |
|---|---|---|
| `GET` | `/api/health` | Sağlık kontrolü |

### Kimlik Doğrulama

| Metot | Endpoint | Açıklama |
|---|---|---|
| `POST` | `/api/auth/register` | Yeni hesap oluştur |
| `POST` | `/api/auth/login` | Giriş yap, JWT token al |
| `GET` | `/api/auth/me` | Mevcut kullanıcı bilgilerini getir |

### Postlar

| Metot | Endpoint | Min. Rol | Açıklama |
|---|---|---|---|
| `GET` | `/api/posts` | - | Tüm postları listele |
| `GET` | `/api/posts/:id` | - | Tek post getir (yorumlarıyla) |
| `POST` | `/api/posts` | `approved` | Yeni post oluştur |
| `DELETE` | `/api/posts/:id` | `approved` | Post sil |

### Yorumlar

| Metot | Endpoint | Min. Rol | Açıklama |
|---|---|---|---|
| `POST` | `/api/posts/:id/comments` | `user` | Yorum yaz |
| `DELETE` | `/api/comments/:id` | `moderator` | Yorum sil |

### Admin

| Metot | Endpoint | Min. Rol | Açıklama |
|---|---|---|---|
| `GET` | `/api/admin/users` | `moderator` | Tüm kullanıcıları listele |
| `PUT` | `/api/admin/users/:id/role` | `admin` | Kullanıcı rolünü değiştir |

---

## Proje Yapısı

```
SevmezBLOG/
├── backend/
│   ├── config/          # Veritabanı bağlantısı ve ortam değişkenleri
│   ├── handlers/        # HTTP handler fonksiyonları
│   ├── middleware/       # JWT auth, CORS, rol kontrolü
│   ├── models/          # GORM modelleri (User, Post, Comment)
│   ├── routes/          # API route tanımları
│   ├── .env             # Ortam değişkenleri (git'e dahil değil)
│   ├── Dockerfile       # Multi-stage production build
│   ├── go.mod
│   └── main.go
├── frontend/
│   ├── src/
│   │   ├── components/  # Navbar, Layout, Shadcn/UI bileşenleri
│   │   ├── context/     # AuthContext (JWT yönetimi)
│   │   ├── lib/         # Axios API client
│   │   ├── pages/       # Next.js sayfaları
│   │   └── styles/      # Global stiller
│   ├── Dockerfile       # Multi-stage production build
│   ├── next.config.mjs
│   └── package.json
├── .env                 # Docker Compose ortam değişkenleri (git'e dahil değil)
├── docker-compose.yaml
└── README.md
```

---

## Ortam Değişkenleri Referansı

| Değişken | Nerede | Varsayılan | Açıklama |
|---|---|---|---|
| `DB_HOST` | Backend | - | PostgreSQL sunucu adresi |
| `DB_USER` | Backend, Compose | - | Veritabanı kullanıcı adı |
| `DB_PASSWORD` | Backend, Compose | - | Veritabanı şifresi |
| `DB_NAME` | Backend, Compose | - | Veritabanı adı |
| `DB_PORT` | Backend | - | PostgreSQL portu |
| `JWT_SECRET` | Backend, Compose | - | JWT token imzalama anahtarı |
| `GIN_MODE` | Backend | `release` | Gin framework modu (`debug` / `release`) |
| `PORT` | Backend, Compose | - | Backend sunucu portu |
| `NEXT_PUBLIC_API_URL` | Frontend, Compose | - | Backend API adresi |

> Hiçbir değişkenin hardcoded varsayılanı yoktur. `.env` dosyası olmadan uygulama başlamaz.

---

## Lisans

MIT
