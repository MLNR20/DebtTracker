<?php

namespace App\Repositories;

use App\Models\Achievement;
use App\Repositories\Contracts\AchievementRepositoryInterface;

class AchievementRepository extends BaseRepository implements AchievementRepositoryInterface
{
    protected array $searchable = ['name', 'description'];

    public function __construct(Achievement $model)
    {
        parent::__construct($model);
    }
}
