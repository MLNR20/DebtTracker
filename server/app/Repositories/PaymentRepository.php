<?php

namespace App\Repositories;

use App\Models\Debt;
use App\Models\Payment;
use App\Models\PaymentHistory;
use App\Repositories\Contracts\PaymentRepositoryInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class PaymentRepository extends BaseRepository implements PaymentRepositoryInterface
{
    protected array $searchable = ['payment_type', 'remarks'];

    public function __construct(Payment $model)
    {
        parent::__construct($model);
    }

    public function create(array $data): Model
    {
        return DB::transaction(function () use ($data) {
            $payment = $this->model->newInstance()->create($data);

            $remaining = $this->applyToDebt($data['debt_id'], (float) $data['paid_amount']);

            PaymentHistory::query()->create([
                'payment_id' => $payment->payment_id,
                'debt_id' => $payment->debt_id,
                'paid_amount' => $payment->paid_amount,
                'payment_type' => $payment->payment_type,
                'remarks' => $payment->remarks,
                'remaining_amount' => $remaining,
            ]);

            return $payment;
        });
    }

    public function update(string $id, array $data): Model
    {
        return DB::transaction(function () use ($id, $data) {
            $payment = $this->findOrFail($id);
            $originalDebtId = $payment->debt_id;
            $originalAmount = (float) $payment->paid_amount;

            $payment->update($data);
            $payment->refresh();

            // Reverse the original payment's effect, then apply the new one.
            $this->applyToDebt($originalDebtId, -$originalAmount);
            $this->applyToDebt($payment->debt_id, (float) $payment->paid_amount);

            return $payment;
        });
    }

    public function softDelete(string $id): bool
    {
        return DB::transaction(function () use ($id) {
            $payment = $this->findOrFail($id);

            $this->applyToDebt($payment->debt_id, -(float) $payment->paid_amount);

            return $payment->markDeleted();
        });
    }

    /**
     * Adjust a debt's remaining amount by the given delta (positive reduces the
     * remaining balance, negative restores it) and refresh its status.
     */
    protected function applyToDebt(string $debtId, float $delta): float
    {
        $debt = Debt::query()->findOrFail($debtId);

        $remaining = max(0, (float) $debt->remaining_amount - $delta);
        $status = $remaining <= 0 ? 'paid' : ($remaining < (float) $debt->total_amount ? 'partial' : 'pending');

        $debt->update([
            'remaining_amount' => $remaining,
            'status' => $status,
        ]);

        return $remaining;
    }
}
