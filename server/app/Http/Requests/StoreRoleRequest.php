<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRoleRequest extends FormRequest
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
            'role_name' => ['required', 'string', 'max:255', 'unique:roles,role_name'],
            'is_admin' => ['sometimes', 'boolean'],
            'page_ids' => ['sometimes', 'array'],
            'page_ids.*' => ['uuid', 'distinct', 'exists:pages,page_id'],
        ];
    }
}
