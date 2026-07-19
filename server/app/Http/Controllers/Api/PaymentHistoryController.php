<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaymentHistory;
use App\Repositories\Contracts\PaymentHistoryRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentHistoryController extends Controller
{
    protected array $with = ['debt', 'debt.creditor', 'debt.debtorUser', 'debt.debtorContact'];

    public function __construct(protected PaymentHistoryRepositoryInterface $paymentHistories)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->integer('per_page', 15);
        $search = $request->string('search')->value() ?: null;

        return response()->json($this->paymentHistories->paginate($perPage, $search, $this->with));
    }

    public function show(PaymentHistory $paymentHistory): JsonResponse
    {
        return response()->json($paymentHistory->load($this->with));
    }
}
