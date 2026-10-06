<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class FlashDealController extends Controller
{
    private function getDealsFilePath(): string
    {
        $dir = storage_path('app');
        if (!File::isDirectory($dir)) {
            File::makeDirectory($dir, 0755, true, true);
        }
        return $dir . DIRECTORY_SEPARATOR . 'flash_deals.json';
    }

    private function getNewsFilePath(): string
    {
        $dir = storage_path('app');
        if (!File::isDirectory($dir)) {
            File::makeDirectory($dir, 0755, true, true);
        }
        return $dir . DIRECTORY_SEPARATOR . 'news_ticker.json';
    }

    private function loadDeals(): array
    {
        $path = $this->getDealsFilePath();
        if (File::exists($path)) {
            $content = File::get($path);
            $decoded = json_decode($content, true);
            if (is_array($decoded)) {
                return $decoded;
            }
        }

        // Default initial deals
        $defaults = [
            [
                'id' => 1,
                'title' => '⚡ Super Midnight Flash Sale',
                'discount' => '40% OFF',
                'description' => 'Exclusive limited-time discount on top trending tech & everyday accessories.',
                'end_time' => date('Y-m-d\TH:i:s\Z', strtotime('+48 hours')),
                'is_active' => true,
                'created_at' => date('c'),
            ],
        ];
        $this->saveDeals($defaults);
        return $defaults;
    }

    private function saveDeals(array $deals): void
    {
        File::put($this->getDealsFilePath(), json_encode(array_values($deals), JSON_PRETTY_PRINT));
    }

    private function loadNews(): array
    {
        $path = $this->getNewsFilePath();
        if (File::exists($path)) {
            $content = File::get($path);
            $decoded = json_decode($content, true);
            if (is_array($decoded)) {
                return $decoded;
            }
        }

        // Default initial news
        $defaults = [
            [
                'id' => 1,
                'badge' => 'FLASH DEAL',
                'text' => '⚡ 40% OFF on all smart accessories & gadgets! Use code FLASH40 at checkout.',
                'is_active' => true,
                'created_at' => date('c'),
            ],
            [
                'id' => 2,
                'badge' => 'FREE SHIPPING',
                'text' => '📦 Complimentary express delivery on all orders over $100 worldwide.',
                'is_active' => true,
                'created_at' => date('c'),
            ],
            [
                'id' => 3,
                'badge' => 'NEW ARRIVALS',
                'text' => '✨ New 2026 Collection just arrived in store! Explore the freshest designs in your dashboard.',
                'is_active' => true,
                'created_at' => date('c'),
            ],
            [
                'id' => 4,
                'badge' => 'EXCLUSIVE',
                'text' => '💎 Registered customers receive instant scannable barcode invoices with every order.',
                'is_active' => true,
                'created_at' => date('c'),
            ],
        ];
        $this->saveNews($defaults);
        return $defaults;
    }

    private function saveNews(array $news): void
    {
        File::put($this->getNewsFilePath(), json_encode(array_values($news), JSON_PRETTY_PRINT));
    }

    // Public API: GET /api/flash-deals
    public function getPublic()
    {
        $deals = array_filter($this->loadDeals(), function ($d) {
            return !empty($d['is_active']);
        });

        $news = array_filter($this->loadNews(), function ($n) {
            return !empty($n['is_active']);
        });

        return response()->json([
            'deals' => array_values($deals),
            'news' => array_values($news),
        ]);
    }

    // Admin API: GET /api/admin/flash-deals
    public function adminIndex()
    {
        return response()->json([
            'deals' => $this->loadDeals(),
            'news' => $this->loadNews(),
        ]);
    }

    // Admin API: POST /api/admin/flash-deals
    public function storeDeal(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:200',
            'discount' => 'nullable|string|max:50',
            'description' => 'nullable|string|max:500',
            'end_time' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $deals = $this->loadDeals();
        $newDeal = [
            'id' => time() . rand(10, 99),
            'title' => $validated['title'],
            'discount' => $validated['discount'] ?? '30% OFF',
            'description' => $validated['description'] ?? '',
            'end_time' => $validated['end_time'] ?? date('Y-m-d\TH:i:s\Z', strtotime('+24 hours')),
            'is_active' => isset($validated['is_active']) ? (bool) $validated['is_active'] : true,
            'created_at' => date('c'),
        ];

        array_unshift($deals, $newDeal);
        $this->saveDeals($deals);

        return response()->json(['message' => 'Flash deal saved successfully', 'deal' => $newDeal], 201);
    }

    // Admin API: PATCH /api/admin/flash-deals/{id}/toggle
    public function toggleDeal($id)
    {
        $deals = $this->loadDeals();
        $found = false;
        foreach ($deals as &$d) {
            if (strval($d['id']) === strval($id)) {
                $d['is_active'] = empty($d['is_active']);
                $found = true;
                break;
            }
        }

        if (!$found) {
            return response()->json(['message' => 'Deal not found'], 404);
        }

        $this->saveDeals($deals);
        return response()->json(['message' => 'Deal status updated', 'deals' => $deals]);
    }

    // Admin API: DELETE /api/admin/flash-deals/{id}
    public function destroyDeal($id)
    {
        $deals = $this->loadDeals();
        $filtered = array_filter($deals, function ($d) use ($id) {
            return strval($d['id']) !== strval($id);
        });

        $this->saveDeals(array_values($filtered));
        return response()->json(['message' => 'Deal removed successfully']);
    }

    // Admin API: POST /api/admin/news
    public function storeNews(Request $request)
    {
        $validated = $request->validate([
            'text' => 'required|string|max:500',
            'badge' => 'nullable|string|max:50',
            'is_active' => 'nullable|boolean',
        ]);

        $news = $this->loadNews();
        $newItem = [
            'id' => time() . rand(10, 99),
            'text' => $validated['text'],
            'badge' => $validated['badge'] ?? 'NEWS',
            'is_active' => isset($validated['is_active']) ? (bool) $validated['is_active'] : true,
            'created_at' => date('c'),
        ];

        array_unshift($news, $newItem);
        $this->saveNews($news);

        return response()->json(['message' => 'News item created', 'news_item' => $newItem], 201);
    }

    // Admin API: PATCH /api/admin/news/{id}/toggle
    public function toggleNews($id)
    {
        $news = $this->loadNews();
        $found = false;
        foreach ($news as &$n) {
            if (strval($n['id']) === strval($id)) {
                $n['is_active'] = empty($n['is_active']);
                $found = true;
                break;
            }
        }

        if (!$found) {
            return response()->json(['message' => 'News item not found'], 404);
        }

        $this->saveNews($news);
        return response()->json(['message' => 'News status updated', 'news' => $news]);
    }

    // Admin API: DELETE /api/admin/news/{id}
    public function destroyNews($id)
    {
        $news = $this->loadNews();
        $filtered = array_filter($news, function ($n) use ($id) {
            return strval($n['id']) !== strval($id);
        });

        $this->saveNews(array_values($filtered));
        return response()->json(['message' => 'News item removed successfully']);
    }
}
