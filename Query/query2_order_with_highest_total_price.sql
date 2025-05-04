-- Query 2: Pesanan dengan Harga Total Tertinggi
-- Menampilkan satu pesanan dengan total harga paling tinggi.
SELECT 
    o.id AS order_id, -- ID pesanan
    o.customer_name, -- nama pelanggan
    o.order_date, -- tanggal pesanan
    SUM(oi.quantity * oi.price) AS total_price -- total harga
FROM orders o -- tabel orders ( alias 'o' untuk orders)
JOIN order_items oi ON o.id = oi.order_id -- gabungkan dengan tabel order_items ( alias 'oi' untuk order_items)
GROUP BY o.id, o.customer_name, o.order_date -- Menggunakan GROUP BY untuk mengelompokkan hasil berdasarkan ID pesanan, nama pelanggan, dan tanggal pesanan.
ORDER BY total_price DESC -- Mengurutkan hasil berdasarkan total harga secara menurun
LIMIT 1; -- -- Mengambil satu hasil teratas

-- Penjelasan:
-- Query ini dirancang untuk menampilkan satu pesanan dengan total harga tertinggi.
-- Dengan menggunakan JOIN antara tabel orders dan order_items, kita dapat menghitung total harga untuk setiap pesanan.
-- Hasilnya diurutkan berdasarkan total harga secara menurun, dan hanya satu hasil teratas yang ditampilkan.
-- Hal ini memungkinkan kita untuk dengan cepat mengidentifikasi pesanan yang memiliki total harga paling tinggi.