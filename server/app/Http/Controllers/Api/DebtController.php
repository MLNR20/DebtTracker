<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDebtRequest;
use App\Http\Requests\UpdateDebtRequest;
use App\Models\Debt;
use App\Repositories\Contracts\DebtRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DebtController extends Controller
{
    protected array $with = ['creditor', 'debtorUser', 'debtorContact'];

    public function __construct(protected DebtRepositoryInterface $debts)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->integer('per_page', 15);
        $search = $request->string('search')->value() ?: null;

        return response()->json($this->debts->paginate($perPage, $search, $this->with));
    }

    public function store(StoreDebtRequest $request): JsonResponse
    {
        $debt = $this->debts->create($request->validated());

        return response()->json($debt->load($this->with), 201);
    }

    public function show(Debt $debt): JsonResponse
    {
        return response()->json($debt->load($this->with));
    }

    public function update(UpdateDebtRequest $request, Debt $debt): JsonResponse
    {
        $updated = $this->debts->update($debt->debt_id, $request->validated());

        return response()->json($updated->load($this->with));
    }

    public function destroy(Debt $debt): JsonResponse
    {
        $this->debts->softDelete($debt->debt_id);

        return response()->json(null, 204);
    }
}
