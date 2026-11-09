<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePageRequest extends FormRequest
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
            'page_key' => ['required', 'string', 'max:255', 'alpha_dash', 'unique:pages,page_key'],
            'page_name' => ['required', 'string', 'max:255'],
            'page_path' => ['required', 'string', 'max:255', 'starts_with:/'],
            'page_group' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
