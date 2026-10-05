<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username', 50)->nullable()->unique()->after('name');
        });

        \App\Models\User::query()->whereNull('username')->orderBy('id')->each(function ($user) {
            $base = strtolower((string) str($user->email)->before('@')->replaceMatches('/[^a-z0-9_-]/', ''));
            $base = $base !== '' ? substr($base, 0, 40) : 'user';
            $username = $base;
            $suffix = 1;

            while (\App\Models\User::where('username', $username)->exists()) {
                $username = $base . $suffix++;
            }

            $user->forceFill(['username' => $username])->save();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['username']);
            $table->dropColumn('username');
        });
    }
};
