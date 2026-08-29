import { Head } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';

const LEBAR_PRATINJAU = 1280;
const MUTU_JPEG = 0.92;

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

export default function PhotoboothIndex({ frame, area, csrf }) {
    const videoRef = useRef(null);
    const kanvasRef = useRef(null);
    const kanvasQrRef = useRef(null);
    const frameRef = useRef(null);
    const streamRef = useRef(null);
    const rafRef = useRef(0);
    const mundurRef = useRef(null);
    const hasilRef = useRef(null); // { blob, objectUrl }

    const [fase, setFase] = useState('memuat'); // memuat | siap | mundur | tinjau
    const [hitung, setHitung] = useState(0);
    const [kilat, setKilat] = useState(false);
    const [cermin, setCermin] = useState(true);
    const [depan, setDepan] = useState(true);
    const [galat, setGalat] = useState('');
    const [sibuk, setSibuk] = useState(false);
    const [hasilUrl, setHasilUrl] = useState('');
    const [qr, setQr] = useState(null); // { url, kode }

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
        if (hasilRef.current?.objectUrl) URL.revokeObjectURL(hasilRef.current.objectUrl);
    }, [hentikanKamera]);

    // --- gambar pratinjau --------------------------------------------------
    useEffect(() => {
        const gambar = () => {
            rafRef.current = requestAnimationFrame(gambar);

            const kanvas = kanvasRef.current;
            const gbr = frameRef.current;
            if (!kanvas || !gbr || fase === 'tinjau') return;

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

        // tampilkan hasilnya di kanvas pratinjau
        const kanvas = kanvasRef.current;
        kanvas.getContext('2d').drawImage(luar, 0, 0, kanvas.width, kanvas.height);

        luar.toBlob((blob) => {
            if (!blob) return;
            const objectUrl = URL.createObjectURL(blob);
            hasilRef.current = { blob, objectUrl };
            setHasilUrl(objectUrl);
        }, 'image/jpeg', MUTU_JPEG);

        setFase('tinjau');
    }, [area, cermin]);

    const mulaiJepret = useCallback(() => {
        if (fase !== 'siap' || galat) return;

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
    }, [ambilGambar, fase, galat]);

    /** Membuang foto dari memori — tidak ada jejak yang tertinggal. */
    const ulangi = useCallback(() => {
        if (hasilRef.current?.objectUrl) URL.revokeObjectURL(hasilRef.current.objectUrl);
        hasilRef.current = null;
        setHasilUrl('');
        setQr(null);
        setFase('siap');
    }, []);

    const unduh = useCallback(() => {
        if (!hasilRef.current) return;
        const a = document.createElement('a');
        a.href = hasilRef.current.objectUrl;
        a.download = `photobooth-informatics-${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    }, []);

    const buatQr = useCallback(async () => {
        if (!hasilRef.current || sibuk) return;
        setSibuk(true);
        setGalat('');
        try {
            const form = new FormData();
            form.append('foto', hasilRef.current.blob, 'photobooth.jpg');

            const r = await fetch('/photobooth/jepret', {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrf, Accept: 'application/json' },
                body: form,
                credentials: 'same-origin',
            });
            const data = await r.json().catch(() => ({}));
            if (!r.ok || !data.url) throw new Error(data.message || `Gagal mengunggah (HTTP ${r.status})`);

            await import('@/lib/qrcode.js');
            setQr({ url: data.url, kode: data.kode });
        } catch (e) {
            setGalat(e.message);
        } finally {
            setSibuk(false);
        }
    }, [csrf, sibuk]);

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
    const tombolUtama = 'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-50 sm:text-base';

    return (
        <GuestLayout>
            <Head title="Photobooth" />

            <div className="mx-auto max-w-5xl">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl">
                        Photobooth Informatics
                    </h1>
                    <p className="mt-2 text-sm text-neutral-600">
                        Berfoto dengan frame acara, lalu unduh langsung atau scan QR-nya pakai HP-mu.
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

                    {(fase === 'memuat' || galat) && (
                        <div className="absolute inset-0 grid place-items-center bg-neutral-900/85 p-6 text-center">
                            <p className="max-w-md text-sm leading-relaxed font-medium text-white">
                                {galat || 'Menyiapkan kamera…'}
                            </p>
                        </div>
                    )}
                </div>

                {/* kontrol */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    {fase !== 'tinjau' ? (
                        <>
                            <button
                                type="button"
                                onClick={mulaiJepret}
                                disabled={fase !== 'siap' || !!galat}
                                className={`${tombolUtama} bg-pcrred-600 text-white hover:bg-pcrred-700`}
                            >
                                <span className="h-4 w-4 rounded-full bg-white ring-3 ring-white/40" />
                                Ambil Foto
                            </button>
                            <button
                                type="button"
                                onClick={() => setCermin((c) => !c)}
                                className={`${tombolUtama} border border-neutral-200 bg-white text-neutral-700 hover:border-pcr-300 hover:text-pcr-700`}
                            >
                                {cermin ? 'Efek cermin: aktif' : 'Efek cermin: mati'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setDepan((d) => !d)}
                                className={`${tombolUtama} border border-neutral-200 bg-white text-neutral-700 hover:border-pcr-300 hover:text-pcr-700`}
                            >
                                Ganti kamera
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={unduh}
                                disabled={!hasilUrl}
                                className={`${tombolUtama} bg-pcr-700 text-white hover:bg-pcr-800`}
                            >
                                ⬇ Unduh Foto
                            </button>
                            <button
                                type="button"
                                onClick={buatQr}
                                disabled={!hasilUrl || sibuk || !!qr}
                                className={`${tombolUtama} bg-pcrred-600 text-white hover:bg-pcrred-700`}
                            >
                                {sibuk ? 'Menyiapkan…' : 'Scan QR ke HP'}
                            </button>
                            <button
                                type="button"
                                onClick={ulangi}
                                className={`${tombolUtama} border border-neutral-200 bg-white text-neutral-700 hover:border-pcr-300 hover:text-pcr-700`}
                            >
                                ↺ Ulangi
                            </button>
                        </>
                    )}
                </div>

                {/* QR */}
                {qr && (
                    <div className="mt-6 flex flex-col items-center gap-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-lg sm:flex-row sm:items-center sm:justify-center sm:gap-8">
                        <canvas ref={kanvasQrRef} className="h-auto w-56 rounded-2xl sm:w-64" />
                        <div className="max-w-sm text-center sm:text-left">
                            <p className="text-base font-bold text-neutral-900">Scan pakai kamera HP</p>
                            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                                Foto akan <b>langsung dihapus dari server</b> begitu selesai kamu unduh, dan
                                hilang sendiri setelah 60 menit kalau tidak diunduh.
                            </p>
                            <p className="mt-2 font-mono text-xs break-all text-pcr-700">{qr.url}</p>
                        </div>
                    </div>
                )}

                <p className="mt-6 text-center text-xs leading-relaxed text-neutral-500">
                    Foto diproses di perangkat ini. Tombol <b>Unduh</b> tidak mengirim apa pun ke server —
                    hanya tombol <b>Scan QR</b> yang menitipkan foto sebentar supaya bisa dibuka dari HP.
                </p>
            </div>
        </GuestLayout>
    );
}
