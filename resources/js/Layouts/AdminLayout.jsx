import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Avatar from '@/Components/Avatar';
import Logo from '@/Components/Logo';

const NAV = [
    { label: 'Dashboard', href: '/admin/dashboard', match: '/admin/dashboard' },
    { label: 'Kategori', href: '/admin/kategori', match: '/admin/kategori' },
    { label: 'Mata Kuliah', href: '/admin/mata-kuliah', match: '/admin/mata-kuliah' },
    { label: 'Dosen', href: '/admin/dosen', match: '/admin/dosen' },
    { label: 'Produk', href: '/admin/produk', match: '/admin/produk' },
];

export default function AdminLayout({ title, subtitle, action, children }) {
    const { props, url } = usePage();
    const user = props.auth?.user;
    const [notice, setNotice] = useState(null);

    useEffect(() => {
        const message = props.flash?.success ?? props.flash?.error;

        if (!message) {
            return;
        }

        setNotice({ type: props.flash?.success ? 'success' : 'error', message });
        // Sengaja tidak auto-dismiss: pesan sukses di sini kadang berisi
        // password yang baru dibuat/direset, admin butuh waktu untuk menyalinnya.
    }, [props.flash]);

    return (
        <div className="min-h-screen bg-neutral-100">
            <header className="border-b-4 border-pcr-600 bg-white">
                <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <Link href="/admin/dashboard" aria-label="Dashboard admin" className="self-start">
                        <Logo />
                    </Link>

                    <div className="flex items-center gap-3">
                        <Avatar user={user} size={40} />
                        <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-pcr-800">
                                {user?.name ?? 'Belum login'}
                            </span>
                            <span className="block text-xs text-neutral-500">Admin</span>
                        </span>
                    </div>
                </div>
            </header>

            <nav className="bg-pcr-600">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
                    <ul className="-mx-1 flex overflow-x-auto">
                        {NAV.map((item) => {
                            const active = url.startsWith(item.match);

                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={`block shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition ${
                                            active
                                                ? 'border-white text-white'
                                                : 'border-transparent text-pcr-200 hover:text-white'
                                        }`}
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>

                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-pcr-200 transition hover:bg-pcr-700 hover:text-white"
                    >
                        Keluar
                    </Link>
                </div>
            </nav>

            {notice && (
                <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
                    <div
                        className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${
                            notice.type === 'success'
                                ? 'border-pcr-200 bg-pcr-50 text-pcr-800'
                                : 'border-pcrred-200 bg-pcrred-50 text-pcrred-800'
                        }`}
                    >
                        <span className="break-words">{notice.message}</span>
                        <button
                            onClick={() => setNotice(null)}
                            className="shrink-0 font-medium underline decoration-dotted hover:no-underline"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}

            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div>
                        <h1 className="text-xl font-semibold text-pcr-800 sm:text-2xl">{title}</h1>
                        {subtitle && <p className="mt-1 text-sm text-neutral-600">{subtitle}</p>}
                    </div>
                    {action}
                </div>

                {children}
            </main>
        </div>
    );
}
