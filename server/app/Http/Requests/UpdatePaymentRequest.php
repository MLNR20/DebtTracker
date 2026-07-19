<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePaymentRequest extends FormRequest
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
            'debt_id' => ['sometimes', 'required', 'uuid', 'exists:debts,debt_id'],
            'paid_amount' => ['sometimes', 'required', 'numeric', 'min:0.01'],
            'payment_type' => ['sometimes', 'required', 'string', 'max:255'],
            'proof_img_url' => ['nullable', 'string', 'max:2048'],
            'remarks' => ['nullable', 'string', 'max:255'],
        ];
    }
}
