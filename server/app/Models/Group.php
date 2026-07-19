<?php

namespace App\Models;

use App\Models\Concerns\HasIsDeleted;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Group extends Model
{
    use HasUuids, HasIsDeleted;

    protected $primaryKey = 'group_id';

    public $incrementing = false;

    protected $keyType = 'string';

    const CREATED_AT = 'date_created';

    const UPDATED_AT = 'date_updated';

    protected $fillable = [
        'group_name',
        'group_description',
        'created_by',
        'is_deleted',
    ];

    protected $casts = [
        'is_deleted' => 'boolean',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by', 'user_id');
    }

    public function members(): HasMany
    {
        return $this->hasMany(GroupMember::class, 'group_id', 'group_id');
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(GroupExpense::class, 'group_id', 'group_id');
    }
}
