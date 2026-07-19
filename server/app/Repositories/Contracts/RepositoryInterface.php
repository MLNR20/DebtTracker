<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

interface RepositoryInterface
{
    public function find(string $id): ?Model;

    public function findOrFail(string $id): Model;

    public function create(array $data): Model;

    public function update(string $id, array $data): Model;

    public function delete(string $id): bool;

    public function softDelete(string $id): bool;

    public function paginate(int $perPage = 15, ?string $search = null, array $with = []): LengthAwarePaginator;
}
