<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
    <meta name="robots" content="noindex,nofollow">
    <title>Foto sudah tidak tersedia</title>
    <style>
        :root { color-scheme: dark }
        * { box-sizing: border-box }
        body {
            margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px;
            color: #f2f2f7; text-align: center;
            font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
            background:
                radial-gradient(1000px 700px at 15% -10%, #3a0d12 0%, transparent 60%),
                #07070c;
        }
        .kotak { max-width: 460px }
        .ikon { font-size: 48px; margin-bottom: 10px }
        h1 { font-size: 21px; margin: 0 0 10px }
        p { color: #9aa0b4; font-size: 14px; line-height: 1.6; margin: 0 0 12px }
        b { color: #e6e8f2 }
    </style>
</head>
<body>
<div class="kotak">
    <div class="ikon">🕊️</div>
    <h1>Foto sudah tidak tersedia</h1>
    <p>
        Foto photobooth hanya <b>dititipkan sebentar</b> di server dan langsung dihapus begitu selesai
        diunduh{{ $menit > 0 ? ', atau paling lama '.$menit.' menit setelah diambil' : '' }}.
    </p>
    <p>
        Kalau unduhanmu tadi gagal, minta tolong panitia photobooth — salinan fotonya masih ada di
        laptop mereka.
    </p>
</div>
</body>
</html>
