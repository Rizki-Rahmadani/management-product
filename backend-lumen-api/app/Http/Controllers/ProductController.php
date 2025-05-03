<?php

// app/Http/Controllers/ProductController.php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    // GET /products
    public function index()
    {
        return response()->json(Product::all());
    }

    // POST /products
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'  => 'required|min:3',
            'price' => 'required|numeric|min:0.01',
            'stock' => 'required|integer|min:0',
        ], [
            'name.required'  => 'Nama produk wajib diisi.',
            'name.min'       => 'Nama produk minimal harus terdiri dari :min karakter.',
            'price.required' => 'Harga produk wajib diisi.',
            'price.numeric'  => 'Harga produk harus berupa angka.',
            'price.min'      => 'Harga produk minimal :min.',
            'stock.required' => 'Stok produk wajib diisi.',
            'stock.integer'  => 'Stok produk harus berupa angka bulat.',
            'stock.min'      => 'Stok produk tidak boleh kurang dari :min.',
        ]);
        

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $product = Product::create($request->only(['name', 'price', 'stock']));
        return response()->json($product, 201);
    }

    // PUT /products/{id}
    public function update(Request $request, $id)
    {
        $product = Product::find($id);
        if (!$product) return response()->json(['error' => 'Product not found'], 404);

        $validator = Validator::make($request->all(), [
            'name'  => 'required|min:3',
            'price' => 'required|numeric|min:0.01',
            'stock' => 'required|integer|min:0',
        ], [
            'name.required'  => 'Nama produk wajib diisi.',
            'name.min'       => 'Nama produk minimal harus terdiri dari :min karakter.',
            'price.required' => 'Harga produk wajib diisi.',
            'price.numeric'  => 'Harga produk harus berupa angka.',
            'price.min'      => 'Harga produk minimal :min.',
            'stock.required' => 'Stok produk wajib diisi.',
            'stock.integer'  => 'Stok produk harus berupa angka bulat.',
            'stock.min'      => 'Stok produk tidak boleh kurang dari :min.',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $product->update($request->only(['name', 'price', 'stock']));
        return response()->json($product);
    }

}
