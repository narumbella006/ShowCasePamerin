<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\View\View;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Titipan hasil photobooth acara. Aplikasi photobooth berjalan di laptop
 * panitia, lalu mengirim foto ke sini supaya pengunjung bisa mengunduhnya
 * lewat QR dari HP mana pun — tidak perlu satu WiFi dengan laptop.
 */
class PhotoboothController extends Controller
{
    protected const DIREKTORI = 'photobooth';

    /** Huruf/angka yang tidak ambigu saat dibaca manusia. */
    protected const ABJAD = '23456789abcdefghjkmnpqrstuvwxyz';

    public function unggah(Request $request): JsonResponse
    {
        $this->pastikanAktif();

        abort_unless(
            hash_equals((string) config('photobooth.token'), (string) $request->header('X-Photobooth-Token')),
            403,
            'Token photobooth tidak cocok.',
        );

        $request->validate([
            'foto' => ['required', 'file', 'image', 'mimes:jpg,jpeg', 'max:'.config('photobooth.maks_kb')],
        ]);

        $kode = $this->kodeBaru();
        $request->file('foto')->storeAs(self::DIREKTORI, $kode.'.jpg', 'public');

        $this->bersihkanFotoLama();

        return response()->json([
            'ok' => true,
            'kode' => $kode,
            'url' => route('photobooth.tampil', $kode),
        ]);
    }

    public function tampil(string $kode): View
    {
        $this->pastikanAda($kode);

        return view('photobooth.unduh', ['kode' => $kode]);
    }

    public function gambar(string $kode): StreamedResponse
    {
        $this->pastikanAda($kode);

        return Storage::disk('public')->response($this->berkas($kode));
    }

    public function unduh(string $kode): StreamedResponse
    {
        $this->pastikanAda($kode);

        return Storage::disk('public')->download($this->berkas($kode), "photobooth-{$kode}.jpg");
    }

    protected function berkas(string $kode): string
    {
        return self::DIREKTORI.'/'.$kode.'.jpg';
    }

    /** Fitur mati selama PHOTOBOOTH_TOKEN belum diisi di environment. */
    protected function pastikanAktif(): void
    {
        abort_if(blank(config('photobooth.token')), 404);
    }

    protected function pastikanAda(string $kode): void
    {
        $this->pastikanAktif();

        abort_unless(Storage::disk('public')->exists($this->berkas($kode)), 404, 'Foto tidak ditemukan.');
    }

    protected function kodeBaru(): string
    {
        do {
            $kode = collect(range(1, 7))
                ->map(fn () => self::ABJAD[random_int(0, strlen(self::ABJAD) - 1)])
                ->implode('');
        } while (Storage::disk('public')->exists($this->berkas($kode)));

        return $kode;
    }

    /**
     * Dijalankan menumpang unggahan baru, bukan lewat scheduler, supaya tidak
     * perlu proses cron terpisah di Railway.
     */
    protected function bersihkanFotoLama(): void
    {
        $hari = (int) config('photobooth.simpan_hari');

        if ($hari <= 0) {
            return;
        }

        $disk = Storage::disk('public');
        $batas = now()->subDays($hari)->getTimestamp();

        foreach ($disk->files(self::DIREKTORI) as $berkas) {
            if (Str::endsWith($berkas, '.jpg') && $disk->lastModified($berkas) < $batas) {
                $disk->delete($berkas);
            }
        }
    }
}
