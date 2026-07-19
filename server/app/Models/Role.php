<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    use HasUuids;

    protected $primaryKey = 'role_id';

    public $incrementing = false;

    protected $keyType = 'string';

    const CREATED_AT = 'date_created';

    const UPDATED_AT = 'date_updated';

    protected $fillable = [
        'role_name',
    ];

    public function getRouteKeyName(): string
    {
        return 'role_id';
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'role_id', 'role_id');
    }
}
