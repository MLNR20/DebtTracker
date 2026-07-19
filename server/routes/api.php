<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DebtController;
use App\Http\Controllers\Api\GroupController;
use App\Http\Controllers\Api\GroupMemberController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PaymentHistoryController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->post('logout', [AuthController::class, 'logout']);

Route::apiResource('roles', RoleController::class);
Route::apiResource('contacts', ContactController::class);
Route::apiResource('users', UserController::class);
Route::apiResource('groups', GroupController::class);
Route::apiResource('group-members', GroupMemberController::class);
Route::apiResource('debts', DebtController::class);
Route::apiResource('payments', PaymentController::class);
Route::apiResource('payment-histories', PaymentHistoryController::class)->only(['index', 'show']);

Route::get('dashboard/summary', [DashboardController::class, 'summary']);
Route::get('dashboard/chart', [DashboardController::class, 'chart']);
Route::get('dashboard/pending', [DashboardController::class, 'pending']);
