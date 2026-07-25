<?php

namespace App\Repositories;

use App\Models\Log;
use App\Repositories\Contracts\LogRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

class LogRepository extends BaseRepository implements LogRepositoryInterface
{
    protected array $searchable = ['logs_type', 'logs_details'];

    public function __construct(Log $model)
    {
        parent::__construct($model);
    }

    public function paginate(int $perPage = 15, ?string $search = null, array $with = []): LengthAwarePaginator
    {
        return parent::paginate($perPage, $search, $with === [] ? ['user'] : $with);
    }

    protected function newQuery(): Builder
    {
        return parent::newQuery()->orderByDesc('date_created');
    }
}
