import { Link, usePage } from '@inertiajs/react';
import Avatar from '@/Components/Avatar';
import Logo from '@/Components/Logo';

export default function GuestLayout({ children }) {
    const { props, url } = usePage();
    const user = props.auth?.user;
    const isHome = url === '/' || url.startsWith('/?');

    const goToProduk = (e) => {
        if (isHome) {
            e.preventDefault();
            document.getElementById('produk')?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const navTextColor = isHome
        ? "text-white drop-shadow-md hover:text-white/80"
        : "text-neutral-700 hover:text-pcr-700";

    return (
        // Tambahkan overflow-x-hidden di sini agar layar mobile tidak goyang ke samping
        <div className="relative flex min-h-screen flex-col overflow-x-hidden font-sans text-neutral-900 selection:bg-pcr-200 selection:text-pcr-900 bg-[#f5f4ef]">

            {/* --- Latar Belakang --- */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00252e0a_1px,transparent_1px),linear-gradient(to_bottom,#00252e0a_1px,transparent_1px)] bg-size-[48px_48px]" />
                <div className="absolute -top-40 -right-32 h-104 w-104 rounded-full border-2 border-pcr-200/70" />
                <div className="absolute -top-24 -right-16 h-64 w-64 rounded-full border border-dashed border-pcrred-200" />
                <div className="absolute -bottom-48 -left-40 h-120 w-120 rounded-full border-2 border-pcrred-100" />
                <div className="absolute bottom-16 left-24 h-40 w-40 rounded-full border border-dashed border-pcr-200/70" />
                <span className="absolute top-[22%] left-[8%] text-2xl leading-none text-pcr-300/70">+</span>
                <span className="absolute top-[68%] left-[18%] text-lg leading-none text-pcrred-300/70">+</span>
                <span className="absolute top-[38%] right-[12%] text-lg leading-none text-pcrred-300/60">+</span>
                <span className="absolute top-[82%] right-[22%] text-2xl leading-none text-pcr-300/70">+</span>
            </div>

            <div className="relative z-10 flex min-h-screen flex-col">

                {/* --- HEADER MELAYANG --- */}
                <header className="absolute inset-x-0 top-0 z-50 mx-auto flex w-full max-w-7xl items-center justify-between px-3 py-4 sm:px-8 sm:py-6 lg:px-12 xl:px-16">
                    {/* Pill Kiri: Logo */}
                    <Link
                        href="/"
                        className="flex shrink-0 items-center justify-center rounded-full bg-white px-4 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-transform hover:scale-105 sm:px-6 sm:py-2.5"
                    >
                        <Logo height={20} />
                    </Link>

                    {/* Tengah: Navigasi Teks */}
                    <nav className="hidden items-center gap-8 md:flex">
                        <Link href="/" className={`text-sm font-bold transition-colors ${navTextColor}`}>
                            Beranda
                        </Link>
                        <a href="/#produk" onClick={goToProduk} className={`text-sm font-bold transition-colors ${navTextColor}`}>
                            Produk
                        </a>
                        <Link href="/photobooth" className={`inline-flex items-center gap-1.5 text-sm font-bold transition-colors ${navTextColor}`}>
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 9a2 2 0 012-2h1.5l1-2h7l1 2H18a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <circle cx="12" cy="13" r="3.2" strokeWidth={2.2} />
                            </svg>
                            Photobooth
                        </Link>
                    </nav>

                    {/* Pill Kanan: Akun/Login */}
                    <div className="flex shrink-0 items-center rounded-full bg-white p-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)] sm:p-1.5">
                        {user ? (
                            <Link
                                href={user.role === 'dosen' ? '/dosen/produk' : '/'}
                                className="group flex items-center gap-2 rounded-full py-1 pr-3 pl-1 transition-all hover:bg-neutral-100 sm:gap-2.5 sm:pr-4"
                            >
                                <Avatar user={user} size={28} className="rounded-full shadow-sm" />
                                <span className="hidden text-sm font-bold text-neutral-800 group-hover:text-pcr-800 sm:block">
                                    {user.name}
                                </span>
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold text-neutral-800 transition-colors hover:bg-neutral-100 sm:gap-2 sm:px-5 sm:py-2 sm:text-sm"
                            >
                                <span>Masuk</span>
                                <svg className="h-3.5 w-3.5 text-neutral-600 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </Link>
                        )}
                    </div>
                </header>

                <main className={`mx-auto w-full max-w-7xl flex-1 px-4 sm:px-8 lg:px-12 xl:px-16 ${isHome ? 'pb-12' : 'pt-28 pb-8 sm:pt-32 sm:pb-12'}`}>
                    {children}
                </main>

                <footer className="mt-auto border-t border-pcr-700 bg-pcr-900 relative z-20">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-8 sm:py-10 lg:px-12 xl:px-16">
                        <span className="text-lg font-extrabold tracking-tight text-white">
                            ARSIP KARYA
                        </span>
                        <p className="text-center text-xs font-medium text-pcr-200 sm:text-right sm:text-sm">
                            © {new Date().getFullYear()} Arsip Karya. <br className="sm:hidden" />
                            <span className="hidden sm:inline"> — </span>
                            Jurusan Teknik Informatika Politeknik Caltex Riau.
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
}
