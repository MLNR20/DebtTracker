<?php

namespace App\Repositories;

use App\Models\GroupMember;
use App\Repositories\Contracts\GroupMemberRepositoryInterface;

class GroupMemberRepository extends BaseRepository implements GroupMemberRepositoryInterface
{
    protected array $searchable = [];

    public function __construct(GroupMember $model)
    {
        parent::__construct($model);
    }
}
