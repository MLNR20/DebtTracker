<?php

namespace App\Models;

use App\Models\Concerns\HasIsDeleted;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasUuids, HasIsDeleted;

    protected $primaryKey = 'payment_id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'debt_id',
        'paid_amount',
        'payment_type',
        'proof_img_url',
        'remarks',
        'is_deleted',
    ];

    protected $casts = [
        'paid_amount' => 'decimal:2',
        'is_deleted' => 'boolean',
    ];

    public function debt(): BelongsTo
    {
        return $this->belongsTo(Debt::class, 'debt_id', 'debt_id');
    }
}
