<?php

namespace App\Repositories;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;

class UserRepository extends BaseRepository implements UserRepositoryInterface
{
    protected array $searchable = ['first_name', 'last_name', 'email_address', 'user_name'];

    public function __construct(User $model)
    {
        parent::__construct($model);
    }
}
