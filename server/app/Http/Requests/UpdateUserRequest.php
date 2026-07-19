<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
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
            'role_id' => ['nullable', 'uuid', 'exists:roles,role_id'],
            'first_name' => ['sometimes', 'required', 'string', 'max:255'],
            'last_name' => ['sometimes', 'required', 'string', 'max:255'],
            'email_address' => [
                'sometimes',
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email_address')->ignore($this->route('user'), 'user_id'),
            ],
            'contact_no' => ['nullable', 'string', 'max:255'],
            'user_name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('users', 'user_name')->ignore($this->route('user'), 'user_id'),
            ],
            'password' => ['nullable', 'string', 'min:8'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
