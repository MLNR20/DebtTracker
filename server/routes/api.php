<?php

use App\Http\Controllers\Api\AccessController;
use App\Http\Controllers\Api\AchievementController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DebtController;
use App\Http\Controllers\Api\GroupController;
use App\Http\Controllers\Api\GroupExpenseController;
use App\Http\Controllers\Api\GroupMemberController;
use App\Http\Controllers\Api\LogController;
use App\Http\Controllers\Api\PageController;
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

Route::middleware(['auth:sanctum', 'ability:access-api'])->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);
Route::post('forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:5,1');
Route::post('reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:10,1');
Route::post('refresh', [AuthController::class, 'refresh'])->middleware('throttle:30,1');

Route::middleware(['auth:sanctum', 'ability:access-api'])->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me', [AccessController::class, 'me']);

    /*
    | RBAC: `page:<keys>` lets a request through when the user's role has been
    | assigned ANY of the listed pages (admin roles always pass). Read access
    | (index/show) is also granted to pages that need the resource as a lookup
    | list, e.g. the debts form lists users and contacts. Writes need the
    | resource's own page.
    */
    $resource = function (string $uri, string $controller, array $read, ?array $write = null, bool $readOnly = false) {
        Route::apiResource($uri, $controller)
            ->only(['index', 'show'])
            ->middleware('page:'.implode(',', $read));

        if (! $readOnly) {
            Route::apiResource($uri, $controller)
                ->except(['index', 'show'])
                ->middleware('page:'.implode(',', $write ?? $read));
        }
    };

    $resource('roles', RoleController::class, ['roles', 'users'], ['roles']);
    Route::get('roles/{role}/pages', [RoleController::class, 'pages'])->middleware('page:roles');
    Route::put('roles/{role}/pages', [RoleController::class, 'syncPages'])->middleware('page:roles');
    $resource('pages', PageController::class, ['pages', 'roles'], ['pages']);
    $resource('users', UserController::class, ['users', 'contacts', 'debts', 'bulk-debt-assign', 'groups', 'group-members', 'group-expenses'], ['users']);
    $resource('contacts', ContactController::class, ['contacts', 'debts', 'bulk-debt-assign'], ['contacts']);
    $resource('groups', GroupController::class, ['groups', 'group-members', 'group-expenses'], ['groups']);
    $resource('group-members', GroupMemberController::class, ['group-members']);
    $resource('group-expenses', GroupExpenseController::class, ['group-expenses']);
    $resource('debts', DebtController::class, ['debts', 'payments', 'schedule', 'bulk-debt-assign'], ['debts', 'bulk-debt-assign']);
    $resource('payments', PaymentController::class, ['payments']);
    $resource('payment-histories', PaymentHistoryController::class, ['history'], null, true);
    $resource('achievements', AchievementController::class, ['achievements']);
    $resource('logs', LogController::class, ['logs'], null, true);

    Route::middleware('page:dashboard')->group(function () {
        Route::get('dashboard/summary', [DashboardController::class, 'summary']);
        Route::get('dashboard/chart', [DashboardController::class, 'chart']);
        Route::get('dashboard/pending', [DashboardController::class, 'pending']);
    });
});
