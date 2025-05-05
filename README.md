
# Fullstack Project: Laravel Lumen & Vue.js

## 📦 Backend - Laravel Lumen

### 1. Install Dependencies
```bash
cd backend-lumen-api
composer install
```

### 2. Konfigurasi Environment
- Copy file `.env.example` menjadi `.env`
- Atur konfigurasi database di file `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### 3. Migrasi Database
```bash
php artisan migrate
```

### 4. Jalankan Server
```bash
php -S localhost:8000 -t public
```

### 5. Testing Endpoint dengan Postman

#### 🔹 Product Endpoints

**Get All Products**
- Method: `GET`
- URL: `http://localhost:8000/api/products`
- Description: Mendapatkan semua data produk

**Create Product**
- Method: `POST`
- URL: `http://localhost:8000/api/products`
- Body (JSON):
```json
{
    "name": "Product Name",
    "price": 100000,
    "stock": 50
}
```

**Update Product**
- Method: `PUT`
- URL: `http://localhost:8000/api/products/{id}`
- Body (JSON):
```json
{
    "name": "Updated Product Name",
    "price": 150000,
    "stock": 30
}
```

**Delete Product**
- Method: `DELETE`
- URL: `http://localhost:8000/api/products/{id}`

#### 🔹 Order Endpoints

**Get All Orders**
- Method: `GET`
- URL: `http://localhost:8000/api/orders`
- Description: Mendapatkan semua data order

**Create Order**
- Method: `POST`
- URL: `http://localhost:8000/api/orders`
- Body (JSON):
```json
{
    "customer_name": "Rizki Rahmadani",
    "order_date": "2025-04-05",
    "items": [
        {
            "product_id": 1,
            "quantity": 2
        }
    ]
}
```

#### 🔐 Authentication Endpoints

**Register**
- Method: `POST`
- URL: `http://localhost:8000/api/register`
- Body (JSON):
```json
{
    "name": "User Name",
    "email": "user@example.com",
    "password": "password123"
}
```

**Login**
- Method: `POST`
- URL: `http://localhost:8000/api/login`
- Body (JSON):
```json
{
    "email": "user@example.com",
    "password": "password123"
}
```

**Get Profile (Protected Route)**
- Method: `GET`
- URL: `http://localhost:8000/api/profile`
- Headers:
```
Authorization: Bearer {your_jwt_token}
```

---

## 🌐 Frontend - Vue.js

### 1. Install Dependencies
```bash
cd vue-frontend
npm install
```

### 2. Konfigurasi Environment
- Buat file `.env` di root folder project:
```env
VITE_API_BASE_URL=http://localhost:5174/api
```

### 3. Jalankan Development Server
```bash
npm run dev
```

---

## 📁 Lainnya

- 🔍 Soal Nomor 3 (Query Database MySQL): Lihat pada folder `Query`
- 🐞 Soal Nomor 4 (Debugging Laravel Lumen): Lihat file `debugging-laravel-lumen.php`
