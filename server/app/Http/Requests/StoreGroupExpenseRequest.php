<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreGroupExpenseRequest extends FormRequest
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
            'group_id' => ['required', 'uuid', 'exists:groups,group_id'],
            'paid_by_user_id' => ['required', 'uuid', 'exists:users,user_id'],
            'total_amount' => ['required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string', 'max:255'],
            'split_type' => ['required', 'string', 'max:255'],
            'date_incurred' => ['required', 'date'],
        ];
    }
}
