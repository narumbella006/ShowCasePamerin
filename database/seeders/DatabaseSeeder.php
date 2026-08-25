<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Hanya membuat satu akun admin. Data contoh sengaja tidak disertakan
     * supaya database produksi bersih — kategori, mata kuliah, dan akun
     * dosen dibuat lewat antarmuka admin.
     *
     * Password diambil dari environment, bukan ditulis di berkas ini, supaya
     * tidak ada kredensial yang tersimpan di dalam repository.
     */
    public function run(): void
    {
        $email = env('ADMIN_EMAIL');
        $password = env('ADMIN_PASSWORD');

        if (blank($email) || blank($password)) {
            throw new RuntimeException(
                'ADMIN_EMAIL dan ADMIN_PASSWORD wajib diisi di environment sebelum menjalankan seeder.'
            );
        }

        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name' => env('ADMIN_NAME', 'Administrator'),
                'password' => Hash::make($password),
                'role' => 'admin',
            ],
        );

        $this->command->info("Akun admin siap: {$user->email}");
    }
}
