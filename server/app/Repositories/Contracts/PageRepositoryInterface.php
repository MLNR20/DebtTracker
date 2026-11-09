<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;

interface PageRepositoryInterface extends RepositoryInterface
{
    public function all(): Collection;
}
