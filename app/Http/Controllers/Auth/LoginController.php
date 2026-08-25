<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class LoginController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'status' => session('status'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => 'Email atau password yang Anda masukkan salah.',
            ]);
        }

        if (! Auth::user()->isActive()) {
            Auth::logout();

            throw ValidationException::withMessages([
                'email' => 'Akun ini sudah dinonaktifkan. Hubungi admin prodi kalau ini keliru.',
            ]);
        }

        $request->session()->regenerate();

        $destination = match (true) {
            Auth::user()->isDosen() => route('dosen.dashboard'),
            Auth::user()->isAdmin() => route('admin.dashboard'),
            default => route('guest.home'),
        };

        return redirect()->intended($destination);
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('guest.home');
    }
}
