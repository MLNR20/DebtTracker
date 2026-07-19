<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDebtRequest extends FormRequest
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
            'expense_id' => ['nullable', 'uuid', 'exists:group_expenses,expense_id'],
            'creditor_id' => ['sometimes', 'required', 'uuid', 'exists:users,user_id'],
            'debtor_user_id' => ['nullable', 'uuid', 'exists:users,user_id'],
            'debtor_contact_id' => ['nullable', 'uuid', 'exists:contacts,contact_id'],
            'total_amount' => ['sometimes', 'required', 'numeric', 'min:0'],
            'remaining_amount' => ['sometimes', 'required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string', 'max:255'],
            'due_date' => ['nullable', 'date'],
            'status' => ['sometimes', 'required', 'string', 'max:255'],
        ];
    }
}
