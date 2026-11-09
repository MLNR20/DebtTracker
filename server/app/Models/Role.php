<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    use HasUuids;

    public const ADMIN_NAME = 'Admin';

    public const DEFAULT_USER_NAME = 'User';

    protected $primaryKey = 'role_id';

    public $incrementing = false;

    protected $keyType = 'string';

    const CREATED_AT = 'date_created';

    const UPDATED_AT = 'date_updated';

    protected $fillable = [
        'role_name',
        'is_admin',
    ];

    protected $casts = [
        'is_admin' => 'boolean',
    ];

    public function getRouteKeyName(): string
    {
        return 'role_id';
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'role_id', 'role_id');
    }

    public function pages(): BelongsToMany
    {
        return $this->belongsToMany(Page::class, 'role_pages', 'role_id', 'page_id')
            ->using(RolePage::class);
    }
}
