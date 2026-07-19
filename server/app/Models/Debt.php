<?php

namespace App\Models;

use App\Models\Concerns\HasIsDeleted;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Debt extends Model
{
    use HasUuids, HasIsDeleted;

    protected $primaryKey = 'debt_id';

    public $incrementing = false;

    protected $keyType = 'string';

    const CREATED_AT = 'date_created';

    const UPDATED_AT = 'date_updated';

    protected $fillable = [
        'expense_id',
        'creditor_id',
        'debtor_user_id',
        'debtor_contact_id',
        'total_amount',
        'remaining_amount',
        'description',
        'due_date',
        'status',
        'is_deleted',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
        'due_date' => 'datetime',
        'is_deleted' => 'boolean',
    ];

    public function expense(): BelongsTo
    {
        return $this->belongsTo(GroupExpense::class, 'expense_id', 'expense_id');
    }

    public function creditor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creditor_id', 'user_id');
    }

    public function debtorUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'debtor_user_id', 'user_id');
    }

    public function debtorContact(): BelongsTo
    {
        return $this->belongsTo(Contact::class, 'debtor_contact_id', 'contact_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'debt_id', 'debt_id');
    }
}
