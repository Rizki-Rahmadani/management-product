<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use Tymon\JWTAuth\Facades\JWTAuth;

class OrderController extends Controller
{
    // Menambahkan middleware autentikasi JWT agar endpoint hanya bisa diakses oleh pengguna yang sudah login
    public function __construct()
    {
        $this->middleware('jwt.auth');
    }

     public function index()
     {
         $user = JWTAuth::user(); // Mendapatkan pengguna yang sedang login
         if (!$user) {
             return response()->json([
                 'status' => 'error',
                 'message' => 'Unauthorized'
             ], 401);
         }
         $orders = Order::with('items.product') 
             ->where('user_id', $user->id) // Mengambil order berdasarkan user_id
             ->get()
             ->map(function ($order) {
                 $order->items->each(function ($item) {
                     $item->subtotal = $item->price * $item->quantity;
                 });
                 $order->total_price = $order->items->sum('subtotal');
                 return $order;
             });

         return response()->json([
             'status' => 'success',
             'data' => $orders
         ]);
     }

    public function store(Request $request)
    {
        try {
            DB::beginTransaction(); // Memulai transaksi database untuk memastikan semua operasi berhasil atau tidak sama sekali

            $user = JWTAuth::user(); // Mendapatkan pengguna yang sedang login
            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 401);
            }
            
            // Validasi input
            $this->validate($request, [
                'customer_name' => 'required|string|max:255',
                'order_date' => 'required|date',
                'items' => 'required|array|min:1',  // Memastikan ada minimal satu item dalam order 
                'items.*.product_id' => 'required|integer|exists:products,id',
                'items.*.quantity' => 'required|integer|min:1'
            ],
            [
                'customer_name.required' => 'Nama pelanggan harus diisi',
                'order_date.required' => 'Tanggal order harus diisi',
                'items.required' => 'Minimal satu item harus ada dalam order',
                'items.*.product_id.required' => 'ID produk harus diisi',
                'items.*.product_id.exists' => 'ID produk tidak ditemukan',
                'items.*.quantity.required' => 'Jumlah produk harus diisi',
                'items.*.quantity.min' => 'Jumlah produk minimal 1'
            ]);

            // Buat order baru
            $order = new Order();
            $order->user_id = $user->id;
            $order->customer_name = $request->customer_name;
            $order->order_date = $request->order_date; // Menggunakan tanggal order dari request 
            $order->save();

            $totalPrice = 0;

            // Proses items
            foreach ($request->items as $item) {
                $product = Product::find($item['product_id']);

                // Cek stok
                if ($product->stock < $item['quantity']) {
                    DB::rollBack(); // Rollback transaksi jika stok tidak mencukupi 
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Stok produk ' . $product->name . ' tidak mencukupi'
                    ], 400);
                }

                // Hitung subtotal
                $subtotal = $product->price * $item['quantity'];
                $totalPrice += $subtotal;

                // Buat order item
                $orderItem = new OrderItem();
                $orderItem->order_id = $order->id;
                $orderItem->product_id = $product->id;
                $orderItem->quantity = $item['quantity'];
                $orderItem->price = $product->price;
                $orderItem->subtotal = $subtotal; // Menyimpan subtotal untuk item
                $orderItem->save();

                // Update stok
                $product->stock -= $item['quantity'];
                $product->save();
            }

            DB::commit();

            // Load order dengan items dan product
            $order = $order->load('items.product');
            
            // Tambahkan subtotal dan total_price ke response
            $order->items->each(function ($item) {
                $item->subtotal = $item->price * $item->quantity;
            });
            $order->total_price = $order->items->sum('subtotal');

            return response()->json([
                'status' => 'success',
                'message' => 'Order berhasil dibuat',
                'data' => $order
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack(); // Rollback transaksi jika terjadi kesalahan
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal membuat order',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
