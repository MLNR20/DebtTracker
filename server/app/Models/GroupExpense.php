<?php

namespace App\Models;

use App\Models\Concerns\HasIsDeleted;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GroupExpense extends Model
{
    use HasUuids, HasIsDeleted;

    protected $primaryKey = 'expense_id';

    public $incrementing = false;

    protected $keyType = 'string';

    const CREATED_AT = 'date_created';

    const UPDATED_AT = null;

    protected $fillable = [
        'group_id',
        'paid_by_user_id',
        'total_amount',
        'description',
        'split_type',
        'date_incurred',
        'is_deleted',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'date_incurred' => 'datetime',
        'is_deleted' => 'boolean',
    ];

    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class, 'group_id', 'group_id');
    }

    public function payer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'paid_by_user_id', 'user_id');
    }

    public function debts(): HasMany
    {
        return $this->hasMany(Debt::class, 'expense_id', 'expense_id');
    }
}
