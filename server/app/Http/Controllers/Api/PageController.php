<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePageRequest;
use App\Http\Requests\UpdatePageRequest;
use App\Models\Page;
use App\Repositories\Contracts\PageRepositoryInterface;
use App\Traits\LogsActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PageController extends Controller
{
    use LogsActivity;

    public function __construct(protected PageRepositoryInterface $pages)
    {
    }

    /**
     * Paginated by default; `?all=1` returns the whole catalogue (used by the
     * role page-assignment UI).
     */
    public function index(Request $request): JsonResponse
    {
        if ($request->boolean('all')) {
            return response()->json($this->pages->all());
        }

        $perPage = (int) $request->integer('per_page', 15);
        $search = $request->string('search')->value() ?: null;

        return response()->json($this->pages->paginate($perPage, $search));
    }

    public function store(StorePageRequest $request): JsonResponse
    {
        $page = $this->pages->create($request->validated());

        $this->logActivity('page_created', "Created page {$page->page_name}");

        return response()->json($page->refresh(), 201);
    }

    public function show(Page $page): JsonResponse
    {
        return response()->json($page);
    }

    public function update(UpdatePageRequest $request, Page $page): JsonResponse
    {
        $updated = $this->pages->update($page->page_id, $request->validated());

        $this->logActivity('page_updated', "Updated page {$updated->page_name}");

        return response()->json($updated);
    }

    public function destroy(Page $page): JsonResponse
    {
        $this->logActivity('page_deleted', "Deleted page {$page->page_name}");

        $this->pages->delete($page->page_id);

        return response()->json(null, 204);
    }
}
