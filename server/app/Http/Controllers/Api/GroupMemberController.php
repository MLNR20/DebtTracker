<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGroupMemberRequest;
use App\Http\Requests\UpdateGroupMemberRequest;
use App\Models\GroupMember;
use App\Repositories\Contracts\GroupMemberRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GroupMemberController extends Controller
{
    public function __construct(protected GroupMemberRepositoryInterface $groupMembers)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->integer('per_page', 15);
        $search = $request->string('search')->value() ?: null;

        return response()->json($this->groupMembers->paginate($perPage, $search, ['group', 'user']));
    }

    public function store(StoreGroupMemberRequest $request): JsonResponse
    {
        $groupMember = $this->groupMembers->create($request->validated());

        return response()->json($groupMember->load(['group', 'user']), 201);
    }

    public function show(GroupMember $groupMember): JsonResponse
    {
        return response()->json($groupMember->load(['group', 'user']));
    }

    public function update(UpdateGroupMemberRequest $request, GroupMember $groupMember): JsonResponse
    {
        $updated = $this->groupMembers->update($groupMember->group_member_id, $request->validated());

        return response()->json($updated->load(['group', 'user']));
    }

    public function destroy(GroupMember $groupMember): JsonResponse
    {
        $this->groupMembers->delete($groupMember->group_member_id);

        return response()->json(null, 204);
    }
}
