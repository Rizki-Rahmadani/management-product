-- Query 4: Stok Produk Setelah Pemesanan
-- Menampilkan stok awal dan stok sisa untuk setiap produk setelah pemesanan.
SELECT 
    p.id AS product_id, -- ID produk
    p.name AS product_name, -- nama produk
    p.stock + IFNULL(SUM(oi.quantity), 0) AS initial_stock, -- stok awal
    p.stock AS remaining_stock -- stok sisa
FROM products p -- tabel produk ( alias 'p' untuk products)
LEFT JOIN order_items oi ON p.id = oi.product_id -- gabungkan dengan tabel order_items ( alias 'oi' untuk order_items)
GROUP BY p.id, p.name, p.stock; -- Menggunakan GROUP BY untuk mengelompokkan hasil berdasarkan ID produk, nama produk, dan stok produk.

-- Penjelasan:
-- Query ini dirancang untuk menampilkan stok awal dan stok sisa untuk setiap produk setelah pemesanan.
-- Dengan menggunakan LEFT JOIN antara tabel produk dan order_items, kita dapat menghitung stok awal dan stok sisa untuk setiap produk.
-- Hal ini memungkinkan kita untuk mendapatkan gambaran lengkap tentang stok produk setelah pemesanan dilakukan.
-- Dengan informasi ini, kita dapat menganalisis ketersediaan produk dan mengidentifikasi produk yang perlu diisi ulang.
-- Dengan menggunakan IFNULL, kita memastikan bahwa jika tidak ada pemesanan untuk produk tertentu, stok awal tetap ditampilkan sebagai stok produk saat ini.
-- Dengan cara ini, kita dapat dengan mudah melihat produk mana yang memiliki stok yang cukup dan mana yang perlu diisi ulang.

