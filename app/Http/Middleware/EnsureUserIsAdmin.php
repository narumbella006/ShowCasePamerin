<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    /**
     * Kunci seluruh area admin. Dosen punya dashboard sendiri, jadi sengaja
     * tidak diberi akses ke sini.
     *
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->isAdmin()) {
            abort(403, 'Halaman ini khusus untuk admin.');
        }

        return $next($request);
    }
}
