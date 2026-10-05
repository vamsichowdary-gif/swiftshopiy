<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminUser
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!in_array(strtolower((string) $request->user()?->role), ['admin', 'super admin'], true)) {
            return response()->json(['message' => 'Administrator access required.'], 403);
        }

        return $next($request);
    }
}
