<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Otp extends Model
{
    use HasFactory;

    protected $table = 'otps';

    protected $fillable = [
        'identifier',
        'otp',
        'type',
        'expires_at',
        'verified_at',
        'ip_address',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'verified_at' => 'datetime',
    ];

    /**
     * Check if this OTP is valid and matches the input.
     */
    public function isValid(string $inputOtp): bool
    {
        return (string)$this->otp === (string)$inputOtp
            && $this->expires_at->isFuture()
            && is_null($this->verified_at);
    }
}
