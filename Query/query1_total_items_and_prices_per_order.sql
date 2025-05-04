-- Query 1: Total Item dan Harga Pesanan
-- Menghitung jumlah item dan total harga untuk setiap pesanan.
SELECT 
    o.id AS order_id, -- ID pesanan
    o.customer_name, -- nama pelanggan
    o.order_date, -- tanggal pesanan
    SUM(oi.quantity) AS total_items, -- jumlah item
    SUM(oi.quantity * oi.price) AS total_price -- total harga
FROM orders o -- tabel orders ( alias 'o' untuk orders)
JOIN order_items oi ON o.id = oi.order_id -- gabungkan dengan tabel order_items ( alias 'oi' untuk order_items)
GROUP BY o.id, o.customer_name, o.order_date; -- Menggunakan GROUP BY untuk mengelompokkan hasil berdasarkan ID pesanan, nama pelanggan, dan tanggal pesanan.

-- Penjelasan:
-- Query ini dirancang untuk menghitung jumlah item dan total harga untuk setiap pesanan.
-- Dengan menggunakan JOIN antara tabel orders dan order_items, kita dapat menghitung total item dan total harga untuk setiap pesanan.
-- Hasilnya dikelompokkan berdasarkan ID pesanan, nama pelanggan, dan tanggal pesanan.
-- Hal ini memungkinkan kita untuk mendapatkan gambaran lengkap tentang setiap pesanan yang dilakukan oleh pelanggan.
-- Dengan informasi ini, kita dapat menganalisis pola pembelian pelanggan dan mengidentifikasi pesanan dengan nilai tertinggi.