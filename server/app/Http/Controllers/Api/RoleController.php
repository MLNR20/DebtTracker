<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\SyncRolePagesRequest;
use App\Http\Requests\UpdateRoleRequest;
use App\Models\Role;
use App\Repositories\Contracts\RoleRepositoryInterface;
use App\Traits\LogsActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class RoleController extends Controller
{
    use LogsActivity;

    public function __construct(protected RoleRepositoryInterface $roles)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->integer('per_page', 15);
        $search = $request->string('search')->value() ?: null;

        return response()->json($this->roles->paginate($perPage, $search, ['pages']));
    }

    public function store(StoreRoleRequest $request): JsonResponse
    {
        $data = $request->validated();
        $pageIds = $data['page_ids'] ?? [];
        unset($data['page_ids']);

        $role = $this->roles->create($data);
        $role->pages()->sync($pageIds);

        $this->logActivity('role_created', "Created role {$role->role_name}");

        return response()->json($role->refresh()->load('pages'), 201);
    }

    public function show(Role $role): JsonResponse
    {
        return response()->json($role->load('pages'));
    }

    public function update(UpdateRoleRequest $request, Role $role): JsonResponse
    {
        $data = $request->validated();
        $pageIds = $data['page_ids'] ?? null;
        unset($data['page_ids']);

        if ($role->is_admin && array_key_exists('is_admin', $data) && ! $data['is_admin']
            && Role::where('is_admin', true)->count() <= 1) {
            throw ValidationException::withMessages([
                'is_admin' => ['At least one admin role must remain.'],
            ]);
        }

        $updated = $this->roles->update($role->role_id, $data);

        if ($pageIds !== null) {
            $updated->pages()->sync($pageIds);
        }

        $this->logActivity('role_updated', "Updated role {$updated->role_name}");

        return response()->json($updated->load('pages'));
    }

    public function destroy(Role $role): JsonResponse
    {
        if ($role->is_admin) {
            return response()->json(['message' => 'Admin roles cannot be deleted.'], 422);
        }

        if ($role->users()->exists()) {
            return response()->json(['message' => 'This role is assigned to users. Reassign them before deleting it.'], 409);
        }

        $this->logActivity('role_deleted', "Deleted role {$role->role_name}");

        $this->roles->delete($role->role_id);

        return response()->json(null, 204);
    }

    public function pages(Role $role): JsonResponse
    {
        return response()->json($role->pages()->orderBy('pages.sort_order')->get());
    }

    public function syncPages(SyncRolePagesRequest $request, Role $role): JsonResponse
    {
        $role->pages()->sync($request->validated()['page_ids']);

        $this->logActivity('role_pages_updated', "Updated page access for role {$role->role_name}");

        return response()->json($role->pages()->orderBy('pages.sort_order')->get());
    }
}
