<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Traits\LogsActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    use LogsActivity;

    public function __construct(protected UserRepositoryInterface $users)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->integer('per_page', 15);
        $search = $request->string('search')->value() ?: null;

        return response()->json($this->users->paginate($perPage, $search, ['role']));
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['password'] = Hash::make($data['password']);

        $user = $this->users->create($data);

        $this->logActivity('user_created', "Created user {$user->user_name}");

        return response()->json($user->load('role'), 201);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json($user->load('role'));
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $data = $request->validated();

        if (! empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $updated = $this->users->update($user->user_id, $data);

        $this->logActivity('user_updated', "Updated user {$updated->user_name}");

        return response()->json($updated->load('role'));
    }

    public function destroy(User $user): JsonResponse
    {
        $this->logActivity('user_deleted', "Deleted user {$user->user_name}");

        $this->users->softDelete($user->user_id);

        return response()->json(null, 204);
    }
}
