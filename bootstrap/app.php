<?php

use App\Http\Middleware\EnsureUserIsAdmin;
use App\Http\Middleware\EnsureUserIsDosen;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'dosen' => EnsureUserIsDosen::class,
            'admin' => EnsureUserIsAdmin::class,
        ]);

        // Diarahkan ke path, bukan route bernama `login`, supaya tamu tetap
        // dapat redirect yang wajar selama halaman login belum dibuat.
        $middleware->redirectGuestsTo('/login');

        // Percayai header X-Forwarded-* dari proxy manapun (Cloudflare Tunnel,
        // ngrok, dll) supaya Laravel tahu request aslinya HTTPS meski yang
        // sampai ke server lokal ini cuma HTTP biasa — tanpa ini, URL aset
        // (app.js, dll) ke-generate sebagai http:// dan diblokir browser
        // sebagai mixed content saat halamannya dibuka lewat https://.
        $middleware->trustProxies(at: '*');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
