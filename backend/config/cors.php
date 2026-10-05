<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Cors
{
    public function handle(Request $request, Closure $next): Response
    {
        $allowedOrigins = [
            'https://swiftshopiy.vercel.app',
            'http://localhost:5173',
            'http://localhost:3000',
        ];

        $origin = $request->headers->get('Origin', '');

        // Allow listed origin or any Vercel preview domain
        $allowOrigin = '';
        if (in_array($origin, $allowedOrigins, true) || preg_match('/\.vercel\.app$/', $origin)) {
            $allowOrigin = $origin;
        } elseif (!empty($allowedOrigins)) {
            $allowOrigin = $allowedOrigins[0];
        }

        // Handle preflight OPTIONS request
        if ($request->isMethod('OPTIONS')) {
            return response('', 200, [
                'Access-Control-Allow-Origin' => $allowOrigin,
                'Access-Control-Allow-Methods' => 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
                'Access-Control-Allow-Headers' => 'Content-Type, Authorization, X-Requested-With, X-CSRF-TOKEN, Accept, Origin',
                'Access-Control-Allow-Credentials' => 'true',
            ]);
        }

        /** @var Response $response */
        $response = $next($request);

        $response->headers->set('Access-Control-Allow-Origin', $allowOrigin);
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-TOKEN, Accept, Origin');
        $response->headers->set('Access-Control-Allow-Credentials', 'true');

        return $response;
    }
}