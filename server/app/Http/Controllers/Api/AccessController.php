<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AccessController extends Controller
{
    /**
     * The current user's role and the pages that role can open.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user()->accessPayload());
    }
}
