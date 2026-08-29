<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
    <meta name="robots" content="noindex,nofollow">
    <title>Foto Photobooth</title>
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
            padding: 14px; margin-bottom: 16px;
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
        }
        .tombol:active { transform: translateY(1px) }
        .baris { display: flex; gap: 10px; flex-wrap: wrap }
        .baris > * { flex: 1 1 180px }
        b { color: #e6e8f2 }
    </style>
</head>
<body>
<div class="bungkus">
    <h1>Foto kamu sudah siap 🎉</h1>
    <p class="kecil">Informatics · Politeknik Caltex Riau</p>

    <div class="kartu">
        <img src="{{ route('photobooth.gambar', $kode) }}" alt="Hasil foto photobooth">
    </div>

    <div class="baris">
        <a class="tombol" href="{{ route('photobooth.unduh', $kode) }}">⬇ Unduh Foto</a>
        <a class="tombol kedua" href="{{ route('photobooth.gambar', $kode) }}" target="_blank" rel="noopener">
            Buka gambar penuh
        </a>
    </div>

    <p class="kecil" style="margin-top:18px">
        Di iPhone, kalau tombol unduh tidak jalan: tekan lama gambarnya lalu pilih <b>Add to Photos</b>.<br>
        Kode foto: <b>{{ $kode }}</b>
    </p>
</div>
</body>
</html>
