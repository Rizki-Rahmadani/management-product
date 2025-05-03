<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    // GET /orders
    public function index()
    {
        $orders = Order::with('items.product')->get();
        return response()->json($orders);
    }

    // POST /orders
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'customer_name' => 'required|string|min:3',
            'order_date'    => 'required|date',
            'items'         => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1',
        ], [
            'customer_name.required' => 'Customer name is required.',
            'customer_name.min'      => 'Customer name must be at least 3 characters.',
            'order_date.required'    => 'Order date is required.',
            'order_date.date'        => 'Order date must be a valid date.',
            'items.required'         => 'At least one item is required.',
            'items.array'            => 'Items must be an array.',
            'items.*.product_id.required' => 'Product ID is required for each item.',
            'items.*.product_id.exists'   => 'Product ID :input does not exist.',
            'items.*.quantity.required'   => 'Quantity is required for each item.',
            'items.*.quantity.integer'    => 'Quantity must be an integer.',
            'items.*.quantity.min'        => 'Quantity must be at least 1.',
        ]);
        

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $order = Order::create([
                'customer_name' => $request->customer_name,
                'order_date'    => $request->order_date,
            ]);

            foreach ($request->items as $item) {
                $product = Product::find($item['product_id']);

                if ($product->stock < $item['quantity']) {
                    DB::rollBack();
                    return response()->json([
                        'error' => "Insufficient stock for product ID {$product->id}"
                    ], 400);
                }

                // kurangi stok produk
                $product->stock -= $item['quantity'];
                $product->save();

                OrderItem::create([
                    'order_id'   => $order->id,
                    'product_id' => $product->id,
                    'quantity'   => $item['quantity'],
                    'price'      => $product->price,
                ]);
            }

            DB::commit();
            return response()->json($order->load('items.product'), 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to create order', 'details' => $e->getMessage()], 500);
        }
    }
}
