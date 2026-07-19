<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRoleRequest extends FormRequest
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
            'role_name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('roles', 'role_name')->ignore($this->route('role'), 'role_id'),
            ],
        ];
    }
}
