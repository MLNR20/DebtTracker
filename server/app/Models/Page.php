<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Page extends Model
{
    use HasUuids;

    protected $primaryKey = 'page_id';

    public $incrementing = false;

    protected $keyType = 'string';

    const CREATED_AT = 'date_created';

    const UPDATED_AT = 'date_updated';

    protected $fillable = [
        'page_key',
        'page_name',
        'page_path',
        'page_group',
        'sort_order',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];

    public function getRouteKeyName(): string
    {
        return 'page_id';
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_pages', 'page_id', 'role_id')
            ->using(RolePage::class);
    }
}
