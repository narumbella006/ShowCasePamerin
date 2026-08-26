import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

function initials(name) {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('');
}

export default function Show({ product }) {
    return (
        <GuestLayout>
            <Head title={product.title} />

            <Link
                href="/"
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-600 shadow-sm transition-all hover:border-pcr-300 hover:text-pcr-700"
            >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Kembali ke katalog
            </Link>

            <div className="grid gap-8 lg:grid-cols-[380px_1fr] lg:gap-12">
                <div className="lg:sticky lg:top-24 lg:self-start">
                    <div className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg transition-shadow hover:shadow-2xl">
                        <div className="absolute -top-6 -right-6 -z-10 h-32 w-32 rounded-full bg-yellow-400/70 blur-2xl" />
                        <div className="absolute -bottom-8 -left-8 -z-10 h-40 w-40 rounded-full bg-pcr-400/40 blur-2xl" />
                        <div className="aspect-3/4 overflow-hidden bg-neutral-100">
                            {product.poster_url ? (
                                <img
                                    src={product.poster_url}
                                    alt={product.title}
                                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <div className="grid size-full place-items-center text-sm font-medium text-neutral-400">
                                    Tanpa poster
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="flex flex-wrap gap-2">
                        {product.category && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-pcr-100 bg-pcr-50 px-3 py-1.5 text-xs font-semibold text-pcr-700">
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6h.008v.008H6V6z" />
                                </svg>
                                {product.category}
                            </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-600 shadow-sm">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {product.academic_year} · {product.semester === 'ganjil' ? 'Ganjil' : 'Genap'}
                        </span>
                        {product.course && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-600 shadow-sm">
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                                </svg>
                                {product.course}
                            </span>
                        )}
                    </div>

                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
                            {product.title}
                        </h1>
                        <p className="mt-4 leading-relaxed whitespace-pre-line text-neutral-600">
                            {product.description}
                        </p>
                    </div>

                    <div className="grid gap-6 border-t border-neutral-200 pt-6 sm:grid-cols-2">
                        <div>
                            <h2 className="mb-3 flex items-center gap-2 text-xs font-bold tracking-widest text-neutral-500 uppercase">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                                </svg>
                                Tim Mahasiswa
                            </h2>
                            {product.students.length === 0 ? (
                                <p className="text-sm text-neutral-500">Belum ada anggota tercatat.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {product.students.map((student, index) => (
                                        <li
                                            key={index}
                                            className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
                                        >
                                            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-pcr-600 text-xs font-bold text-white">
                                                {initials(student.name)}
                                            </span>
                                            <div className="min-w-0">
                                                <div className="truncate font-semibold text-neutral-800">
                                                    {student.name}
                                                </div>
                                                <div className="truncate text-xs text-neutral-500">
                                                    {[student.nim, student.role].filter(Boolean).join(' · ')}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div>
                            <h2 className="mb-3 flex items-center gap-2 text-xs font-bold tracking-widest text-neutral-500 uppercase">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443" />
                                </svg>
                                Dosen Pembimbing
                            </h2>
                            {product.dosen.length === 0 ? (
                                <p className="text-sm text-neutral-500">Belum ada pembimbing tercatat.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {product.dosen.map((d, index) => (
                                        <li
                                            key={index}
                                            className="flex items-center gap-3 rounded-xl border border-pcr-100 bg-pcr-50/60 p-3 shadow-sm transition-shadow hover:shadow-md"
                                        >
                                            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-pcrred-500 text-xs font-bold text-white">
                                                {initials(d.name)}
                                            </span>
                                            <div className="min-w-0">
                                                <div className="truncate font-semibold text-neutral-800">
                                                    {d.name}
                                                </div>
                                                {d.nip && (
                                                    <div className="truncate text-xs text-neutral-500">
                                                        NIP: {d.nip}
                                                    </div>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {product.tags.length > 0 && (
                        <div className="border-t border-neutral-200 pt-6">
                            <h2 className="mb-3 flex items-center gap-2 text-xs font-bold tracking-widest text-neutral-500 uppercase">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6h.008v.008H6V6z" />
                                </svg>
                                Teknologi Terkait
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {product.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="rounded-full border border-pcr-200 bg-pcr-50 px-3.5 py-1.5 text-sm font-semibold text-pcr-700 shadow-sm"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {(product.demo_link || product.video_link) && (
                        <div className="flex flex-wrap gap-3 border-t border-neutral-200 pt-6">
                            {product.demo_link && (
                                <a
                                    href={product.demo_link}
                                    target="_blank"
                                    rel="noopener"
                                    className="inline-flex items-center gap-2 rounded-lg bg-pcr-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-pcr-700 hover:shadow-lg"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                    </svg>
                                    Lihat Demo
                                </a>
                            )}
                            {product.video_link && (
                                <a
                                    href={product.video_link}
                                    target="_blank"
                                    rel="noopener"
                                    className="inline-flex items-center gap-2 rounded-lg border border-pcr-300 bg-white px-5 py-2.5 text-sm font-semibold text-pcr-700 shadow-sm transition-all hover:bg-pcr-50"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                                    </svg>
                                    Video Demo
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </GuestLayout>
    );
}
