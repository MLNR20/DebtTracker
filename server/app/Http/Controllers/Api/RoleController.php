<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use App\Models\Role;
use App\Repositories\Contracts\RoleRepositoryInterface;
use App\Traits\LogsActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

        return response()->json($this->roles->paginate($perPage, $search));
    }

    public function store(StoreRoleRequest $request): JsonResponse
    {
        $role = $this->roles->create($request->validated());

        $this->logActivity('role_created', "Created role {$role->role_name}");

        return response()->json($role, 201);
    }

    public function show(Role $role): JsonResponse
    {
        return response()->json($role);
    }

    public function update(UpdateRoleRequest $request, Role $role): JsonResponse
    {
        $updated = $this->roles->update($role->role_id, $request->validated());

        $this->logActivity('role_updated', "Updated role {$updated->role_name}");

        return response()->json($updated);
    }

    public function destroy(Role $role): JsonResponse
    {
        $this->logActivity('role_deleted', "Deleted role {$role->role_name}");

        $this->roles->delete($role->role_id);

        return response()->json(null, 204);
    }
}
