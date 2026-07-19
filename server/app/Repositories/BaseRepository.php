<?php

namespace App\Repositories;

use App\Models\Concerns\HasIsDeleted;
use App\Repositories\Contracts\RepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

abstract class BaseRepository implements RepositoryInterface
{
    protected Model $model;

    /**
     * Columns eligible for the `search` term in paginate(). Override in child repos.
     *
     * @var array<int, string>
     */
    protected array $searchable = [];

    public function __construct(Model $model)
    {
        $this->model = $model;
    }

    public function find(string $id): ?Model
    {
        return $this->newQuery()->find($id);
    }

    public function findOrFail(string $id): Model
    {
        return $this->newQuery()->findOrFail($id);
    }

    public function create(array $data): Model
    {
        return $this->model->newInstance()->create($data);
    }

    public function update(string $id, array $data): Model
    {
        $record = $this->findOrFail($id);
        $record->update($data);

        return $record->refresh();
    }

    public function delete(string $id): bool
    {
        $record = $this->findOrFail($id);

        return (bool) $record->delete();
    }

    public function softDelete(string $id): bool
    {
        $record = $this->findOrFail($id);

        if (! $this->supportsIsDeleted()) {
            throw new \RuntimeException(get_class($record).' does not support soft delete (no is_deleted flag).');
        }

        return $record->markDeleted();
    }

    public function restore(string $id): bool
    {
        $record = $this->findOrFail($id);

        if (! $this->supportsIsDeleted()) {
            throw new \RuntimeException(get_class($record).' does not support restore (no is_deleted flag).');
        }

        return $record->restoreDeleted();
    }

    public function paginate(int $perPage = 15, ?string $search = null, array $with = []): LengthAwarePaginator
    {
        $query = $this->newQuery();

        if ($with !== []) {
            $query->with($with);
        }

        if ($this->supportsIsDeleted()) {
            $query->notDeleted();
        }

        if ($search !== null && $search !== '' && $this->searchable !== []) {
            $query->where(function (Builder $builder) use ($search) {
                foreach ($this->searchable as $column) {
                    $builder->orWhere($column, 'like', '%'.$search.'%');
                }
            });
        }

        return $query->paginate($perPage);
    }

    protected function newQuery(): Builder
    {
        return $this->model->newQuery();
    }

    protected function supportsIsDeleted(): bool
    {
        return in_array(HasIsDeleted::class, class_uses_recursive($this->model), true);
    }
}
