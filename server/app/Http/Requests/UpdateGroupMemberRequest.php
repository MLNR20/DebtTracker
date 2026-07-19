<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGroupMemberRequest extends FormRequest
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
            'group_id' => ['sometimes', 'required', 'uuid', 'exists:groups,group_id'],
            'user_id' => ['sometimes', 'required', 'uuid', 'exists:users,user_id'],
            'date_joined' => ['nullable', 'date'],
        ];
    }
}
