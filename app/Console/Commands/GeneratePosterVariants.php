<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Services\PosterImageService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

/**
 * Membuat turunan poster untuk produk yang sudah terlanjur diunggah sebelum
 * pipeline varian ada.
 *
 * Aman dijalankan berulang: produk yang varian-nya sudah lengkap dan berkasnya
 * benar-benar ada akan dilewati. Poster asli tidak pernah dihapus.
 */
class GeneratePosterVariants extends Command
{
    protected $signature = 'posters:generate-variants
                            {--dry-run : Hanya menghitung, tidak menulis berkas apa pun}
                            {--force : Buat ulang varian walaupun sudah ada}';

    protected $description = 'Buat versi kecil (thumb & medium) untuk poster produk yang sudah ada';

    public function handle(PosterImageService $gambar): int
    {
        if (! $gambar->tersedia()) {
            $this->error('Ekstensi GD tidak tersedia di server ini, jadi gambar tidak bisa diperkecil.');
            $this->line('Pastikan "ext-gd" ada di composer.json dan server sudah di-deploy ulang.');

            return self::FAILURE;
        }

        $kering = $this->option('dry-run');
        $paksa = $this->option('force');
        $disk = Storage::disk('public');

        $produk = Product::query()
            ->whereNotNull('poster_path')
            ->when(! $paksa, fn ($q) => $q->where(fn ($w) => $w
                ->whereNull('poster_thumb_path')
                ->orWhereNull('poster_medium_path')))
            ->get();

        if ($produk->isEmpty()) {
            $this->info('Tidak ada poster yang perlu diproses.');

            return self::SUCCESS;
        }

        $this->info(($kering ? '[UJI COBA] ' : '').'Memproses '.$produk->count().' poster...');
        $bar = $this->output->createProgressBar($produk->count());
        $bar->start();

        $byteSebelum = 0;
        $byteSesudah = 0;
        $diproses = 0;
        $dilewati = 0;
        $gagal = 0;

        foreach ($produk as $item) {
            $bar->advance();

            if (! $disk->exists($item->poster_path)) {
                $gagal++;

                continue;
            }

            // Varian tercatat di database tapi berkasnya sudah tidak ada —
            // tetap perlu dibuat ulang.
            $lengkap = $item->poster_thumb_path && $item->poster_medium_path
                && $disk->exists($item->poster_thumb_path)
                && $disk->exists($item->poster_medium_path);

            if ($lengkap && ! $paksa) {
                $dilewati++;

                continue;
            }

            $asli = $disk->size($item->poster_path);

            if ($kering) {
                $byteSebelum += $asli;
                $diproses++;

                continue;
            }

            $varian = $gambar->buatVarian($item->poster_path);

            if (! $varian['thumb']) {
                $gagal++;

                continue;
            }

            $item->forceFill([
                'poster_thumb_path' => $varian['thumb'],
                'poster_medium_path' => $varian['medium'],
            ])->save();

            $byteSebelum += $asli;
            $byteSesudah += $disk->size($varian['thumb']);
            $diproses++;
        }

        $bar->finish();
        $this->newLine(2);

        $this->line("Diproses : {$diproses}");
        $this->line("Dilewati : {$dilewati}");

        if ($gagal) {
            $this->warn("Gagal    : {$gagal} (berkas hilang atau format tidak didukung)");
        }

        if ($kering) {
            $this->info('Uji coba selesai. Total poster asli: '.$this->mb($byteSebelum).' MB. Tidak ada berkas ditulis.');

            return self::SUCCESS;
        }

        if ($byteSebelum > 0) {
            $hemat = 100 - ($byteSesudah / $byteSebelum * 100);
            $this->info(sprintf(
                'Ukuran di grid: %s MB -> %s MB (hemat %.1f%%). Poster asli tidak dihapus.',
                $this->mb($byteSebelum), $this->mb($byteSesudah), $hemat
            ));
        }

        return self::SUCCESS;
    }

    private function mb(int $byte): string
    {
        return number_format($byte / 1048576, 2);
    }
}
