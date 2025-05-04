-- Query 3: Produk Terpopuler
-- Mencari produk yang paling banyak dipesan berdasarkan total quantity.
SELECT 
    p.id AS product_id, -- ID produk
    p.name AS product_name, -- nama produk
    SUM(oi.quantity) AS total_quantity -- total quantity
FROM products p -- tabel produk ( alias 'p' untuk products)
JOIN order_items oi ON p.id = oi.product_id -- gabungkan dengan tabel order_items ( alias 'oi' untuk order_items)
GROUP BY p.id, p.name -- Menggunakan GROUP BY untuk mengelompokkan hasil berdasarkan ID produk dan nama produk.
ORDER BY total_quantity DESC -- Mengurutkan hasil berdasarkan total quantity secara menurun
LIMIT 1; -- -- Mengambil satu hasil teratas

-- penjelasan:
-- Query ini dirancang untuk mencari produk paling populer berdasarkan jumlah total (total_quantity).
-- Dengan mengurutkan data secara menurun dan mengambil hanya satu hasil teratas,
-- query ini memastikan bahwa hanya produk dengan jumlah tertinggi yang ditampilkan.