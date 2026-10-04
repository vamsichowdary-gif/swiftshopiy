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
        if (!in_array($request->user()?->role, ['Admin', 'Super Admin'], true)) {
            return response()->json(['message' => 'Administrator access required.'], 403);
        }

        return $next($request);
    }
}