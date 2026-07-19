<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGroupRequest extends FormRequest
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
        return [
            'group_name' => ['sometimes', 'required', 'string', 'max:255'],
            'group_description' => ['nullable', 'string', 'max:255'],
            'created_by' => ['sometimes', 'required', 'uuid', 'exists:users,user_id'],
        ];
    }
}
