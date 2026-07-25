<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePaymentRequest;
use App\Http\Requests\UpdatePaymentRequest;
use App\Models\Payment;
use App\Repositories\Contracts\PaymentRepositoryInterface;
use App\Traits\LogsActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    use LogsActivity;

    protected array $with = ['debt', 'debt.creditor', 'debt.debtorUser', 'debt.debtorContact'];

    public function __construct(protected PaymentRepositoryInterface $payments)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->integer('per_page', 15);
        $search = $request->string('search')->value() ?: null;

        return response()->json($this->payments->paginate($perPage, $search, $this->with));
    }

    public function store(StorePaymentRequest $request): JsonResponse
    {
        $payment = $this->payments->create($request->validated());

        $this->logActivity('payment_created', "Recorded payment of ₱{$payment->paid_amount} ({$payment->payment_type})");

        return response()->json($payment->load($this->with), 201);
    }

    public function show(Payment $payment): JsonResponse
    {
        return response()->json($payment->load($this->with));
    }

    public function update(UpdatePaymentRequest $request, Payment $payment): JsonResponse
    {
        $updated = $this->payments->update($payment->payment_id, $request->validated());

        $this->logActivity('payment_updated', "Updated payment of ₱{$updated->paid_amount} ({$updated->payment_type})");

        return response()->json($updated->load($this->with));
    }

    public function destroy(Payment $payment): JsonResponse
    {
        $this->logActivity('payment_deleted', "Deleted payment of ₱{$payment->paid_amount} ({$payment->payment_type})");

        $this->payments->softDelete($payment->payment_id);

        return response()->json(null, 204);
    }
}
