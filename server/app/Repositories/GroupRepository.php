<?php

namespace App\Repositories;

use App\Models\Group;
use App\Repositories\Contracts\GroupRepositoryInterface;

class GroupRepository extends BaseRepository implements GroupRepositoryInterface
{
    protected array $searchable = ['group_name', 'group_description'];

    public function __construct(Group $model)
    {
        parent::__construct($model);
    }
}
