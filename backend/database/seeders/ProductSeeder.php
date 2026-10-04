<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'name' => 'Wireless ANC Headphones',
                'category' => 'Electronics',
                'price' => 199.99,
                'rating' => 4.8,
                'reviews' => 124,
                'image' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
                'description' => 'High-fidelity wireless sound with ultra-low latency and active noise cancellation.'
            ],
            [
                'name' => 'Minimalist Mechanical Watch',
                'category' => 'Accessories',
                'price' => 149.50,
                'rating' => 4.9,
                'reviews' => 89,
                'image' => 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
                'description' => 'Sleek automatic movement watch crafted with surgical stainless steel.'
            ],
            [
                'name' => 'Ergonomic Ceramic Mug',
                'category' => 'Home',
                'price' => 24.00,
                'rating' => 4.6,
                'reviews' => 45,
                'image' => 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80',
                'description' => 'Handcrafted matte ceramic coffee mug designed for everyday comfort.'
            ],
            [
                'name' => 'Leather Messenger Bag',
                'category' => 'Accessories',
                'price' => 119.00,
                'rating' => 4.7,
                'reviews' => 62,
                'image' => 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80',
                'description' => 'Premium full-grain leather laptop satchel with brass accents.'
            ],
            [
                'name' => 'Smart Fitness Tracker',
                'category' => 'Electronics',
                'price' => 79.99,
                'rating' => 4.5,
                'reviews' => 210,
                'image' => 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&q=80',
                'description' => '24/7 heart rate, sleep monitoring, waterproof design, and 7-day battery life.'
            ],
            [
                'name' => 'Aroma Diffuser & Humidifier',
                'category' => 'Home',
                'price' => 39.90,
                'rating' => 4.7,
                'reviews' => 98,
                'image' => 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&q=80',
                'description' => 'Ultrasonic cool mist essential oil diffuser with ambient warm light.'
            ]
        ];

        foreach ($products as $p) {
            Product::create($p);
        }
    }
}