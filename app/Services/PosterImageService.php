<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Membuat turunan poster berukuran kecil.
 *
 * Poster diunggah dosen apa adanya — biasanya 1750x2624 px dan 1–2 MB —
 * padahal di grid katalog cuma tampil sekitar 150x115 px. Menyajikan berkas
 * asli di grid membuat satu kunjungan beranda menarik belasan megabyte.
 *
 * Dipakai GD bawaan PHP, bukan paket pihak ketiga, supaya tidak menambah
 * dependensi yang bisa gagal terpasang di server. Kalau GD tidak tersedia,
 * seluruh method di sini mundur dengan aman: poster asli tetap dipakai dan
 * situs tetap berjalan, hanya penghematannya yang tidak terjadi.
 */
class PosterImageService
{
    /** Lebar maksimum tiap varian dalam piksel. */
    public const UKURAN = [
        'thumb' => 400,
        'medium' => 800,
    ];

    private const KUALITAS_WEBP = 80;

    public function tersedia(): bool
    {
        return \extension_loaded('gd') && \function_exists('imagewebp');
    }

    /**
     * Hasilkan semua varian untuk satu poster.
     *
     * @return array<string, string|null> ['thumb' => path, 'medium' => path]
     */
    public function buatVarian(?string $posterPath): array
    {
        $kosong = array_fill_keys(array_keys(self::UKURAN), null);

        if (blank($posterPath) || ! $this->tersedia()) {
            return $kosong;
        }

        $disk = Storage::disk('public');

        if (! $disk->exists($posterPath)) {
            return $kosong;
        }

        $sumber = $this->bacaGambar($disk->path($posterPath));

        if (! $sumber) {
            return $kosong;
        }

        $hasil = $kosong;

        foreach (self::UKURAN as $nama => $lebarMaks) {
            $hasil[$nama] = $this->tulisVarian($sumber, $posterPath, $nama, $lebarMaks);
        }

        imagedestroy($sumber);

        return $hasil;
    }

    /**
     * Hapus berkas varian. Poster asli sengaja tidak ikut dihapus.
     *
     * @param  array<string, string|null>  $paths
     */
    public function hapusVarian(array $paths): void
    {
        $disk = Storage::disk('public');

        foreach (array_filter($paths) as $path) {
            if ($disk->exists($path)) {
                $disk->delete($path);
            }
        }
    }

    /**
     * Path varian dihitung dari path poster, jadi bisa dipakai untuk memeriksa
     * apakah sebuah poster sudah punya varian tanpa menyentuh database.
     */
    public function pathVarian(string $posterPath, string $nama): string
    {
        return 'posters/'.$nama.'/'.Str::beforeLast(basename($posterPath), '.').'.webp';
    }

    private function bacaGambar(string $absolut): \GdImage|false
    {
        $info = @getimagesize($absolut);

        if (! $info) {
            return false;
        }

        $gambar = match ($info[2]) {
            IMAGETYPE_JPEG => @imagecreatefromjpeg($absolut),
            IMAGETYPE_PNG => @imagecreatefrompng($absolut),
            IMAGETYPE_WEBP => @imagecreatefromwebp($absolut),
            default => false,
        };

        if (! $gambar) {
            Log::warning('Poster tidak bisa dibaca GD', ['file' => $absolut]);
        }

        return $gambar;
    }

    private function tulisVarian(\GdImage $sumber, string $posterPath, string $nama, int $lebarMaks): ?string
    {
        $lebarAsal = imagesx($sumber);
        $tinggiAsal = imagesy($sumber);

        // Jangan pernah memperbesar — poster kecil dibiarkan seukuran aslinya.
        $lebar = min($lebarMaks, $lebarAsal);
        $tinggi = (int) round($tinggiAsal * $lebar / $lebarAsal);

        $tujuan = imagecreatetruecolor($lebar, $tinggi);

        // Wajib untuk PNG berlatar transparan, kalau tidak jadi kotak hitam.
        imagealphablending($tujuan, false);
        imagesavealpha($tujuan, true);

        imagecopyresampled($tujuan, $sumber, 0, 0, 0, 0, $lebar, $tinggi, $lebarAsal, $tinggiAsal);

        $disk = Storage::disk('public');
        $path = $this->pathVarian($posterPath, $nama);

        $disk->makeDirectory(dirname($path));

        $berhasil = imagewebp($tujuan, $disk->path($path), self::KUALITAS_WEBP);
        imagedestroy($tujuan);

        return $berhasil ? $path : null;
    }
}
