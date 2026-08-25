<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreDosenRequest;
use App\Http\Requests\Admin\UpdateDosenRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class DosenAccountController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Dosen/Index', [
            'dosen' => User::query()
                ->where('role', 'dosen')
                ->withCount('supervisedProducts')
                ->orderBy('name')
                ->get()
                ->map(fn (User $user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'nip' => $user->nip,
                    'is_active' => $user->is_active,
                    'products_count' => $user->supervised_products_count,
                ]),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Dosen/Create');
    }

    public function store(StoreDosenRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $password = Str::password(12);

        User::create([
            ...$data,
            'role' => 'dosen',
            'password' => Hash::make($password),
            'is_active' => true,
        ]);

        return to_route('admin.dosen.index')->with(
            'success',
            "Akun dosen \"{$data['name']}\" dibuat. Password: {$password} — catat sekarang, tidak akan ditampilkan lagi."
        );
    }

    public function edit(User $dosen): Response
    {
        abort_unless($dosen->isDosen(), 404);

        return Inertia::render('Admin/Dosen/Edit', [
            'dosen' => [
                'id' => $dosen->id,
                'name' => $dosen->name,
                'email' => $dosen->email,
                'nip' => $dosen->nip,
            ],
        ]);
    }

    public function update(UpdateDosenRequest $request, User $dosen): RedirectResponse
    {
        abort_unless($dosen->isDosen(), 404);

        $dosen->update($request->validated());

        return to_route('admin.dosen.index')->with('success', "Data \"{$dosen->name}\" diperbarui.");
    }

    public function resetPassword(User $dosen): RedirectResponse
    {
        abort_unless($dosen->isDosen(), 404);

        $password = Str::password(12);
        $dosen->update(['password' => Hash::make($password)]);

        return back()->with(
            'success',
            "Password baru untuk {$dosen->email}: {$password} — catat sekarang, tidak akan ditampilkan lagi."
        );
    }

    public function toggleActive(User $dosen): RedirectResponse
    {
        abort_unless($dosen->isDosen(), 404);

        $dosen->update(['is_active' => ! $dosen->is_active]);

        return back()->with(
            'success',
            $dosen->is_active
                ? "Akun \"{$dosen->name}\" diaktifkan kembali."
                : "Akun \"{$dosen->name}\" dinonaktifkan."
        );
    }
}
