import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

const STAT_CARDS = [
    { key: 'total', label: 'Total produk', accent: 'text-pcr-800' },
    { key: 'published', label: 'Sudah terbit', accent: 'text-pcr-600' },
    { key: 'draft', label: 'Draft', accent: 'text-amber-600' },
    { key: 'archived', label: 'Diarsipkan', accent: 'text-neutral-500' },
];

export default function Dashboard({ stats, productsByCategory, productsByYear }) {
    const maxByCategory = Math.max(1, ...productsByCategory.map((c) => c.total));
    const maxByYear = Math.max(1, ...productsByYear.map((y) => y.total));

    return (
        <AdminLayout title="Dashboard" subtitle="Ringkasan seluruh katalog produk showcase.">
            <Head title="Dashboard Admin" />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {STAT_CARDS.map((card) => (
                    <div key={card.key} className="rounded-xl border border-neutral-200 bg-white p-5">
                        <p className="text-sm text-neutral-500">{card.label}</p>
                        <p className={`mt-1 text-3xl font-bold ${card.accent}`}>{stats.products[card.key]}</p>
                    </div>
                ))}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-neutral-200 bg-white p-5">
                    <p className="text-sm text-neutral-500">Kategori</p>
                    <p className="mt-1 text-2xl font-bold text-pcr-800">{stats.categories}</p>
                    <Link href="/admin/kategori" className="mt-2 inline-block text-xs font-medium text-pcr-700 hover:underline">
                        Kelola kategori →
                    </Link>
                </div>
                <div className="rounded-xl border border-neutral-200 bg-white p-5">
                    <p className="text-sm text-neutral-500">Mata kuliah</p>
                    <p className="mt-1 text-2xl font-bold text-pcr-800">{stats.courses}</p>
                    <Link href="/admin/mata-kuliah" className="mt-2 inline-block text-xs font-medium text-pcr-700 hover:underline">
                        Kelola mata kuliah →
                    </Link>
                </div>
                <div className="rounded-xl border border-neutral-200 bg-white p-5">
                    <p className="text-sm text-neutral-500">Akun dosen</p>
                    <p className="mt-1 text-2xl font-bold text-pcr-800">
                        {stats.dosen.active}
                        <span className="text-base font-normal text-neutral-400"> / {stats.dosen.total} aktif</span>
                    </p>
                    <Link href="/admin/dosen" className="mt-2 inline-block text-xs font-medium text-pcr-700 hover:underline">
                        Kelola akun dosen →
                    </Link>
                </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-neutral-200 bg-white p-5">
                    <h2 className="mb-4 text-sm font-semibold tracking-wide text-neutral-700 uppercase">
                        Produk per kategori
                    </h2>
                    {productsByCategory.length === 0 ? (
                        <p className="text-sm text-neutral-500">Belum ada data.</p>
                    ) : (
                        <ul className="space-y-3">
                            {productsByCategory.map((row) => (
                                <li key={row.name}>
                                    <div className="mb-1 flex items-center justify-between text-sm">
                                        <span className="text-neutral-700">{row.name}</span>
                                        <span className="font-medium text-neutral-800">{row.total}</span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                                        <div
                                            className="h-full rounded-full bg-pcr-600"
                                            style={{ width: `${(row.total / maxByCategory) * 100}%` }}
                                        />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="rounded-xl border border-neutral-200 bg-white p-5">
                    <h2 className="mb-4 text-sm font-semibold tracking-wide text-neutral-700 uppercase">
                        Produk per tahun ajaran
                    </h2>
                    {productsByYear.length === 0 ? (
                        <p className="text-sm text-neutral-500">Belum ada data.</p>
                    ) : (
                        <ul className="space-y-3">
                            {productsByYear.map((row) => (
                                <li key={row.academic_year}>
                                    <div className="mb-1 flex items-center justify-between text-sm">
                                        <span className="text-neutral-700">{row.academic_year}</span>
                                        <span className="font-medium text-neutral-800">{row.total}</span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                                        <div
                                            className="h-full rounded-full bg-pcrred-500"
                                            style={{ width: `${(row.total / maxByYear) * 100}%` }}
                                        />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
