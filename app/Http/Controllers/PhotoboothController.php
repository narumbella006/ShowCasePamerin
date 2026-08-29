<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\View\View;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;
use ZipArchive;

/**
 * Photobooth acara. Pengunjung berfoto lewat halaman /photobooth di perangkat
 * stan, mengumpulkan beberapa jepretan, lalu mengambil semuanya sekaligus —
 * langsung diunduh di situ, atau dipindai QR-nya memakai HP masing-masing.
 *
 * Server ini hanya penitipan sementara, bukan galeri: foto dihapus begitu
 * selesai diunduh, dan yang tidak pernah diunduh disapu setelah beberapa menit.
 *
 * Satu sesi = satu folder `photobooth/<kode>/` berisi 1.jpg, 2.jpg, dan
 * seterusnya.
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
            'maksFoto' => (int) config('photobooth.maks_foto'),
            'csrf' => csrf_token(),
        ]);
    }

    /**
     * Kiriman dari halaman photobooth. Dipanggil browser pengunjung sendiri,
     * jadi cukup dijaga CSRF bawaan Laravel — token rahasia tidak mungkin
     * ditaruh di JavaScript yang bisa dibaca siapa saja.
     */
    public function jepret(Request $request): JsonResponse
    {
        return response()->json(['ok' => true, ...$this->simpanSesi($this->fotoDari($request))]);
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

        return response()->json(['ok' => true, ...$this->simpanSesi($this->fotoDari($request))]);
    }

    public function tampil(string $kode): View
    {
        return view('photobooth.unduh', [
            'kode' => $kode,
            'jumlah' => count($this->pastikanAda($kode)),
            'bisaZip' => $this->bisaZip(),
        ]);
    }

    public function gambar(string $kode, int $indeks): StreamedResponse
    {
        return Storage::disk('public')->response($this->berkasKe($kode, $indeks));
    }

    public function unduh(string $kode, int $indeks): BinaryFileResponse
    {
        // Sengaja pakai response()->download() dan bukan Storage::download():
        // hanya BinaryFileResponse yang bisa menghapus berkasnya sendiri setelah
        // isinya selesai terkirim ke pengunjung.
        $respons = response()->download(
            Storage::disk('public')->path($this->berkasKe($kode, $indeks)),
            "photobooth-{$kode}-{$indeks}.jpg",
        );

        if (config('photobooth.hapus_setelah_unduh')) {
            $respons->deleteFileAfterSend();
        }

        return $respons;
    }

    /** Seluruh foto satu sesi dalam satu berkas zip. */
    public function semua(string $kode): BinaryFileResponse
    {
        $foto = $this->pastikanAda($kode);

        abort_unless($this->bisaZip(), 404);

        $disk = Storage::disk('public');
        $berkasZip = tempnam(sys_get_temp_dir(), 'photobooth');

        $zip = new ZipArchive;
        abort_unless($zip->open($berkasZip, ZipArchive::OVERWRITE) === true, 500, 'Gagal menyiapkan zip.');

        foreach ($foto as $i => $jalur) {
            $zip->addFile($disk->path($jalur), sprintf('photobooth-%s-%d.jpg', $kode, $i + 1));
        }

        $zip->close();

        // Isinya sudah aman di dalam zip yang sedang dikirim, jadi sesinya boleh
        // dibereskan sekarang.
        if (config('photobooth.hapus_setelah_unduh')) {
            $this->hapusSesi($kode);
        }

        return response()->download($berkasZip, "photobooth-{$kode}.zip")->deleteFileAfterSend();
    }

    protected function bisaZip(): bool
    {
        return class_exists(ZipArchive::class);
    }

    /**
     * Daftar foto satu sesi, terurut. Sesi lama yang cuma satu berkas
     * (`<kode>.jpg`, dari sebelum ada fitur banyak foto) tetap ikut terbaca.
     *
     * @return list<string>
     */
    protected function daftarFoto(string $kode): array
    {
        $disk = Storage::disk('public');

        $foto = collect($disk->files(self::DIREKTORI.'/'.$kode))
            ->filter(fn (string $berkas) => Str::endsWith($berkas, '.jpg'))
            ->sortBy(fn (string $berkas) => (int) pathinfo($berkas, PATHINFO_FILENAME))
            ->values()
            ->all();

        if (! $foto && $disk->exists(self::DIREKTORI.'/'.$kode.'.jpg')) {
            return [self::DIREKTORI.'/'.$kode.'.jpg'];
        }

        return $foto;
    }

    /**
     * Sesi yang sudah diunduh dan sesi kedaluwarsa sama-sama sudah tidak ada,
     * jadi keduanya dijawab satu halaman yang menjelaskan sebabnya — jauh lebih
     * berguna buat pengunjung daripada halaman 404 biasa.
     *
     * @return list<string>
     */
    protected function pastikanAda(string $kode): array
    {
        $foto = $this->daftarFoto($kode);

        if (! $foto) {
            abort(response()->view('photobooth.hilang', [
                'menit' => (int) config('photobooth.simpan_menit'),
            ], 404));
        }

        return $foto;
    }

    protected function berkasKe(string $kode, int $indeks): string
    {
        $foto = $this->pastikanAda($kode);

        abort_unless(isset($foto[$indeks - 1]), 404);

        return $foto[$indeks - 1];
    }

    /**
     * @return array<int, \Illuminate\Http\UploadedFile>
     */
    protected function fotoDari(Request $request): array
    {
        // Halaman photobooth mengirim `foto[]`, aplikasi di laptop mengirim satu
        // `foto`. Disamakan dulu supaya aturan validasinya cukup satu set.
        if (! is_array($request->file('foto'))) {
            $request->files->set('foto', array_filter([$request->file('foto')]));
        }

        $request->validate([
            'foto' => ['required', 'array', 'min:1', 'max:'.config('photobooth.maks_foto')],
            'foto.*' => ['file', 'image', 'mimes:jpg,jpeg', 'max:'.config('photobooth.maks_kb')],
        ]);

        return array_values($request->file('foto'));
    }

    /**
     * @param  array<int, \Illuminate\Http\UploadedFile>  $berkas
     * @return array{kode: string, jumlah: int, url: string}
     */
    protected function simpanSesi(array $berkas): array
    {
        $kode = $this->kodeBaru();

        foreach ($berkas as $i => $foto) {
            $foto->storeAs(self::DIREKTORI.'/'.$kode, ($i + 1).'.jpg', 'public');
        }

        $this->bersihkanSesiLama();

        return [
            'kode' => $kode,
            'jumlah' => count($berkas),
            'url' => route('photobooth.tampil', $kode),
        ];
    }

    protected function hapusSesi(string $kode): void
    {
        $disk = Storage::disk('public');
        $disk->deleteDirectory(self::DIREKTORI.'/'.$kode);
        $disk->delete(self::DIREKTORI.'/'.$kode.'.jpg');
    }

    protected function kodeBaru(): string
    {
        do {
            $kode = collect(range(1, 7))
                ->map(fn () => self::ABJAD[random_int(0, strlen(self::ABJAD) - 1)])
                ->implode('');
        } while ($this->daftarFoto($kode) !== []);

        return $kode;
    }

    /**
     * Menyapu sesi yang tidak pernah diunduh. Dijalankan menumpang unggahan
     * baru, bukan lewat scheduler, supaya tidak perlu proses cron terpisah di
     * Railway.
     */
    protected function bersihkanSesiLama(): void
    {
        $menit = (int) config('photobooth.simpan_menit');

        if ($menit <= 0) {
            return;
        }

        $disk = Storage::disk('public');
        $batas = now()->subMinutes($menit)->getTimestamp();

        foreach ($disk->directories(self::DIREKTORI) as $folder) {
            $isi = $disk->files($folder);
            $terbaru = 0;

            foreach ($isi as $berkas) {
                $terbaru = max($terbaru, $disk->lastModified($berkas));
            }

            if (! $isi || $terbaru < $batas) {
                $disk->deleteDirectory($folder);
            }
        }

        // Sesi lama berformat satu berkas.
        foreach ($disk->files(self::DIREKTORI) as $berkas) {
            if (Str::endsWith($berkas, '.jpg') && $disk->lastModified($berkas) < $batas) {
                $disk->delete($berkas);
            }
        }
    }
}
