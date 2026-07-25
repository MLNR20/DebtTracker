<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGroupMemberRequest;
use App\Http\Requests\UpdateGroupMemberRequest;
use App\Models\GroupMember;
use App\Repositories\Contracts\GroupMemberRepositoryInterface;
use App\Traits\LogsActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GroupMemberController extends Controller
{
    use LogsActivity;

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

        $this->logActivity('group_member_added', "Added member to group {$groupMember->group_id}");

        return response()->json($groupMember->load(['group', 'user']), 201);
    }

    public function show(GroupMember $groupMember): JsonResponse
    {
        return response()->json($groupMember->load(['group', 'user']));
    }

    public function update(UpdateGroupMemberRequest $request, GroupMember $groupMember): JsonResponse
    {
        $updated = $this->groupMembers->update($groupMember->group_member_id, $request->validated());

        $this->logActivity('group_member_updated', "Updated member in group {$updated->group_id}");

        return response()->json($updated->load(['group', 'user']));
    }

    public function destroy(GroupMember $groupMember): JsonResponse
    {
        $this->logActivity('group_member_removed', "Removed member from group {$groupMember->group_id}");

        $this->groupMembers->delete($groupMember->group_member_id);

        return response()->json(null, 204);
    }
}
