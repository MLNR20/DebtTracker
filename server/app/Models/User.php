<?php

namespace App\Models;

use App\Models\Concerns\HasIsDeleted;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasUuids, Notifiable, HasIsDeleted;

    protected $primaryKey = 'user_id';

    public $incrementing = false;

    protected $keyType = 'string';

    const CREATED_AT = 'date_created';

    const UPDATED_AT = 'date_updated';

    protected $fillable = [
        'role_id',
        'first_name',
        'last_name',
        'email_address',
        'contact_no',
        'user_name',
        'password',
        'is_active',
        'is_deleted',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_deleted' => 'boolean',
    ];


    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'role_id', 'role_id');
    }

    public function isAdmin(): bool
    {
        return (bool) $this->role?->is_admin;
    }

    /**
     * Pages this user may open: every page for admin roles, otherwise the
     * pages assigned to their role (none when they have no role).
     */
    public function accessiblePages(): Collection
    {
        if (! $this->role) {
            return new Collection();
        }

        $query = $this->isAdmin() ? Page::query() : $this->role->pages();

        return $query->orderBy('pages.sort_order')->get();
    }

    /**
     * @param  array<int, string>  $pageKeys  access is granted when ANY of these is allowed
     */
    public function canAccessAnyPage(array $pageKeys): bool
    {
        if ($this->isAdmin()) {
            return true;
        }

        if (! $this->role) {
            return false;
        }

        return $this->role->pages()->whereIn('pages.page_key', $pageKeys)->exists();
    }

    /**
     * Shape returned to the client so it can build navigation and route guards.
     */
    public function accessPayload(): array
    {
        $this->loadMissing('role');

        return [
            'role' => $this->role?->only(['role_id', 'role_name', 'is_admin']),
            'is_admin' => $this->isAdmin(),
            'pages' => $this->accessiblePages()
                ->map(fn (Page $page) => $page->only(['page_id', 'page_key', 'page_name', 'page_path', 'page_group', 'sort_order']))
                ->values(),
        ];
    }

    public function contacts(): HasMany
    {
        return $this->hasMany(Contact::class, 'user_id', 'user_id');
    }

    public function groups(): HasMany
    {
        return $this->hasMany(Group::class, 'created_by', 'user_id');
    }

    public function groupMemberships(): HasMany
    {
        return $this->hasMany(GroupMember::class, 'user_id', 'user_id');
    }

    public function debtsOwed(): HasMany
    {
        return $this->hasMany(Debt::class, 'creditor_id', 'user_id');
    }

    public function debtsOwing(): HasMany
    {
        return $this->hasMany(Debt::class, 'debtor_user_id', 'user_id');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'user_id', 'user_id');
    }

    public function logs(): HasMany
    {
        return $this->hasMany(Log::class, 'user_id', 'user_id');
    }
}
