<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Builder;

/**
 * For models using a boolean `is_deleted` flag instead of Eloquent's
 * timestamp-based SoftDeletes (schema predates it and mixes it with
 * foreign keys pointing at "deleted" rows, so a real delete would break refs).
 */
trait HasIsDeleted
{
    public function scopeNotDeleted(Builder $query): Builder
    {
        return $query->where($this->getTable().'.is_deleted', false);
    }

    public function scopeOnlyDeleted(Builder $query): Builder
    {
        return $query->where($this->getTable().'.is_deleted', true);
    }

    public function markDeleted(): bool
    {
        return $this->update(['is_deleted' => true]);
    }

    public function restoreDeleted(): bool
    {
        return $this->update(['is_deleted' => false]);
    }
}
