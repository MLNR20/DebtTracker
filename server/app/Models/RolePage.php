<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

/**
 * Join model granting a Role access to a Page (composite key: role_id + page_id).
 */
class RolePage extends Pivot
{
    protected $table = 'role_pages';

    public $incrementing = false;

    public $timestamps = false;

    protected $fillable = [
        'role_id',
        'page_id',
    ];

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'role_id', 'role_id');
    }

    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class, 'page_id', 'page_id');
    }
}
