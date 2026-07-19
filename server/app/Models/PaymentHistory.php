<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentHistory extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $primaryKey = 'history_id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'payment_id',
        'debt_id',
        'paid_amount',
        'payment_type',
        'remarks',
        'remaining_amount',
    ];

    protected $casts = [
        'paid_amount' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
        'created_at' => 'datetime',
    ];

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class, 'payment_id', 'payment_id');
    }

    public function debt(): BelongsTo
    {
        return $this->belongsTo(Debt::class, 'debt_id', 'debt_id');
    }
}
