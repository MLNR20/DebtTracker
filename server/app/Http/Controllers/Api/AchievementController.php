<?php

namespace App\Http\Controllers\Api;

use App\DTOs\AchievementData;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAchievementRequest;
use App\Http\Requests\UpdateAchievementRequest;
use App\Models\Achievement;
use App\Repositories\Contracts\AchievementRepositoryInterface;
use App\Traits\LogsActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AchievementController extends Controller
{
    use LogsActivity;

    public function __construct(protected AchievementRepositoryInterface $achievements)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->integer('per_page', 15);
        $search = $request->string('search')->value() ?: null;

        $page = $this->achievements->paginate($perPage, $search);
        $page->through(fn (Achievement $achievement) => AchievementData::fromModel($achievement)->toArray());

        return response()->json($page);
    }

    public function store(StoreAchievementRequest $request): JsonResponse
    {
        $dto = AchievementData::fromRequest($request);

        $achievement = $this->achievements->create($dto->toPersistable());

        $this->logActivity('achievement_created', "Created achievement {$achievement->name}");

        return response()->json(AchievementData::fromModel($achievement->refresh())->toArray(), 201);
    }

    public function show(Achievement $achievement): JsonResponse
    {
        abort_if($achievement->is_deleted, 404);

        return response()->json(AchievementData::fromModel($achievement)->toArray());
    }

    public function update(UpdateAchievementRequest $request, Achievement $achievement): JsonResponse
    {
        abort_if($achievement->is_deleted, 404);

        $dto = AchievementData::fromRequest($request);

        $updated = $this->achievements->update(
            $achievement->achievement_id,
            $dto->toPersistable(array_keys($request->validated())),
        );

        $this->logActivity('achievement_updated', "Updated achievement {$updated->name}");

        return response()->json(AchievementData::fromModel($updated)->toArray());
    }

    public function destroy(Achievement $achievement): JsonResponse
    {
        abort_if($achievement->is_deleted, 404);

        $this->logActivity('achievement_deleted', "Deleted achievement {$achievement->name}");

        $this->achievements->softDelete($achievement->achievement_id);

        return response()->json(null, 204);
    }
}
