<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePageRequest extends FormRequest
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
            'page_key' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                'alpha_dash',
                Rule::unique('pages', 'page_key')->ignore($this->route('page'), 'page_id'),
            ],
            'page_name' => ['sometimes', 'required', 'string', 'max:255'],
            'page_path' => ['sometimes', 'required', 'string', 'max:255', 'starts_with:/'],
            'page_group' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
