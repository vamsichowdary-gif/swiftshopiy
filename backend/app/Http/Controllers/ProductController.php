<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    // GET: List all products
    public function index()
    {
        return response()->json(Product::orderBy('id', 'desc')->get());
    }

    // POST: Create a product
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'price' => 'required|numeric|min:0',
            'rating' => 'nullable|numeric|min:0|max:5',
            'reviews' => 'nullable|integer|min:0',
            'image' => 'required|string',
            'description' => 'required|string',
        ]);

        $product = Product::create($validated);
        return response()->json($product, 201);
    }

    // PUT: Update an existing product
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'category' => 'sometimes|required|string|max:100',
            'price' => 'sometimes|required|numeric|min:0',
            'rating' => 'nullable|numeric|min:0|max:5',
            'reviews' => 'nullable|integer|min:0',
            'image' => 'sometimes|required|string',
            'description' => 'sometimes|required|string',
        ]);

        $product->update($validated);
        return response()->json($product);
    }

    // DELETE: Remove a product
    public function destroy(Product $product)
    {
        $product->delete();
        return response()->json(['message' => 'Product deleted successfully']);
    }
}