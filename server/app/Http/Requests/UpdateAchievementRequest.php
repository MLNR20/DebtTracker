<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAchievementRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules()
    {
        $achievement = $this->route('achievement');

        return [
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('achievements', 'name')
                    ->where('is_deleted', false)
                    ->ignore($achievement?->achievement_id, 'achievement_id'),
            ],
            'description' => ['nullable', 'string', 'max:255'],
            'icon' => ['nullable', 'string', 'max:255'],
            'points' => ['sometimes', 'required', 'integer', 'min:0'],
        ];
    }
}
