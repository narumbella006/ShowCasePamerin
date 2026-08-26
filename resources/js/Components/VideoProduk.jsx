import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Pemutar video YouTube yang dikendalikan lewat IFrame Player API.
 *
 * Alasan memakai API, bukan sekadar menyisipkan <iframe>:
 *  - Tombol Putar/Jeda jadi milik kita sendiri. Kalau hanya mengandalkan
 *    kontrol bawaan YouTube, klik harus mendarat tepat di dalam iframe dan
 *    tidak ada cara memastikannya dari luar.
 *  - `controls: 0` mematikan chrome YouTube selama video berjalan, termasuk
 *    judul dan nama channel. Ini parameter resmi YouTube, bukan trik menutupi
 *    branding dengan CSS.
 *
 * Tombol "Perbesar" sengaja TIDAK memakai Fullscreen API. API itu bisa
 * ditolak browser tanpa penjelasan, tidak didukung Safari iOS pada elemen
 * biasa, dan gagalnya senyap. Sebagai gantinya bingkainya dijadikan lapisan
 * `fixed` yang menutupi layar — hasilnya sama besar, tapi pasti bekerja di
 * semua browser dan tidak butuh izin apa pun.
 */

const SKRIP_API = 'https://www.youtube.com/iframe_api';
let promiseApi = null;

function muatApiYoutube() {
    if (window.YT?.Player) {
        return Promise.resolve(window.YT);
    }

    if (promiseApi) {
        return promiseApi;
    }

    promiseApi = new Promise((resolve, reject) => {
        const sebelumnya = window.onYouTubeIframeAPIReady;

        window.onYouTubeIframeAPIReady = () => {
            sebelumnya?.();
            resolve(window.YT);
        };

        if (!document.querySelector(`script[src="${SKRIP_API}"]`)) {
            const tag = document.createElement('script');

            tag.src = SKRIP_API;
            tag.async = true;
            tag.onerror = () => reject(new Error('Skrip YouTube gagal dimuat'));
            document.head.appendChild(tag);
        }
    });

    return promiseApi;
}

export default function VideoProduk({ videoId, title = 'Video produk', label = 'Putar Video' }) {
    const akarRef = useRef(null);
    const wadahPlayerRef = useRef(null);
    const playerRef = useRef(null);

    const [diputar, setDiputar] = useState(false);
    const [berjalan, setBerjalan] = useState(false);
    const [diperbesar, setDiperbesar] = useState(false);
    const [gagal, setGagal] = useState(null);
    const [thumbnail, setThumbnail] = useState(
        `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    );

    useEffect(() => () => playerRef.current?.destroy?.(), []);

    // Tutup tampilan besar dengan Esc, dan kunci gulir halaman selama terbuka
    // supaya latar di belakangnya tidak ikut bergerak.
    useEffect(() => {
        if (!diperbesar) return undefined;

        const onKey = (e) => e.key === 'Escape' && setDiperbesar(false);
        const gulirSemula = document.body.style.overflow;

        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', onKey);

        // Tailwind v4 memakai properti CSS `translate` yang berdiri sendiri
        // untuk utilitas seperti `translate-y-0`, dan properti itu membuat
        // elemennya jadi containing block bagi keturunan `position: fixed`.
        // Akibatnya lapisan besar hanya sebesar section pembungkusnya, bukan
        // selayar penuh. Nilainya 0px alias tidak berpengaruh visual, jadi
        // aman dimatikan sementara lalu dipulihkan saat ditutup.
        const dipulihkan = [];
        let node = akarRef.current?.parentElement;

        while (node && node !== document.body) {
            const cs = getComputedStyle(node);

            if (cs.translate !== 'none' || cs.scale !== 'none' || cs.rotate !== 'none') {
                dipulihkan.push([node, node.style.translate, node.style.scale, node.style.rotate]);
                node.style.translate = 'none';
                node.style.scale = 'none';
                node.style.rotate = 'none';
            }

            node = node.parentElement;
        }

        return () => {
            dipulihkan.forEach(([el, translate, scale, rotate]) => {
                el.style.translate = translate;
                el.style.scale = scale;
                el.style.rotate = rotate;
            });
            document.body.style.overflow = gulirSemula;
            document.removeEventListener('keydown', onKey);
        };
    }, [diperbesar]);

    const mulai = useCallback(async () => {
        setDiputar(true);

        try {
            const YT = await muatApiYoutube();

            playerRef.current = new YT.Player(wadahPlayerRef.current, {
                videoId,
                playerVars: {
                    autoplay: 1,
                    controls: 0,
                    rel: 0,
                    modestbranding: 1,
                    iv_load_policy: 3,
                    playsinline: 1,
                },
                events: {
                    onStateChange: (e) => setBerjalan(e.data === YT.PlayerState.PLAYING),
                    onError: () => setGagal('Video tidak dapat dimuat.'),
                },
            });
        } catch {
            setGagal('Gagal memuat pemutar YouTube. Periksa koneksi internet.');
        }
    }, [videoId]);

    const togglePutar = () => {
        const player = playerRef.current;

        if (!player) return;

        if (berjalan) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    };

    const kelasBingkai = diperbesar
        ? 'fixed inset-0 z-[100] flex items-center justify-center bg-black'
        : 'relative aspect-video overflow-hidden rounded-2xl border-2 border-pcr-900 bg-pcr-900 shadow-2xl';

    return (
        <div ref={akarRef} className="w-full">
            <div className="relative">
                {!diperbesar && (
                    <>
                        <span
                            aria-hidden="true"
                            className="pointer-events-none absolute -top-2.5 -left-2.5 hidden h-full w-full rounded-2xl bg-pcr-500/45 sm:block"
                        />
                        <span
                            aria-hidden="true"
                            className="pointer-events-none absolute -right-2.5 -bottom-2.5 hidden h-full w-full rounded-2xl bg-pcrred-500/45 sm:block"
                        />
                    </>
                )}

                {/* Ruang cadangan supaya tata letak tidak melompat saat bingkainya
                    berpindah ke mode `fixed`. */}
                {diperbesar && <div className="aspect-video w-full rounded-2xl bg-neutral-200" />}

                <div className={kelasBingkai}>
                    <div
                        className={
                            diperbesar
                                ? 'relative aspect-video max-h-full w-full max-w-[min(100vw,177.78vh)]'
                                : 'absolute inset-0'
                        }
                    >
                        {diputar ? (
                            <>
                                <div ref={wadahPlayerRef} className="h-full w-full" />
                                {/* Lapisan tipis di atas iframe supaya klik di badan
                                    video ikut menjeda, bukan diteruskan ke YouTube. */}
                                <button
                                    type="button"
                                    onClick={togglePutar}
                                    aria-label={berjalan ? 'Jeda video' : 'Lanjutkan video'}
                                    className="absolute inset-0 h-full w-full cursor-pointer bg-transparent"
                                />
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={mulai}
                                aria-label={label}
                                className="group absolute inset-0 h-full w-full"
                            >
                                <img
                                    src={thumbnail}
                                    alt={title}
                                    loading="lazy"
                                    onError={() =>
                                        setThumbnail(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`)
                                    }
                                    className="h-full w-full object-cover"
                                />
                                <span className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-pcr-900/45 transition-colors group-hover:bg-pcr-900/25">
                                    <span className="relative flex size-16 items-center justify-center rounded-full bg-pcrred-500 shadow-lg transition-transform group-hover:scale-110 sm:size-20">
                                        <span className="absolute inset-0 animate-ping rounded-full bg-pcrred-500 opacity-50" />
                                        <svg
                                            className="relative ml-1 h-7 w-7 text-white sm:h-9 sm:w-9"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </span>
                                    <span className="text-sm font-bold text-white drop-shadow sm:text-base">
                                        {label}
                                    </span>
                                </span>
                            </button>
                        )}
                    </div>

                    {diperbesar && (
                        <button
                            type="button"
                            onClick={() => setDiperbesar(false)}
                            className="absolute top-4 right-4 z-10 inline-flex items-center gap-2 rounded-lg border-2 border-white/70 bg-black/60 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-black/80"
                        >
                            Tutup ✕
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
                {diputar ? (
                    <button
                        type="button"
                        onClick={togglePutar}
                        className="inline-flex items-center gap-2 rounded-lg border-2 border-pcr-300 bg-white px-4 py-2 text-xs font-bold text-pcr-700 transition-all hover:bg-pcr-50 sm:text-sm"
                    >
                        {berjalan ? (
                            <>
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
                                </svg>
                                Jeda
                            </>
                        ) : (
                            <>
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                                Lanjutkan
                            </>
                        )}
                    </button>
                ) : (
                    <p className="text-xs text-neutral-500 sm:text-sm">Klik untuk memutar video.</p>
                )}

                <button
                    type="button"
                    onClick={() => setDiperbesar((v) => !v)}
                    className="inline-flex items-center gap-2 rounded-lg border-2 border-pcr-300 bg-white px-4 py-2 text-xs font-bold text-pcr-700 transition-all hover:bg-pcr-50 sm:text-sm"
                >
                    <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                        />
                    </svg>
                    Perbesar
                </button>
            </div>

            {gagal && <p className="mt-2 text-xs font-medium text-pcrred-600">{gagal}</p>}
        </div>
    );
}
