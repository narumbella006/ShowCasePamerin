import { Head } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';

const LEBAR_PRATINJAU = 1280;
const MUTU_JPEG = 0.92;
const JEDA_TINJAU = 1300; // ms hasil jepretan ditahan di layar sebelum kembali live

/** Menggambar sumber video secara "cover" ke dalam kotak lubang frame. */
function gambarPenuhi(ctx, sumber, sw, sh, dx, dy, dw, dh, cermin) {
    if (!sw || !sh) return;

    const skala = Math.max(dw / sw, dh / sh);
    const w = sw * skala;
    const h = sh * skala;
    const x = dx + (dw - w) / 2;
    const y = dy + (dh - h) / 2;

    ctx.save();
    ctx.beginPath();
    ctx.rect(dx, dy, dw, dh);
    ctx.clip();
    if (cermin) {
        ctx.translate(x + w / 2, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(sumber, -w / 2, y, w, h);
    } else {
        ctx.drawImage(sumber, x, y, w, h);
    }
    ctx.restore();
}

export default function PhotoboothIndex({ frame, area, maksFoto = 4, csrf }) {
    const videoRef = useRef(null);
    const kanvasRef = useRef(null);
    const kanvasQrRef = useRef(null);
    const frameRef = useRef(null);
    const streamRef = useRef(null);
    const rafRef = useRef(0);
    const mundurRef = useRef(null);
    const jedaRef = useRef(null);

    const [fase, setFase] = useState('memuat'); // memuat | siap | mundur | jeda
    const [hitung, setHitung] = useState(0);
    const [kilat, setKilat] = useState(false);
    const [cermin, setCermin] = useState(true);
    const [depan, setDepan] = useState(true);
    const [galat, setGalat] = useState('');
    const [sibuk, setSibuk] = useState(false);
    const [koleksi, setKoleksi] = useState([]); // [{ id, blob, url }]
    const [qr, setQr] = useState(null); // { url, kode, jumlah }

    // Cermin koleksi untuk dibaca handler tanpa membuatnya bergantung pada state
    // — supaya object URL hanya dibebaskan saat fotonya memang dibuang.
    const koleksiRef = useRef([]);
    useEffect(() => {
        koleksiRef.current = koleksi;
    }, [koleksi]);

    const penuh = koleksi.length >= maksFoto;

    // --- frame -------------------------------------------------------------
    useEffect(() => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            frameRef.current = img;
            const kanvas = kanvasRef.current;
            if (kanvas) {
                kanvas.width = Math.min(LEBAR_PRATINJAU, img.naturalWidth);
                kanvas.height = Math.round(kanvas.width * img.naturalHeight / img.naturalWidth);
            }
            setFase((f) => (f === 'memuat' ? 'siap' : f));
        };
        img.onerror = () => setGalat('Frame photobooth gagal dimuat. Coba muat ulang halaman.');
        img.src = frame;
    }, [frame]);

    // --- kamera ------------------------------------------------------------
    const hentikanKamera = useCallback(() => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
    }, []);

    useEffect(() => {
        let batal = false;

        (async () => {
            hentikanKamera();
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: depan ? 'user' : 'environment',
                        width: { ideal: 1920 },
                        height: { ideal: 1080 },
                    },
                    audio: false,
                });
                if (batal) {
                    stream.getTracks().forEach((t) => t.stop());
                    return;
                }
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play().catch(() => {});
                }
                setGalat('');
            } catch (e) {
                setGalat(
                    e.name === 'NotAllowedError'
                        ? 'Izin kamera ditolak. Klik ikon gembok di bilah alamat, izinkan kamera, lalu muat ulang halaman.'
                        : e.name === 'NotFoundError'
                            ? 'Kamera tidak terdeteksi di perangkat ini.'
                            : `Kamera tidak bisa dipakai: ${e.message}`,
                );
            }
        })();

        return () => {
            batal = true;
        };
    }, [depan, hentikanKamera]);

    useEffect(() => () => {
        hentikanKamera();
        cancelAnimationFrame(rafRef.current);
        clearInterval(mundurRef.current);
        clearTimeout(jedaRef.current);
        koleksiRef.current.forEach((f) => URL.revokeObjectURL(f.url));
    }, [hentikanKamera]);

    // --- gambar pratinjau --------------------------------------------------
    useEffect(() => {
        const gambar = () => {
            rafRef.current = requestAnimationFrame(gambar);

            const kanvas = kanvasRef.current;
            const gbr = frameRef.current;
            if (!kanvas || !gbr || fase === 'jeda') return;

            const ctx = kanvas.getContext('2d');
            const skala = kanvas.width / gbr.naturalWidth;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, kanvas.width, kanvas.height);

            const video = videoRef.current;
            if (video?.videoWidth) {
                gambarPenuhi(
                    ctx, video, video.videoWidth, video.videoHeight,
                    area.x * gbr.naturalWidth * skala, area.y * gbr.naturalHeight * skala,
                    area.w * gbr.naturalWidth * skala, area.h * gbr.naturalHeight * skala,
                    cermin,
                );
            }
            ctx.drawImage(gbr, 0, 0, kanvas.width, kanvas.height);
        };

        rafRef.current = requestAnimationFrame(gambar);
        return () => cancelAnimationFrame(rafRef.current);
    }, [area, cermin, fase]);

    // --- jepret ------------------------------------------------------------
    const ambilGambar = useCallback(() => {
        const gbr = frameRef.current;
        const video = videoRef.current;
        if (!gbr) return;

        setKilat(true);
        setTimeout(() => setKilat(false), 420);

        const W = gbr.naturalWidth;
        const H = gbr.naturalHeight;
        const luar = document.createElement('canvas');
        luar.width = W;
        luar.height = H;
        const ctx = luar.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, W, H);
        if (video?.videoWidth) {
            gambarPenuhi(
                ctx, video, video.videoWidth, video.videoHeight,
                area.x * W, area.y * H, area.w * W, area.h * H, cermin,
            );
        }
        ctx.drawImage(gbr, 0, 0);

        // tahan hasilnya sebentar di kanvas supaya pengunjung sempat melihatnya
        const kanvas = kanvasRef.current;
        kanvas.getContext('2d').drawImage(luar, 0, 0, kanvas.width, kanvas.height);
        setFase('jeda');
        clearTimeout(jedaRef.current);
        jedaRef.current = setTimeout(() => setFase('siap'), JEDA_TINJAU);

        luar.toBlob((blob) => {
            if (!blob) return;
            setKoleksi((k) => [...k, { id: `${Date.now()}-${k.length}`, blob, url: URL.createObjectURL(blob) }]);
        }, 'image/jpeg', MUTU_JPEG);
    }, [area, cermin]);

    const mulaiJepret = useCallback(() => {
        if (fase !== 'siap' || galat || penuh) return;

        setFase('mundur');
        setHitung(3);
        clearInterval(mundurRef.current);
        mundurRef.current = setInterval(() => {
            setHitung((n) => {
                if (n <= 1) {
                    clearInterval(mundurRef.current);
                    ambilGambar();
                    return 0;
                }
                return n - 1;
            });
        }, 1000);
    }, [ambilGambar, fase, galat, penuh]);

    /** Membuang satu foto dari sesi — tidak ada jejak yang tertinggal. */
    const buangFoto = useCallback((id) => {
        const dibuang = koleksiRef.current.find((f) => f.id === id);
        if (dibuang) URL.revokeObjectURL(dibuang.url);

        setKoleksi((k) => k.filter((f) => f.id !== id));
        setQr(null);
    }, []);

    const mulaiSesiBaru = useCallback(() => {
        koleksiRef.current.forEach((f) => URL.revokeObjectURL(f.url));

        setKoleksi([]);
        setQr(null);
        setFase('siap');
    }, []);

    const unduhSatu = useCallback((foto, urutan) => {
        const a = document.createElement('a');
        a.href = foto.url;
        a.download = `photobooth-informatics-${foto.id}-${urutan}.jpg`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    }, []);

    const unduhSemua = useCallback(async () => {
        for (let i = 0; i < koleksi.length; i += 1) {
            unduhSatu(koleksi[i], i + 1);
            // Jeda kecil: sebagian browser mengabaikan unduhan beruntun tanpa
            // spasi, dan browser juga meminta izin "unduh banyak berkas" sekali.
            // Kalau izinnya ditolak, tombol unduh di tiap foto tetap jalan.
            await new Promise((r) => setTimeout(r, 400));
        }
    }, [koleksi, unduhSatu]);

    const buatQr = useCallback(async () => {
        if (!koleksi.length || sibuk) return;
        setSibuk(true);
        setGalat('');
        try {
            const form = new FormData();
            koleksi.forEach((f, i) => form.append('foto[]', f.blob, `photobooth-${i + 1}.jpg`));

            const r = await fetch('/photobooth/jepret', {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrf, Accept: 'application/json' },
                body: form,
                credentials: 'same-origin',
            });
            const data = await r.json().catch(() => ({}));
            if (!r.ok || !data.url) throw new Error(data.message || `Gagal mengunggah (HTTP ${r.status})`);

            await import('@/lib/qrcode.js');
            setQr({ url: data.url, kode: data.kode, jumlah: data.jumlah });
        } catch (e) {
            setGalat(e.message);
        } finally {
            setSibuk(false);
        }
    }, [csrf, koleksi, sibuk]);

    // QR digambar setelah kanvasnya benar-benar ada di layar
    useEffect(() => {
        if (!qr || !kanvasQrRef.current || !window.QRCode) return;
        window.QRCode.toCanvas(kanvasQrRef.current, qr.url, {
            width: 420,
            margin: 2,
            errorCorrectionLevel: 'M',
            color: { dark: '#0b1a2b', light: '#ffffff' },
        }, () => {
            // library menulis inline style yang bisa membuat QR jadi tidak persegi
            kanvasQrRef.current.style.width = '';
            kanvasQrRef.current.style.height = '';
        });
    }, [qr]);

    // --- tampilan ----------------------------------------------------------
    const tombol = 'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-50 sm:text-base';
    const tombolPutih = `${tombol} border border-neutral-200 bg-white text-neutral-700 shadow-sm hover:border-pcr-300 hover:text-pcr-700`;

    return (
        <GuestLayout>
            <Head title="Photobooth" />

            <div className="mx-auto max-w-5xl">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl">
                        Photobooth Informatics
                    </h1>
                    <p className="mt-2 text-sm text-neutral-600">
                        Ambil sampai {maksFoto} foto, lalu unduh semuanya sekaligus atau scan QR-nya pakai HP-mu.
                    </p>
                </div>

                {/* panggung */}
                <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-900 shadow-xl">
                    <canvas ref={kanvasRef} className="block h-auto w-full" />
                    {/* Video tetap dirender (bukan display:none) — Safari iOS menolak
                        memutar stream dari elemen yang disembunyikan sepenuhnya. */}
                    <video ref={videoRef} playsInline muted className="pointer-events-none absolute h-px w-px opacity-0" />

                    {kilat && <div className="pointer-events-none absolute inset-0 bg-white opacity-70" />}

                    {fase === 'mundur' && hitung > 0 && (
                        <div className="pointer-events-none absolute inset-0 grid place-items-center">
                            <span className="text-[22vw] font-black leading-none text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.6)] sm:text-[9rem]">
                                {hitung}
                            </span>
                        </div>
                    )}

                    {koleksi.length > 0 && (
                        <span className="absolute top-4 right-4 rounded-full bg-black/65 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
                            {koleksi.length} / {maksFoto} foto
                        </span>
                    )}

                    {(fase === 'memuat' || galat) && (
                        <div className="absolute inset-0 grid place-items-center bg-neutral-900/85 p-6 text-center">
                            <p className="max-w-md text-sm leading-relaxed font-medium text-white">
                                {galat || 'Menyiapkan kamera…'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Frame acara berbentuk landscape, jadi di HP tegak pratinjaunya jadi
                    strip tipis. Petunjuk ini cuma muncul di layar kecil. */}
                <p className="mt-3 text-center text-xs text-neutral-500 sm:hidden">
                    Putar HP ke posisi mendatar untuk pratinjau yang lebih besar.
                </p>

                {/* kontrol utama */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <button
                        type="button"
                        onClick={mulaiJepret}
                        disabled={fase !== 'siap' || !!galat || penuh}
                        className={`${tombol} bg-pcrred-600 text-white hover:bg-pcrred-700`}
                    >
                        <span className="h-4 w-4 rounded-full bg-white ring-3 ring-white/40" />
                        {penuh ? `Sudah ${maksFoto} foto` : koleksi.length ? 'Ambil Foto Lagi' : 'Ambil Foto'}
                    </button>
                    <button type="button" onClick={() => setCermin((c) => !c)} className={tombolPutih}>
                        {cermin ? 'Efek cermin: aktif' : 'Efek cermin: mati'}
                    </button>
                    <button type="button" onClick={() => setDepan((d) => !d)} className={tombolPutih}>
                        Ganti kamera
                    </button>
                </div>

                {/* kumpulan foto */}
                {koleksi.length > 0 && (
                    <div className="mt-8 rounded-3xl border border-neutral-200 bg-white p-5 shadow-lg">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h2 className="text-sm font-bold text-neutral-900">
                                Foto terkumpul ({koleksi.length})
                            </h2>
                            <button
                                type="button"
                                onClick={mulaiSesiBaru}
                                className="text-xs font-bold text-neutral-500 underline underline-offset-4 hover:text-pcrred-600"
                            >
                                Kosongkan
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {koleksi.map((f, i) => (
                                <div key={f.id} className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
                                    <img src={f.url} alt={`Foto ${i + 1}`} className="block h-auto w-full" />
                                    <span className="absolute bottom-1 left-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-bold text-white">
                                        {i + 1}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => unduhSatu(f, i + 1)}
                                        aria-label={`Unduh foto ${i + 1}`}
                                        title="Unduh foto ini"
                                        className="absolute right-1 bottom-1 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-xs font-bold text-white transition-colors hover:bg-pcr-700"
                                    >
                                        ⬇
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => buangFoto(f.id)}
                                        aria-label={`Hapus foto ${i + 1}`}
                                        title="Hapus foto ini"
                                        className="absolute top-1 right-1 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-sm font-bold text-white transition-colors hover:bg-pcrred-600"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={unduhSemua}
                                className={`${tombol} bg-pcr-700 text-white hover:bg-pcr-800`}
                            >
                                ⬇ Unduh semua ({koleksi.length})
                            </button>
                            <button
                                type="button"
                                onClick={buatQr}
                                disabled={sibuk || !!qr}
                                className={`${tombol} bg-pcrred-600 text-white hover:bg-pcrred-700`}
                            >
                                {sibuk ? 'Menyiapkan…' : `Scan QR ke HP (${koleksi.length})`}
                            </button>
                        </div>
                    </div>
                )}

                {/* QR */}
                {qr && (
                    <div className="mt-6 flex flex-col items-center gap-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-lg sm:flex-row sm:items-center sm:justify-center sm:gap-8">
                        <canvas ref={kanvasQrRef} className="h-auto w-56 rounded-2xl sm:w-64" />
                        <div className="max-w-sm text-center sm:text-left">
                            <p className="text-base font-bold text-neutral-900">
                                Scan pakai kamera HP — {qr.jumlah} foto
                            </p>
                            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                                Halaman yang terbuka berisi semua foto sesi ini, masing-masing dengan tombol
                                unduhnya sendiri. Tiap foto <b>langsung dihapus dari server</b> begitu selesai
                                diunduh, dan hilang sendiri setelah 60 menit kalau tidak diunduh.
                            </p>
                            <p className="mt-2 font-mono text-xs break-all text-pcr-700">{qr.url}</p>
                        </div>
                    </div>
                )}

                <p className="mt-6 text-center text-xs leading-relaxed text-neutral-500">
                    Foto diproses di perangkat ini. Tombol <b>Unduh semua</b> tidak mengirim apa pun ke server —
                    hanya tombol <b>Scan QR</b> yang menitipkan foto sebentar supaya bisa dibuka dari HP.
                </p>
            </div>
        </GuestLayout>
    );
}
