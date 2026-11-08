<?php

namespace App\DTOs;

use App\Http\Requests\StoreAchievementRequest;
use App\Http\Requests\UpdateAchievementRequest;
use App\Models\Achievement;

/**
 * Transfer object for achievement input (from validated requests) and output
 * (from the model), so the controller never handles raw arrays or models directly.
 */
class AchievementData
{
    public function __construct(
        public ?string $id,
        public ?string $userId,
        public ?string $name,
        public ?string $description,
        public ?string $icon,
        public ?int $points,
        public ?string $dateCreated = null,
        public ?string $dateUpdated = null,
    ) {
    }

    /**
     * Build from a validated store/update request. The application user id is
     * taken from the authenticated user, never from request input.
     */
    public static function fromRequest(StoreAchievementRequest|UpdateAchievementRequest $request): self
    {
        $data = $request->validated();

        return new self(
            id: null,
            userId: $request->user()?->getKey(),
            name: $data['name'] ?? null,
            description: $data['description'] ?? null,
            icon: $data['icon'] ?? null,
            points: isset($data['points']) ? (int) $data['points'] : null,
        );
    }

    public static function fromModel(Achievement $achievement): self
    {
        return new self(
            id: $achievement->achievement_id,
            userId: $achievement->user_id,
            name: $achievement->name,
            description: $achievement->description,
            icon: $achievement->icon,
            points: $achievement->points,
            dateCreated: optional($achievement->date_created)->toIso8601String(),
            dateUpdated: optional($achievement->date_updated)->toIso8601String(),
        );
    }

    /**
     * Attributes to persist. On create (`$only === null`) the owning user id is
     * included; on update only the given keys are written, so the owner is kept
     * and a partial update does not blank other columns.
     *
     * @param  array<int, string>|null  $only  Limit to these keys (e.g. the validated request keys).
     * @return array<string, mixed>
     */
    public function toPersistable(?array $only = null): array
    {
        $attributes = [
            'name' => $this->name,
            'description' => $this->description,
            'icon' => $this->icon,
            'points' => $this->points,
        ];

        if ($only === null) {
            $attributes['user_id'] = $this->userId;

            return $attributes;
        }

        return array_intersect_key($attributes, array_flip($only));
    }

    /**
     * Response shape; keys match the other API resources (snake_case, PK as `achievement_id`).
     *
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'achievement_id' => $this->id,
            'user_id' => $this->userId,
            'name' => $this->name,
            'description' => $this->description,
            'icon' => $this->icon,
            'points' => $this->points,
            'date_created' => $this->dateCreated,
            'date_updated' => $this->dateUpdated,
        ];
    }
}
