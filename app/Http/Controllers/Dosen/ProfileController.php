<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dosen\UpdatePasswordRequest;
use App\Http\Requests\Dosen\UpdateProfileRequest;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Dosen/Profile/Edit', [
            'profile' => [
                'name' => $user->name,
                'email' => $user->email,
                'nip' => $user->nip,
                'avatar_url' => $user->avatarUrl(),
                'bergabung' => $user->created_at?->translatedFormat('d F Y'),
            ],
            'stats' => [
                'dibimbing' => Product::supervisedBy($user)->count(),
                'terbit' => Product::supervisedBy($user)->where('status', 'published')->count(),
                'diinput' => $user->createdProducts()->count(),
            ],
        ]);
    }

    public function update(UpdateProfileRequest $request): RedirectResponse
    {
        $user = $request->user();
        $data = $request->validated();

        $user->fill([
            'name' => $data['name'],
            'email' => $data['email'],
            'nip' => $data['nip'] ?? null,
        ]);

        if ($request->hasFile('avatar')) {
            $this->deleteAvatar($user->avatar);
            $user->avatar = $request->file('avatar')->store('avatars', 'public');
        } elseif ($request->boolean('remove_avatar')) {
            $this->deleteAvatar($user->avatar);
            $user->avatar = null;
        }

        $user->save();

        return back()->with('success', 'Profil berhasil diperbarui.');
    }

    public function updatePassword(UpdatePasswordRequest $request): RedirectResponse
    {
        $request->user()->update([
            'password' => Hash::make($request->validated()['password']),
        ]);

        return back()->with('success', 'Password berhasil diganti.');
    }

    /**
     * Logout sementara ditempatkan di area dosen supaya tidak bentrok dengan
     * route `logout` global yang akan dibuat bersama halaman login.
     */
    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    protected function deleteAvatar(?string $path): void
    {
        if ($path) {
            Storage::disk('public')->delete($path);
        }
    }
}
