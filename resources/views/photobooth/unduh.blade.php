<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
    <meta name="robots" content="noindex,nofollow">
    <title>{{ $jumlah > 1 ? $jumlah.' Foto Photobooth' : 'Foto Photobooth' }}</title>
    {{-- Halaman ini sengaja tidak memakai bundel Inertia/Vite: dibuka pengunjung
         lewat QR di HP, sering dengan sinyal seadanya, jadi cukup HTML polos. --}}
    <style>
        :root { color-scheme: dark }
        * { box-sizing: border-box }
        body {
            margin: 0; min-height: 100vh; color: #f2f2f7;
            font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
            background:
                radial-gradient(1000px 700px at 15% -10%, #3a0d12 0%, transparent 60%),
                radial-gradient(800px 600px at 85% 110%, #0d2247 0%, transparent 60%),
                #07070c;
        }
        .bungkus { max-width: 620px; margin: 0 auto; padding: 26px 18px 60px }
        h1 { font-size: 22px; margin: 0 0 4px }
        .kecil { color: #9aa0b4; font-size: 13px; margin: 0 0 20px; line-height: 1.55 }
        .kartu {
            background: #14141f; border: 1px solid #262637; border-radius: 16px;
            padding: 14px; margin-bottom: 14px;
        }
        .nomor {
            display: inline-block; margin-bottom: 10px; padding: 3px 10px; border-radius: 999px;
            background: #21212f; color: #aab0c4; font-size: 12px; font-weight: 700;
        }
        img { width: 100%; height: auto; display: block; border-radius: 11px; background: #000 }
        .tombol {
            display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%;
            padding: 16px; border: 0; border-radius: 14px; text-decoration: none;
            font-size: 17px; font-weight: 700; cursor: pointer;
            background: linear-gradient(135deg, #e11d2e, #b4121f); color: #fff;
            box-shadow: 0 8px 22px rgba(225, 29, 46, .28);
        }
        .tombol.kedua {
            background: #1e1e2d; color: #cfd3e2; border: 1px solid #303048; box-shadow: none;
            padding: 13px; font-size: 15px;
        }
        .tombol:active { transform: translateY(1px) }
        .utama { margin-bottom: 18px }
        .ingat {
            margin: 16px 0 0; padding: 11px 14px; border-radius: 12px; font-size: 13px; line-height: 1.55;
            background: rgba(168, 132, 52, .14); border: 1px solid #6d5722; color: #f0cd85;
        }
        b { color: #e6e8f2 }
    </style>
</head>
<body>
<div class="bungkus">
    <h1>{{ $jumlah > 1 ? "$jumlah foto kamu sudah siap 🎉" : 'Foto kamu sudah siap 🎉' }}</h1>
    <p class="kecil">Informatics · Politeknik Caltex Riau</p>

    @if ($jumlah > 1 && $bisaZip)
        <div class="utama">
            <a class="tombol" href="{{ route('photobooth.semua', $kode) }}">⬇ Unduh semua ({{ $jumlah }} foto)</a>
        </div>
    @endif

    @for ($i = 1; $i <= $jumlah; $i++)
        <div class="kartu">
            @if ($jumlah > 1)
                <span class="nomor">Foto {{ $i }} dari {{ $jumlah }}</span>
            @endif
            <img src="{{ route('photobooth.gambar', [$kode, $i]) }}" alt="Hasil foto photobooth {{ $i }}">
            <div style="margin-top:12px">
                <a class="tombol" href="{{ route('photobooth.unduh', [$kode, $i]) }}">⬇ Unduh foto ini</a>
            </div>
        </div>
    @endfor

    @if (config('photobooth.hapus_setelah_unduh'))
        <p class="ingat">
            ⚠ Setiap foto <b>langsung dihapus dari server setelah diunduh</b>, jadi pastikan unduhannya
            selesai. Kalau gagal, minta panitia mengirim ulang.
            @if ($jumlah > 1 && $bisaZip)
                Tombol <b>Unduh semua</b> membereskan seluruh foto sesi ini sekaligus.
            @endif
        </p>
    @endif

    <p class="kecil" style="margin-top:18px">
        Di iPhone, kalau tombol unduh tidak jalan: tekan lama gambarnya lalu pilih <b>Add to Photos</b>.<br>
        Kode sesi: <b>{{ $kode }}</b>
    </p>
</div>
</body>
</html>
