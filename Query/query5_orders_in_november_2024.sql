-- Query 5: Pesanan pada Bulan Tertentu (November 2024)
-- Menampilkan semua pesanan yang dibuat pada bulan November 2024.
SELECT 
    o.id AS order_id, -- ID pesanan
    o.customer_name, -- nama pelanggan
    o.order_date, -- tanggal pesanan
    SUM(oi.quantity * oi.price) AS total_price -- total harga
FROM orders o -- tabel orders ( alias 'o' untuk orders)
JOIN order_items oi ON o.id = oi.order_id -- gabungkan dengan tabel order_items ( alias 'oi' untuk order_items)
WHERE MONTH(o.order_date) = 11 AND YEAR(o.order_date) = 2024 -- filter untuk bulan November 2024
GROUP BY o.id, o.customer_name, o.order_date; -- Menggunakan GROUP BY untuk mengelompokkan hasil berdasarkan ID pesanan, nama pelanggan, dan tanggal pesanan.

-- Penjelasan:
-- Query ini dirancang untuk menampilkan semua pesanan yang dibuat pada bulan November 2024.
-- Dengan menggunakan JOIN antara tabel orders dan order_items, kita dapat menghitung total harga untuk setiap pesanan.
-- Hasilnya difilter berdasarkan bulan dan tahun yang diinginkan, yaitu November 2024.