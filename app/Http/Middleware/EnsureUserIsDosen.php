<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsDosen
{
    /**
     * Kunci seluruh area dosen. Admin punya dashboard sendiri, jadi sengaja
     * tidak diberi akses ke sini.
     *
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->isDosen()) {
            abort(403, 'Halaman ini khusus untuk dosen.');
        }

        return $next($request);
    }
}
