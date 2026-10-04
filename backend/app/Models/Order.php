<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = ['user_id', 'customer_name', 'customer_email', 'total', 'status'];

    protected function casts(): array
    {
        return ['total' => 'decimal:2'];
    }
}
