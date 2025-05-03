# 🧠 Soal Teori - Fullstack Developer (Laravel Lumen, Vue.js, MySQL)

---

## ✅ Laravel & Laravel Lumen

### 1. Apa perbedaan utama antara Laravel dan Laravel Lumen? Jelaskan dalam konteks penggunaan aplikasi yang ringan dan performa API.

**Jawab:**

Perbedaan terletak pada desain arsitektur dan fitur yang dimiliki masing-masing framework. Karena kebutuhan technical test tidak memerlukan banyak fitur tambahan, maka **Laravel Lumen adalah pilihan yang lebih efisien**.

- **Laravel Lumen**:

  - Dirancang untuk API ringan & performa tinggi.
  - Cocok untuk membangun microservices dan RESTful API.

- **Laravel**:
  - Framework lengkap dengan banyak fitur.
  - Cocok untuk membangun aplikasi web skala penuh (API + frontend).

---

### 2. Jelaskan konsep middleware di Laravel Lumen dan berikan contoh penggunaannya.

**Jawab:**

**Middleware** adalah lapisan perantara antara request dan response. Fungsinya untuk menangani logika sebelum request sampai ke controller atau sebelum response dikirim ke client.

**Contoh alur penggunaan:**

- Client mengirim request ke API.
- Middleware menganalisis atau memodifikasi request.
- Jika lolos, diteruskan ke controller.
- Response dari controller kembali melewati middleware sebelum ke client.

---

### 3. Apa itu dependency injection, dan bagaimana Laravel Lumen memanfaatkannya?

**Jawab:**

**Dependency Injection (DI)** adalah pola desain di mana objek menerima dependensinya dari luar alih-alih membuat sendiri.

**Contoh di Laravel Lumen:**

// Controller
class UserController extends Controller
{
protected $service;

    public function __construct(UserService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        return $this->service->getAll();
    }

}

===============================================================================================================================================================================

## 🎯 Vue.js

### 1. Jelaskan apa itu reactive data binding di Vue.js dan bagaimana ini membantu dalam pengembangan front-end?

**Jawaban:**

Reactive data binding adalah kemampuan Vue.js untuk secara otomatis menghubungkan data di JavaScript dengan tampilan (DOM) di HTML, sehingga setiap perubahan data langsung tercermin di UI.

> Reactive data binding sangat membantu dalam pengembangan front-end karena membuat UI dan data selalu sinkron secara otomatis, mempercepat dan menyederhanakan pengembangan aplikasi yang interaktif dan dinamis.

---

### 2. Sebutkan dan jelaskan perbedaan utama antara computed properties dan methods di Vue.js.

**Jawaban:**

#### A. Cara Kerja:

- **Computed Properties**: Hanya dihitung ulang jika data dependensinya berubah.
- **Methods**: Selalu dijalankan ulang setiap kali dipanggil, meskipun datanya tidak berubah.

#### B. Tujuan Penggunaan:

- **Computed Properties**: Digunakan untuk menghasilkan nilai berdasarkan `state` atau `data`, cocok untuk proses yang bisa di-cache.
- **Methods**: Digunakan untuk eksekusi fungsi atau logika langsung seperti event handler atau perhitungan cepat yang tidak perlu cache.

#### C. Performa:

- **Computed Properties**: Lebih efisien karena hasilnya di-cache dan hanya dihitung ulang saat diperlukan.
- **Methods**: Kurang efisien jika digunakan untuk logika berat yang tidak sering berubah.

---

### 3. Apa keuntungan menggunakan Vuex dalam aplikasi Vue.js?

**Jawaban:**

Vuex adalah state management library resmi untuk Vue.js yang digunakan untuk mengelola state (data global) aplikasi secara terpusat.

#### Keuntungan:

- Vuex menyimpan semua state dalam satu **store global**.
- State di Vuex bersifat **reaktif**, artinya jika ada perubahan, semua komponen yang menggunakan state tersebut akan otomatis diperbarui.
- Sangat berguna untuk aplikasi kompleks di mana banyak komponen perlu saling berbagi atau mengakses data.

===============================================================================================================================================================================

## 🗄️ MySQL

### 1. Jelaskan apa itu indexing di MySQL, dan bagaimana ini mempengaruhi performa query?

**Jawaban:**

Indexing di MySQL adalah mekanisme untuk mempercepat pencarian data dalam tabel.

> Indeks bekerja seperti daftar isi di buku — alih-alih membaca seluruh isi tabel (full scan), MySQL bisa langsung melompat ke lokasi data yang dicari.

#### Contoh operasi yang terbantu dengan indexing:

- `SELECT` dengan `WHERE`
- `ORDER BY`
- `JOIN`
- `GROUP BY`

Dengan indexing, query menjadi jauh lebih cepat karena MySQL dapat menghindari full table scan dan langsung menemukan baris yang relevan.

---

### 2. Apa perbedaan antara `INNER JOIN` dan `LEFT JOIN`? Berikan contoh kasus penggunaan keduanya.

**Jawaban:**

#### A. Hasil yang diambil:

- **INNER JOIN**: Hanya mengambil baris yang memiliki kecocokan di kedua tabel.
- **LEFT JOIN**: Mengambil semua baris dari tabel kiri, meskipun tidak ada kecocokan di tabel kanan.

#### B. Jika tidak ada kecocokan:

- **INNER JOIN**: Tidak menampilkan baris.
- **LEFT JOIN**: Tetap menampilkan baris dari tabel kiri, dan kolom dari tabel kanan akan bernilai `NULL`.

#### Contoh Kasus:

- **INNER JOIN**: Digunakan ketika hanya ingin menampilkan data yang saling terhubung antar tabel.
- **LEFT JOIN**: Cocok digunakan saat ingin menampilkan semua data dari tabel utama, meskipun tidak ada data terkait dari tabel lain.

---

### 3. Apa tujuan dari normalisasi database? Sebutkan salah satu kelemahannya.

**Jawaban:**

Tujuan normalisasi database:

- Menghilangkan redundansi data (pengulangan data yang tidak perlu).
- Memastikan integritas data (data tetap konsisten dan tidak saling bertentangan).
- Memecah tabel besar menjadi tabel-tabel kecil dengan relasi yang logis.
- Meningkatkan efisiensi penyimpanan dan kejelasan struktur database.

**Kelemahan:**

- Dapat menurunkan performa query, khususnya ketika harus melakukan banyak `JOIN` untuk menggabungkan data dari tabel-tabel yang terpisah.
