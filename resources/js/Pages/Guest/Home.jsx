import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import VideoProduk from '@/Components/VideoProduk';
import Reveal from '@/Components/Reveal';
import GuestLayout from '@/Layouts/GuestLayout';
import DepthCarousel from '@/ReactBits/DepthCarousel/DepthCarousel';
import DriftWall from '@/ReactBits/DriftWall/DriftWall';
import FoldText from '@/ReactBits/FoldText/FoldText';
import robloxPoster from '@/img/PCR Roblox.jpg';
import heroPhoto from '@/img/PCR.webp';

const ROBLOX_MAP = {
    title: 'Politeknik Caltex Riau BETA',
    description:
        'Selain riset dan sistem informasi, mahasiswa TI PCR juga bikin replika kampus dalam bentuk peta Roblox yang bisa dijelajahi langsung — cocok buat kenalan sama suasana kampus dengan cara yang lebih santai.',
    image: robloxPoster,
    link: 'https://www.roblox.com/id/games/128983665710473/Politeknik-Caltex-Riau-BETA',
    creators: ['Ahmad Yudha Yazril — G19 TI D', 'Rasyid Tarmizi — G20 TI B'],
};

const RANCANGAN_PA = [
    {
        jenis: 'Web',
        judul: 'Rancang Bangun Sistem Informasi Web untuk Pengelolaan Setoran Minyak Jelantah Menggunakan Metode Agile Kanban pada Bank Jatah Indonesia',
        mahasiswa: 'Azzam Farras Ruslani',
    },
    {
        jenis: 'Mobile',
        judul: 'Rancang Bangun Aplikasi Mobile Bank Jatah Indonesia Menggunakan Metode Agile Kanban pada Bank Jatah Indonesia',
        mahasiswa: 'Tengku Muhammad Hadin Nazmi',
    },
];

const FITUR_BANK_JATAH = [
    'Setor jelantah, saldo langsung masuk',
    'Pantau tabungan dari aplikasi',
    'Tukar saldo jadi reward',
    'Cairkan saldo ke rekening',
];

const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

function isRecentlyPublished(publishedAt) {
    if (!publishedAt) return false;
    return Date.now() - new Date(publishedAt).getTime() < FOURTEEN_DAYS_MS;
}

export default function Home({ products, categories, academicYears, tags, stats, posters, filters }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [activeShowcase, setActiveShowcase] = useState(null);
    const [showreelOpen, setShowreelOpen] = useState(false);

    // Tanpa preserveScroll, Inertia mengembalikan gulir ke puncak halaman
    // sehingga pengguna terlempar ke hero setiap ganti halaman atau filter.
    //
    // Penggulirannya dijalankan lewat efek, bukan callback onSuccess, karena
    // onSuccess menyala sebelum React selesai memasang daftar produk yang
    // baru — posisi section masih posisi lama dan gulirannya meleset.
    const renderPertama = useRef(true);
    const tandaHalaman = [
        products.current_page,
        filters.search ?? '',
        filters.category ?? '',
        filters.academic_year ?? '',
    ].join('|');

    useEffect(() => {
        if (renderPertama.current) {
            renderPertama.current = false;

            return;
        }

        document.getElementById('produk')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [tandaHalaman]);

    const applyFilters = (overrides = {}) => {
        router.get(
            '/',
            {
                search,
                category: filters.category ?? '',
                academic_year: filters.academic_year ?? '',
                ...overrides,
            },
            { preserveState: true, replace: true, preserveScroll: true }
        );
    };

    const gantiHalaman = (url) => {
        router.get(url, {}, { preserveState: true, preserveScroll: true });
    };

    const noResults = filters.search || filters.category || filters.academic_year;

    const showcaseItems = useMemo(
        () => [
            ...posters.map((p) => ({ image: p.image, alt: p.title, title: p.title, slug: p.slug })),
            { image: ROBLOX_MAP.image, alt: ROBLOX_MAP.title, title: ROBLOX_MAP.title, href: ROBLOX_MAP.link },
        ],
        [posters]
    );

    const driftItems = useMemo(
        () => [
            ...posters.map((p) => ({ image: p.image, title: p.title })),
            { image: ROBLOX_MAP.image, title: ROBLOX_MAP.title, href: ROBLOX_MAP.link },
        ],
        [posters]
    );

    const active = activeShowcase ?? showcaseItems[0] ?? null;

    return (
        <GuestLayout>
            <Head title="Katalog Produk" />

            {/* Hero Section — min-h-[100svh] menutupi tinggi layar penuh pada HP */}
            <Reveal
                as="section"
                className="relative w-screen ml-[calc(-50vw+50%)] mb-12 flex min-h-[100svh] flex-col justify-center overflow-hidden sm:mb-16 sm:min-h-screen"
            >
                <img
                    src={heroPhoto}
                    alt="Mahasiswa Teknik Informatika PCR"
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-r from-pcr-900/95 via-pcr-900/80 to-pcr-900/40" />
                <div className="absolute inset-0 bg-linear-to-t from-pcr-900/90 via-transparent to-transparent" />

                <div className="relative mx-auto w-full max-w-7xl px-4 pt-24 pb-16 sm:px-8 sm:pt-32 sm:pb-20 lg:px-12 xl:px-16">
                    <p className="text-sm font-semibold tracking-wide text-white/80">Galeri Karya</p>

                    <h1 className="mt-3 flex flex-col gap-1 text-3xl leading-tight font-extrabold tracking-tight text-white sm:gap-2 sm:text-5xl lg:text-7xl">
                        <span className="block">
                            <FoldText
                                text="Project Showcase"
                                splitBy="word"
                                hinge="top"
                                trigger="mount"
                                duration={0.7}
                                stagger={0.08}
                                fontSize="inherit"
                                fontWeight="inherit"
                                color="#ffffff"
                            />
                        </span>
                        <span className="block text-pcr-200">
                            <FoldText
                                text="Teknik Informatika"
                                splitBy="word"
                                hinge="top"
                                trigger="mount"
                                duration={0.7}
                                stagger={0.08}
                                fontSize="inherit"
                                fontWeight="inherit"
                                color="inherit"
                            />
                        </span>
                    </h1>
                    <div className="mt-6 h-1.5 w-full max-w-[200px] rounded-full bg-pcrred-500 sm:mt-8 sm:max-w-md" />

                    <p className="mt-5 max-w-xl font-mono text-[10px] tracking-widest text-white/60 uppercase sm:mt-6 sm:text-xs">
                        Beranda / Katalog Produk /{' '}
                        <span className="text-pcrred-400">Project Showcase</span>
                    </p>

                    <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/85 sm:mt-6 sm:text-lg">
                        Galeri portofolio produk unggulan hasil karya mahasiswa Program Studi D4 Teknik
                        Informatika Politeknik Caltex Riau. Kami menghadirkan inovasi teknologi yang berdampak.
                    </p>

                    {/* Tombol CTA dibuat w-full dan flex-col di mobile agar tidak bertumpuk / overflow */}
                    <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-4">
                        <a
                            href="#produk"
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('produk')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="w-full rounded-lg border-2 border-pcr-900 bg-pcrred-500 px-8 py-3.5 text-center text-sm font-bold text-white shadow-[4px_4px_0_0_#00131a] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#00131a] sm:w-auto"
                        >
                            Jelajahi Karya
                        </a>
                        <a
                            href="https://pcr.ac.id/program-studi/ti#tentang-program-studi"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full rounded-lg border-2 border-white/70 bg-white/10 px-8 py-3.5 text-center text-sm font-bold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20 sm:w-auto"
                        >
                            Tentang Prodi
                        </a>
                    </div>

                    {/* Tombol Showreel dibikin full width di HP dan ngikut alur, lalu absolute di Desktop */}
                    <button
                        type="button"
                        onClick={() => setShowreelOpen(true)}
                        className="mt-4 flex w-full items-center justify-center gap-3 rounded-full border-2 border-pcr-900 bg-white px-4 py-3 shadow-[4px_4px_0_0_#00131a] transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_#00131a] sm:absolute sm:right-6 sm:bottom-10 sm:mt-0 sm:w-auto sm:justify-start lg:right-8"
                    >
                        <span className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-pcrred-500 sm:size-11">
                            <span className="absolute inset-0 animate-ping rounded-full bg-pcrred-500 opacity-60" />
                            <svg className="relative h-4 w-4 text-white sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </span>
                        <span className="text-left">
                            <span className="block text-sm font-bold text-neutral-900">Video Profile PCR</span>
                            <span className="block text-[10px] text-neutral-500 sm:text-xs">Tonton Showreel Singkat</span>
                        </span>
                    </button>
                </div>
            </Reveal>

            {/* Modal Showreel */}
            {showreelOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-pcr-900/95 p-4 backdrop-blur-sm sm:p-6"
                    onClick={() => setShowreelOpen(false)}
                >
                    <div className="relative w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            onClick={() => setShowreelOpen(false)}
                            className="absolute -top-12 right-0 rounded-lg border-2 border-white/70 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20"
                        >
                            Tutup ✕
                        </button>
                        <div className="aspect-video w-full overflow-hidden rounded-2xl border-2 border-pcr-900 shadow-2xl">
                            <iframe
                                className="h-full w-full border-none"
                                src="https://www.youtube.com/embed/D4HdqnHSQ0o?autoplay=1&rel=0&modestbranding=1"
                                title="Showreel PBL"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Strip — Di HP font-nya dikecilkan sedikit agar muat 3 kolom sempurna */}
            <Reveal
                as="section"
                className="mb-12 grid grid-cols-3 divide-x-2 divide-pcr-900/10 rounded-2xl border-2 border-pcr-900 bg-white sm:mb-16 sm:gap-0"
            >
                <div className="p-3 text-center sm:p-6">
                    <p className="font-mono text-[9px] font-bold tracking-widest text-pcrred-500 uppercase sm:text-[10px]">// 01</p>
                    <p className="mt-1 text-xl font-extrabold text-pcr-800 sm:text-3xl">{stats.products}+</p>
                    <p className="mt-1 text-[10px] font-medium leading-tight text-neutral-500 sm:text-sm">Karya Dipublikasikan</p>
                </div>
                <div className="p-3 text-center sm:p-6">
                    <p className="font-mono text-[9px] font-bold tracking-widest text-pcrred-500 uppercase sm:text-[10px]">// 02</p>
                    <p className="mt-1 text-xl font-extrabold text-pcr-800 sm:text-3xl">{stats.categories}</p>
                    <p className="mt-1 text-[10px] font-medium leading-tight text-neutral-500 sm:text-sm">Kategori</p>
                </div>
                <div className="p-3 text-center sm:p-6">
                    <p className="font-mono text-[9px] font-bold tracking-widest text-pcrred-500 uppercase sm:text-[10px]">// 03</p>
                    <p className="mt-1 text-xl font-extrabold text-pcr-800 sm:text-3xl">{stats.students}+</p>
                    <p className="mt-1 text-[10px] font-medium leading-tight text-neutral-500 sm:text-sm">Mahasiswa Terlibat</p>
                </div>
            </Reveal>

            {/* Rancangan PA — video produk di kanan, dua judul PA di kiri */}
            <Reveal
                as="section"
                className="relative mb-12 overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-xl sm:mb-16"
            >
                <div className="p-5 sm:p-8 lg:p-10">
                    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,36rem)] lg:items-center lg:gap-12">
                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full bg-pcrred-50 px-3 py-1.5 text-[10px] font-bold tracking-wide text-pcrred-600 uppercase sm:text-xs">
                            Proyek Akhir
                        </span>

                        <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-pcr-800 sm:text-3xl lg:text-4xl">
                            Inilah Salah Satu Rancangan PA Mahasiswa Teknik Informatika
                        </h2>

                        <div className="mt-4 h-1.5 w-24 rounded-full bg-pcrred-500" />

                        <p className="mt-5 text-justify text-sm leading-relaxed text-neutral-600 hyphens-auto sm:text-base">
                            Jutaan liter minyak jelantah dibuang sembarangan setiap hari.{' '}
                            <strong className="font-semibold text-pcr-800">Bank Jatah Indonesia</strong>{' '}
                            menjawabnya lewat satu sistem digital yang menghubungkan nasabah, unit bisnis,
                            dan manajemen pusat secara real-time — berupa aplikasi mobile Android untuk
                            lapangan dan dasbor web untuk operasional pusat.
                        </p>

                        <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                            {FITUR_BANK_JATAH.map((fitur) => (
                                <li key={fitur} className="flex items-start gap-2 text-sm text-neutral-700">
                                    <svg
                                        className="mt-0.5 h-4 w-4 shrink-0 text-pcr-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2.5}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                    {fitur}
                                </li>
                            ))}
                        </ul>

                    </div>

                    <div className="w-full">
                        <VideoProduk
                            videoId="44_YPLUIk3s"
                            title="Video Bank Jatah Indonesia"
                            label="Putar Video Bank Jatah"
                        />
                    </div>
                    </div>

                    <div className="mt-10 space-y-3 border-t border-neutral-200 pt-8">
                            <p className="font-mono text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
                                Dua Proyek Akhir dalam satu sistem
                            </p>
                            <div className="grid gap-3 lg:grid-cols-2">
                            {RANCANGAN_PA.map((pa, index) => (
                                <article
                                    key={pa.mahasiswa}
                                    className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 transition-colors hover:border-pcr-300 hover:bg-pcr-50"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-[10px] font-bold text-pcrred-500">
                                            // 0{index + 1}
                                        </span>
                                        <span className="rounded-full bg-pcr-600 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
                                            {pa.jenis}
                                        </span>
                                    </div>
                                    <h3 className="mt-2 text-sm leading-snug font-bold text-pcr-800 sm:text-base">
                                        {pa.judul}
                                    </h3>
                                    <p className="mt-1.5 text-xs font-medium text-neutral-500 sm:text-sm">
                                        {pa.mahasiswa}
                                    </p>
                                </article>
                            ))}
                            </div>
                    </div>
                </div>
            </Reveal>

            {/* Bukan Cuma Riset */}
            <Reveal
                as="section"
                className="relative mb-12 overflow-hidden rounded-3xl border border-neutral-200 shadow-xl sm:mb-16"
            >
                <div className="absolute inset-0">
                    <DriftWall
                        items={driftItems}
                        columns={6}
                        tileWidth={180}
                        tileHeight={120}
                        speed={26}
                        dim={0.7}
                        overlayColor="#00131a"
                        grayscale
                    />
                </div>
                <div className="absolute inset-0 bg-linear-to-b from-pcr-900/90 via-pcr-900/85 to-pcr-900/90" />

                <div className="relative flex flex-col items-center gap-6 px-4 py-12 text-center sm:gap-8 sm:px-12 sm:py-20">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[10px] font-semibold tracking-wide text-white uppercase backdrop-blur-sm sm:text-xs">
                        Lebih dari sekadar riset
                    </span>
                    <h2 className="max-w-2xl text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
                        Bukan Cuma Soal Riset &amp; PA
                    </h2>
                    <p className="max-w-2xl text-xs leading-relaxed text-white/80 sm:text-base">
                        Katalog ini merangkum keberagaman karya mahasiswa Teknik Informatika — mulai dari sistem
                        informasi, riset machine learning, IoT, sampai proyek yang murni dibuat untuk having fun.
                    </p>

                    <div className="mt-2 flex w-full max-w-3xl flex-col items-center gap-5 rounded-2xl border border-white/15 bg-white/95 p-4 text-left shadow-2xl transition-transform hover:scale-[1.02] sm:mt-4 sm:flex-row sm:gap-6 sm:p-6">
                        <img
                            src={ROBLOX_MAP.image}
                            alt={ROBLOX_MAP.title}
                            className="h-32 w-full shrink-0 rounded-xl object-cover shadow-md sm:h-36 sm:w-48"
                        />
                        <div className="flex-1 w-full">
                            <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-pcrred-50 px-2.5 py-1 text-[10px] font-bold tracking-wide text-pcrred-600 uppercase">
                                🎮 Game · Roblox
                            </span>
                            <h3 className="text-base font-bold text-neutral-900 sm:text-lg">{ROBLOX_MAP.title}</h3>
                            <p className="mt-1.5 text-xs leading-relaxed text-neutral-600 sm:text-sm">
                                {ROBLOX_MAP.description}
                            </p>
                            <p className="mt-2 text-[10px] font-medium text-neutral-400 sm:mt-3 sm:text-xs">
                                Dibuat oleh {ROBLOX_MAP.creators.join(' & ')}
                            </p>
                            <a
                                href={ROBLOX_MAP.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-pcrred-500 px-5 py-2.5 text-xs font-semibold text-white shadow-md transition-all hover:bg-pcrred-600 hover:shadow-lg sm:inline-flex sm:w-auto sm:text-sm"
                            >
                                Main Sekarang di Roblox
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </Reveal>

            {/* Poster Karya Mahasiswa */}
            <Reveal
                as="section"
                className="mb-16 flex flex-col items-center gap-8 sm:mb-20 lg:flex-row lg:gap-16"
            >
                <div className="w-full flex flex-col text-center lg:w-1/3 lg:text-left">
                    <span className="mb-2 text-pcr-600 font-bold tracking-wider text-xs uppercase sm:mb-3 sm:text-sm">Galeri Unggulan</span>
                    <h2 className="text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
                        Poster Karya Mahasiswa
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-neutral-600 sm:mt-4 sm:text-base">
                        Jelajahi visualisasi dari berbagai penelitian dan inovasi mahasiswa. Geser, seret, atau klik posternya untuk melihat detail.
                    </p>

                    <div className="mt-6 relative overflow-hidden rounded-2xl border-2 border-pcr-900 bg-white p-5 shadow-[4px_4px_0_0_#00252e] transition-all duration-300 sm:mt-8 sm:p-6">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-pcrred-500"></div>
                        {active ? (
                            <div className="flex flex-col items-center gap-4 animate-[fadeIn_0.5s_ease-out] lg:items-start">
                                <h3 className="text-lg font-bold text-neutral-900 leading-snug sm:text-xl">{active.title}</h3>
                                {active.slug ? (
                                    <Link
                                        href={`/produk/${active.slug}`}
                                        className="inline-flex w-fit items-center gap-2 rounded-xl bg-pcr-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-pcr-700 hover:shadow-lg sm:px-5 sm:py-2.5 sm:text-sm"
                                    >
                                        Lihat Detail Produk
                                        <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </Link>
                                ) : active.href ? (
                                    <a
                                        href={active.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex w-fit items-center gap-2 rounded-xl bg-pcrred-500 px-4 py-2 text-xs font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-pcrred-600 hover:shadow-lg sm:px-5 sm:py-2.5 sm:text-sm"
                                    >
                                        Main di Roblox
                                        <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                        </svg>
                                    </a>
                                ) : null}
                            </div>
                        ) : (
                            <p className="text-sm text-neutral-400 italic">Memuat data poster...</p>
                        )}
                    </div>
                </div>

                {/* Bagian Kanan: Carousel */}
                <div className="w-full h-[400px] sm:h-[450px] lg:h-125 lg:w-2/3">
                    <DepthCarousel
                        items={showcaseItems}
                        cardWidth={260} // Sedikit dikecilkan agar pas di HP
                        cardHeight={360}
                        autoplay
                        autoplayDelay={3500}
                        onChange={(_, item) => setActiveShowcase(item)}
                    />
                </div>
            </Reveal>

            {/* Tech Marquee */}
            {tags.length > 0 && (
                <Reveal as="section" className="mb-10 sm:mb-12">
                    <p className="mb-3 text-center text-[10px] font-semibold tracking-widest text-neutral-400 uppercase sm:text-xs">
                        Teknologi yang dipakai mahasiswa
                    </p>
                    <div className="relative overflow-hidden mask-[linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                        <div className="animate-marquee flex w-max gap-3">
                            {[...tags, ...tags].map((tag, index) => (
                                <span
                                    key={`${tag}-${index}`}
                                    className="shrink-0 rounded-full border border-pcr-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 shadow-sm sm:px-4 sm:py-2 sm:text-sm"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </Reveal>
            )}

            {/* Bagian Produk */}
            <Reveal id="produk" className="scroll-mt-24 pt-4">

            {/* Search & Filter Section */}
            <section className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <form
                    className="relative flex flex-1 items-center w-full"
                    onSubmit={(e) => {
                        e.preventDefault();
                        applyFilters();
                    }}
                >
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 sm:pl-4">
                        <svg className="h-4 w-4 text-neutral-400 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari judul atau deskripsi produk..."
                        className="w-full rounded-xl border-2 border-neutral-300 bg-white py-2.5 pl-10 pr-20 text-xs text-neutral-800 outline-none transition-all focus:border-pcr-600 focus:ring-2 focus:ring-pcr-600/20 shadow-sm sm:py-3 sm:pl-11 sm:text-sm"
                    />
                    <button
                        type="submit"
                        className="absolute right-1.5 shrink-0 rounded-lg bg-pcr-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-pcr-700 focus:ring-2 focus:ring-pcr-600/50 sm:right-2 sm:px-4 sm:text-sm"
                    >
                        Cari
                    </button>
                </form>

                <div className="relative shrink-0 w-full sm:w-auto">
                    <select
                        value={filters.academic_year ?? ''}
                        onChange={(e) => applyFilters({ academic_year: e.target.value })}
                        className="w-full appearance-none rounded-xl border-2 border-neutral-300 bg-white py-2.5 pl-3.5 pr-10 text-xs font-medium text-neutral-700 outline-none transition-all focus:border-pcr-600 focus:ring-2 focus:ring-pcr-600/20 shadow-sm sm:w-auto sm:py-3 sm:pl-4 sm:text-sm hover:bg-neutral-50"
                    >
                        <option value="">Semua Tahun Ajaran</option>
                        {academicYears.map((year) => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <svg className="h-3.5 w-3.5 text-neutral-500 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <div className="mb-8 flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                <button
                    onClick={() => applyFilters({ category: '' })}
                    className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition-all sm:px-5 sm:py-2 sm:text-sm ${
                        !filters.category
                            ? 'border-pcr-600 bg-pcr-600 text-white shadow-md'
                            : 'border-neutral-200 bg-white text-neutral-600 hover:border-pcr-300 hover:bg-pcr-50 hover:text-pcr-700'
                    }`}
                >
                    Semua
                </button>
                {categories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => applyFilters({ category: category.slug })}
                        className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition-all sm:px-5 sm:py-2 sm:text-sm ${
                            filters.category === category.slug
                                ? 'border-pcr-600 bg-pcr-600 text-white shadow-md'
                                : 'border-neutral-200 bg-white text-neutral-600 hover:border-pcr-300 hover:bg-pcr-50 hover:text-pcr-700'
                        }`}
                    >
                        {category.name}
                    </button>
                ))}
            </div>

            {/* Content / Grid */}
            {products.data.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-pcr-300 bg-white px-6 py-16 text-center sm:py-20">
                    <div className="mb-4 rounded-full bg-neutral-100 p-3 sm:p-4 text-neutral-400">
                        <svg className="h-8 w-8 sm:h-10 sm:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                    </div>
                    <h3 className="text-base font-bold text-neutral-800 sm:text-lg">
                        {noResults ? 'Tidak ada karya yang cocok' : 'Belum ada karya'}
                    </h3>
                    <p className="mt-1 text-xs text-neutral-500 max-w-sm sm:mt-2 sm:text-sm">
                        {noResults
                            ? 'Coba gunakan kata kunci lain atau hapus filter untuk melihat karya lainnya.'
                            : 'Produk yang sudah dipublikasikan oleh dosen akan tampil di sini.'}
                    </p>
                    {noResults && (
                        <button
                            onClick={() => { setSearch(''); applyFilters({ search: '', category: '', academic_year: '' }); }}
                            className="mt-5 text-sm font-medium text-pcr-600 hover:text-pcr-700 underline underline-offset-4 sm:mt-6"
                        >
                            Hapus semua filter
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
                    {products.data.map((product) => (
                        <Link
                            key={product.id}
                            href={`/produk/${product.slug}`}
                            className="group flex flex-col overflow-hidden rounded-3xl border-2 border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-pcr-300 sm:hover:-translate-y-2 sm:hover:shadow-xl"
                        >
                            {/* Memperbaiki aspect ratio agar tidak terdistorsi */}
                            <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                                {isRecentlyPublished(product.published_at) && (
                                    <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 rounded-full bg-pcrred-500 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white uppercase shadow-md sm:top-4 sm:left-4 sm:px-3 sm:text-[11px]">
                                        ✨ Baru
                                    </span>
                                )}
                                {product.poster_url ? (
                                    <img
                                        src={product.poster_url}
                                        alt={product.title}
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="grid h-full w-full place-items-center text-xs font-medium text-neutral-400 sm:text-sm">
                                        <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                                            <svg className="h-6 w-6 opacity-50 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                            </svg>
                                            <span>Tanpa poster</span>
                                        </div>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            </div>

                            <div className="flex flex-1 flex-col p-5 sm:p-6">
                                <div className="mb-2.5 flex items-center justify-between gap-2 sm:mb-3">
                                    {product.category && (
                                        <span className="rounded-full bg-pcr-50 border border-pcr-200 px-2.5 py-0.5 text-[10px] font-bold text-pcr-700 sm:px-3 sm:py-1 sm:text-xs">
                                            {product.category}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1 text-[10px] font-semibold text-neutral-400 sm:gap-1.5 sm:text-xs">
                                        <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {product.academic_year}
                                    </span>
                                </div>
                                <h3 className="mb-1.5 text-base font-bold leading-snug text-neutral-800 transition-colors group-hover:text-pcr-700 line-clamp-2 sm:mb-2 sm:text-lg">
                                    {product.title}
                                </h3>
                                {product.students.length > 0 && (
                                    <div className="mt-auto pt-4 flex items-center gap-2 border-t border-neutral-200/60 sm:pt-5 sm:gap-3">
                                        <div className="flex -space-x-2">
                                            {product.students.slice(0, 3).map((_, i) => (
                                                <div key={i} className={`h-6 w-6 rounded-full border-2 border-white bg-linear-to-br from-neutral-200 to-neutral-300 flex items-center justify-center text-[9px] font-extrabold text-neutral-600 shadow-sm sm:h-7 sm:w-7 sm:text-[10px]`}>
                                                    {product.students[i].charAt(0)}
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-[10px] font-semibold text-neutral-500 line-clamp-1 sm:text-xs">
                                            {product.students.slice(0, 2).join(', ')}
                                            {product.students.length > 2 ? ` & ${product.students.length - 2} lainnya` : ''}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {products.last_page > 1 && (
                <div className="mt-10 flex flex-wrap justify-center gap-1.5 sm:mt-12 sm:gap-2">
                    {products.links.map((link, index) => (
                        <button
                            key={index}
                            disabled={!link.url}
                            onClick={() => link.url && gantiHalaman(link.url)}
                            className={`flex min-w-8 items-center justify-center rounded-xl border-2 px-3 py-1.5 text-xs font-semibold transition-all shadow-sm sm:min-w-10 sm:px-4 sm:py-2.5 sm:text-sm ${
                                link.active
                                    ? 'border-pcr-600 bg-pcr-600 text-white shadow-md'
                                    : 'border-neutral-200 bg-white text-neutral-600 hover:border-pcr-300 hover:text-pcr-700'
                            } disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400 disabled:opacity-60 disabled:hover:border-neutral-200`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
            </Reveal>
        </GuestLayout>
    );
}
