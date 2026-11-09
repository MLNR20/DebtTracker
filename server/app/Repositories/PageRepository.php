<?php

namespace App\Repositories;

use App\Models\Page;
use App\Repositories\Contracts\PageRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class PageRepository extends BaseRepository implements PageRepositoryInterface
{
    protected array $searchable = ['page_key', 'page_name', 'page_path', 'page_group'];

    public function __construct(Page $model)
    {
        parent::__construct($model);
    }

    public function all(): Collection
    {
        return $this->newQuery()->orderBy('sort_order')->orderBy('page_name')->get();
    }
}
