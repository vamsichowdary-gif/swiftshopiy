<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('user_id', 16)->nullable()->unique()->after('role');
        });

        // Backfill existing accounts while keeping generated IDs unique.
        \App\Models\User::query()->whereNull('user_id')->each(function ($user) {
            do {
                $userId = 'SW' . str_pad((string) random_int(1, 999999), 6, '0', STR_PAD_LEFT);
            } while (\App\Models\User::where('user_id', $userId)->exists());

            $user->forceFill(['user_id' => $userId])->save();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['user_id']);
            $table->dropColumn('user_id');
        });
    }
};
