<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('orders', 'items')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->json('items')->nullable();
            });
        }
    }

    public function down(): void
    {
        // Preserve order line items if this column was already present.
    }
};
