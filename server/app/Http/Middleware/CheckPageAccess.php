<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/**
 * Role-based access control: `page:roles,users` allows the request when the
 * authenticated user's role has been assigned ANY of the listed pages.
 */
class CheckPageAccess
{
    public function handle(Request $request, Closure $next, string ...$pageKeys)
    {
        $user = $request->user();

        if (! $user || ! $user->canAccessAnyPage($pageKeys)) {
            return response()->json(['message' => 'You do not have access to this resource.'], 403);
        }

        return $next($request);
    }
}
