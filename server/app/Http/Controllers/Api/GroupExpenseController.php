<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGroupExpenseRequest;
use App\Http\Requests\UpdateGroupExpenseRequest;
use App\Models\GroupExpense;
use App\Repositories\Contracts\GroupExpenseRepositoryInterface;
use App\Traits\LogsActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GroupExpenseController extends Controller
{
    use LogsActivity;

    protected array $with = ['group', 'payer'];

    public function __construct(protected GroupExpenseRepositoryInterface $groupExpenses)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->integer('per_page', 15);
        $search = $request->string('search')->value() ?: null;

        return response()->json($this->groupExpenses->paginate($perPage, $search, $this->with));
    }

    public function store(StoreGroupExpenseRequest $request): JsonResponse
    {
        $expense = $this->groupExpenses->create($request->validated());

        $this->logActivity('group_expense_created', "Created expense of ₱{$expense->total_amount} ({$expense->description})");

        return response()->json($expense->load($this->with), 201);
    }

    public function show(GroupExpense $groupExpense): JsonResponse
    {
        return response()->json($groupExpense->load($this->with));
    }

    public function update(UpdateGroupExpenseRequest $request, GroupExpense $groupExpense): JsonResponse
    {
        $updated = $this->groupExpenses->update($groupExpense->expense_id, $request->validated());

        $this->logActivity('group_expense_updated', "Updated expense of ₱{$updated->total_amount} ({$updated->description})");

        return response()->json($updated->load($this->with));
    }

    public function destroy(GroupExpense $groupExpense): JsonResponse
    {
        $this->logActivity('group_expense_deleted', "Deleted expense of ₱{$groupExpense->total_amount} ({$groupExpense->description})");

        $this->groupExpenses->softDelete($groupExpense->expense_id);

        return response()->json(null, 204);
    }
}
