<?php

namespace App\Repositories;

use App\Models\GroupExpense;
use App\Repositories\Contracts\GroupExpenseRepositoryInterface;

class GroupExpenseRepository extends BaseRepository implements GroupExpenseRepositoryInterface
{
    protected array $searchable = ['description', 'split_type'];

    public function __construct(GroupExpense $model)
    {
        parent::__construct($model);
    }
}
