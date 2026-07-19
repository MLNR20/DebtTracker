<?php

namespace App\Repositories;

use App\Models\Debt;
use App\Repositories\Contracts\DebtRepositoryInterface;

class DebtRepository extends BaseRepository implements DebtRepositoryInterface
{
    protected array $searchable = ['description', 'status'];

    public function __construct(Debt $model)
    {
        parent::__construct($model);
    }
}
