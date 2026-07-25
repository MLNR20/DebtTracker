<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Log;
use App\Repositories\Contracts\LogRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LogController extends Controller
{
    public function __construct(protected LogRepositoryInterface $logs)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->integer('per_page', 15);
        $search = $request->string('search')->value() ?: null;

        return response()->json($this->logs->paginate($perPage, $search));
    }

    public function show(Log $log): JsonResponse
    {
        return response()->json($log->load('user'));
    }
}
