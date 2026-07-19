<?php

namespace App\Repositories;

use App\Models\Role;
use App\Repositories\Contracts\RoleRepositoryInterface;

class RoleRepository extends BaseRepository implements RoleRepositoryInterface
{
    protected array $searchable = ['role_name'];

    public function __construct(Role $model)
    {
        parent::__construct($model);
    }
}
