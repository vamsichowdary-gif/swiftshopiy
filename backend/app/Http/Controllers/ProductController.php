<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    // GET: List all products
    public function index()
    {
        $products = Product::orderBy('id', 'desc')->get()->map(function ($p) {
            if ($p->image && str_starts_with($p->image, 'http://swiftshopiy-backned.onrender.com')) {
                $p->image = str_replace('http://', 'https://', $p->image);
            }
            return $p;
        });
        return response()->json($products);
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

        $validated['rating'] = isset($validated['rating']) && $validated['rating'] !== '' ? $validated['rating'] : 5.0;
        $validated['reviews'] = isset($validated['reviews']) && $validated['reviews'] !== '' ? $validated['reviews'] : 0;

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

    // POST: Upload single or multiple images directly to public/Products folder
    public function uploadImages(Request $request)
    {
        $folder = public_path('Products');
        if (!File::isDirectory($folder)) {
            File::makeDirectory($folder, 0755, true, true);
        }

        $files = [];
        if ($request->hasFile('images')) {
            $files = $request->file('images');
            if (!is_array($files)) {
                $files = [$files];
            }
        } elseif ($request->hasFile('image')) {
            $file = $request->file('image');
            $files = is_array($file) ? $file : [$file];
        } elseif ($request->hasFile('file')) {
            $file = $request->file('file');
            $files = is_array($file) ? $file : [$file];
        }

        if (empty($files)) {
            return response()->json([
                'message' => 'No image files received. Please provide files under field name "images" or "image".'
            ], 422);
        }

        $uploaded = [];
        $urls = [];
        $baseUrl = rtrim($request->getSchemeAndHttpHost(), '/');
        if (str_contains($baseUrl, 'onrender.com') || $request->header('x-forwarded-proto') === 'https') {
            $baseUrl = str_replace('http://', 'https://', $baseUrl);
        }

        foreach ($files as $file) {
            if (!$file->isValid()) {
                continue;
            }

            $extension = $file->getClientOriginalExtension() ?: 'jpg';
            $uniqueName = 'prod_' . time() . '_' . Str::random(8) . '.' . strtolower($extension);

            $file->move($folder, $uniqueName);

            $publicUrl = $baseUrl . '/Products/' . $uniqueName;
            $urls[] = $publicUrl;
            $uploaded[] = [
                'original_name' => $file->getClientOriginalName(),
                'filename' => $uniqueName,
                'url' => $publicUrl,
                'size' => @filesize($folder . DIRECTORY_SEPARATOR . $uniqueName) ?: 0,
            ];
        }

        return response()->json([
            'message' => count($uploaded) . ' image(s) uploaded successfully.',
            'urls' => $urls,
            'url' => $urls[0] ?? null,
            'files' => $uploaded,
        ], 200);
    }

    // POST: Bulk import products from CSV/JSON or parsed array
    public function bulkImport(Request $request)
    {
        $productsData = [];

        // 1. JSON array provided directly
        if ($request->has('products') && is_array($request->input('products'))) {
            $productsData = $request->input('products');
        }
        // 2. Uploaded file (CSV or JSON)
        elseif ($request->hasFile('file') || $request->hasFile('csv')) {
            $file = $request->file('file') ?: $request->file('csv');
            $ext = strtolower($file->getClientOriginalExtension());
            $content = file_get_contents($file->getRealPath());

            if ($ext === 'json') {
                $parsed = json_decode($content, true);
                $productsData = isset($parsed['products']) ? $parsed['products'] : (is_array($parsed) ? $parsed : []);
            } else {
                // CSV parsing
                $lines = preg_split('/\r\n|\r|\n/', trim($content));
                if (count($lines) > 1) {
                    $headers = str_getcsv(array_shift($lines));
                    $headers = array_map(function ($h) {
                        return strtolower(trim(str_replace(['"', "'", ' '], ['', '', '_'], $h)));
                    }, $headers);

                    foreach ($lines as $line) {
                        if (!trim($line)) continue;
                        $row = str_getcsv($line);
                        if (count($row) === count($headers)) {
                            $productsData[] = array_combine($headers, $row);
                        }
                    }
                }
            }
        }

        if (empty($productsData)) {
            return response()->json([
                'message' => 'No product records found to import. Please check file format.'
            ], 422);
        }

        $imported = [];
        $errors = [];

        foreach ($productsData as $index => $row) {
            $name = trim($row['name'] ?? $row['title'] ?? '');
            $price = floatval($row['price'] ?? 0);
            $category = trim($row['category'] ?? 'Electronics') ?: 'Electronics';
            $description = trim($row['description'] ?? $row['desc'] ?? ($name . ' - High quality standard item'));
            $image = trim($row['image'] ?? $row['image_url'] ?? $row['img'] ?? 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800');
            $rating = isset($row['rating']) && is_numeric($row['rating']) ? floatval($row['rating']) : 5.0;
            $reviews = isset($row['reviews']) && is_numeric($row['reviews']) ? intval($row['reviews']) : 0;

            if (!$name || $price <= 0) {
                $errors[] = "Row #" . ($index + 1) . ": Skipped due to missing name or price.";
                continue;
            }

            try {
                $product = Product::create([
                    'name' => $name,
                    'category' => $category,
                    'price' => $price,
                    'description' => $description,
                    'image' => $image,
                    'rating' => $rating,
                    'reviews' => $reviews,
                ]);
                $imported[] = $product;
            } catch (\Throwable $e) {
                $errors[] = "Row #" . ($index + 1) . ": " . $e->getMessage();
            }
        }

        return response()->json([
            'message' => 'Bulk import completed.',
            'imported_count' => count($imported),
            'failed_count' => count($errors),
            'errors' => $errors,
            'products' => $imported,
        ], 200);
    }
}