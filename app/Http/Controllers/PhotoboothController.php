<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\View\View;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Titipan hasil photobooth acara. Aplikasi photobooth berjalan di laptop
 * panitia, lalu mengirim foto ke sini supaya pengunjung bisa mengunduhnya
 * lewat QR dari HP mana pun — tidak perlu satu WiFi dengan laptop.
 *
 * Sifatnya penitipan sementara, bukan galeri: foto dihapus begitu selesai
 * diunduh, dan yang tidak pernah diunduh disapu setelah beberapa menit.
 */
class PhotoboothController extends Controller
{
    protected const DIREKTORI = 'photobooth';

    /** Huruf/angka yang tidak ambigu saat dibaca manusia. */
    protected const ABJAD = '23456789abcdefghjkmnpqrstuvwxyz';

    /** Halaman photobooth yang dipakai pengunjung di stan. */
    public function halaman(): InertiaResponse
    {
        return Inertia::render('Photobooth/Index', [
            'frame' => asset(config('photobooth.frame')).'?v='.config('photobooth.frame_versi'),
            'area' => config('photobooth.area'),
            'csrf' => csrf_token(),
        ]);
    }

    /**
     * Jepretan dari halaman photobooth. Dipanggil browser pengunjung sendiri,
     * jadi cukup dijaga CSRF bawaan Laravel — tanpa token, karena token tidak
     * mungkin ditaruh di JavaScript yang bisa dibaca siapa saja.
     */
    public function jepret(Request $request): JsonResponse
    {
        return response()->json([
            'ok' => true,
            ...$this->simpanFoto($this->validasiFoto($request)),
        ]);
    }

    /**
     * Titipan dari aplikasi photobooth di laptop panitia. Tidak punya sesi
     * browser, jadi dijaga token rahasia.
     */
    public function unggah(Request $request): JsonResponse
    {
        abort_if(blank(config('photobooth.token')), 404);

        abort_unless(
            hash_equals((string) config('photobooth.token'), (string) $request->header('X-Photobooth-Token')),
            403,
            'Token photobooth tidak cocok.',
        );

        return response()->json([
            'ok' => true,
            ...$this->simpanFoto($this->validasiFoto($request)),
        ]);
    }

    protected function validasiFoto(Request $request): UploadedFile
    {
        $request->validate([
            'foto' => ['required', 'file', 'image', 'mimes:jpg,jpeg', 'max:'.config('photobooth.maks_kb')],
        ]);

        return $request->file('foto');
    }

    /**
     * @return array{kode: string, url: string}
     */
    protected function simpanFoto(UploadedFile $foto): array
    {
        $kode = $this->kodeBaru();
        $foto->storeAs(self::DIREKTORI, $kode.'.jpg', 'public');

        $this->bersihkanFotoLama();

        return ['kode' => $kode, 'url' => route('photobooth.tampil', $kode)];
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

    public function unduh(string $kode): BinaryFileResponse
    {
        $this->pastikanAda($kode);

        // Sengaja pakai response()->download() dan bukan Storage::download():
        // hanya BinaryFileResponse yang bisa menghapus berkasnya sendiri setelah
        // isinya selesai terkirim ke pengunjung.
        $respons = response()->download(
            Storage::disk('public')->path($this->berkas($kode)),
            "photobooth-{$kode}.jpg",
        );

        if (config('photobooth.hapus_setelah_unduh')) {
            $respons->deleteFileAfterSend();
        }

        return $respons;
    }

    protected function berkas(string $kode): string
    {
        return self::DIREKTORI.'/'.$kode.'.jpg';
    }

    /**
     * Foto yang sudah diunduh dan foto kedaluwarsa sama-sama sudah tidak ada,
     * jadi keduanya dijawab satu halaman yang menjelaskan sebabnya — jauh lebih
     * berguna buat pengunjung daripada halaman 404 biasa.
     */
    protected function pastikanAda(string $kode): void
    {
        if (! Storage::disk('public')->exists($this->berkas($kode))) {
            abort(response()->view('photobooth.hilang', [
                'menit' => (int) config('photobooth.simpan_menit'),
            ], 404));
        }
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
     * Menyapu foto yang tidak pernah diunduh. Dijalankan menumpang unggahan
     * baru, bukan lewat scheduler, supaya tidak perlu proses cron terpisah di
     * Railway.
     */
    protected function bersihkanFotoLama(): void
    {
        $menit = (int) config('photobooth.simpan_menit');

        if ($menit <= 0) {
            return;
        }

        $disk = Storage::disk('public');
        $batas = now()->subMinutes($menit)->getTimestamp();

        foreach ($disk->files(self::DIREKTORI) as $berkas) {
            if (Str::endsWith($berkas, '.jpg') && $disk->lastModified($berkas) < $batas) {
                $disk->delete($berkas);
            }
        }
    }
}
