<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGroupRequest;
use App\Http\Requests\UpdateGroupRequest;
use App\Models\Group;
use App\Repositories\Contracts\GroupRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GroupController extends Controller
{
    public function __construct(protected GroupRepositoryInterface $groups)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->integer('per_page', 15);
        $search = $request->string('search')->value() ?: null;

        return response()->json($this->groups->paginate($perPage, $search, ['creator']));
    }

    public function store(StoreGroupRequest $request): JsonResponse
    {
        $group = $this->groups->create($request->validated());

        return response()->json($group->load('creator'), 201);
    }

    public function show(Group $group): JsonResponse
    {
        return response()->json($group->load('creator'));
    }

    public function update(UpdateGroupRequest $request, Group $group): JsonResponse
    {
        $updated = $this->groups->update($group->group_id, $request->validated());

        return response()->json($updated->load('creator'));
    }

    public function destroy(Group $group): JsonResponse
    {
        $this->groups->softDelete($group->group_id);

        return response()->json(null, 204);
    }
}
