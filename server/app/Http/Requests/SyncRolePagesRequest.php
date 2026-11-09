<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SyncRolePagesRequest extends FormRequest
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
            'page_ids' => ['present', 'array'],
            'page_ids.*' => ['uuid', 'distinct', 'exists:pages,page_id'],
        ];
    }
}
