<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Debt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function summary(): JsonResponse
    {
        $base = Debt::query()->notDeleted();

        return response()->json([
            'total_pending_amount' => (clone $base)->where('remaining_amount', '>', 0)->sum('remaining_amount'),
            'pending_debts_count' => (clone $base)->where('remaining_amount', '>', 0)->count(),
            'overdue_count' => (clone $base)
                ->where('remaining_amount', '>', 0)
                ->whereNotNull('due_date')
                ->where('due_date', '<', now())
                ->count(),
            'total_collected_amount' => (clone $base)->sum('total_amount') - (clone $base)->sum('remaining_amount'),
        ]);
    }

    public function chart(Request $request): JsonResponse
    {
        $months = (int) $request->integer('months', 6);
        $start = Carbon::now()->subMonths($months - 1)->startOfMonth();

        $debts = Debt::query()
            ->notDeleted()
            ->where('date_created', '>=', $start)
            ->get(['total_amount', 'remaining_amount', 'date_created']);

        $buckets = [];
        for ($i = 0; $i < $months; $i++) {
            $month = Carbon::now()->subMonths($months - 1 - $i);
            $key = $month->format('Y-m');
            $buckets[$key] = [
                'month' => $key,
                'total_amount' => 0,
                'collected_amount' => 0,
            ];
        }

        foreach ($debts as $debt) {
            $key = Carbon::parse($debt->date_created)->format('Y-m');
            if (! isset($buckets[$key])) {
                continue;
            }
            $buckets[$key]['total_amount'] += (float) $debt->total_amount;
            $buckets[$key]['collected_amount'] += (float) $debt->total_amount - (float) $debt->remaining_amount;
        }

        return response()->json(array_values($buckets));
    }

    public function pending(Request $request): JsonResponse
    {
        $limit = (int) $request->integer('limit', 10);

        $debts = Debt::query()
            ->notDeleted()
            ->where('remaining_amount', '>', 0)
            ->with(['creditor', 'debtorUser', 'debtorContact'])
            ->orderByRaw('due_date IS NULL, due_date ASC')
            ->limit($limit)
            ->get();

        return response()->json($debts);
    }
}
