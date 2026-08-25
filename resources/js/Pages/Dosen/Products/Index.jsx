import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import DosenLayout from '@/Layouts/DosenLayout';

const STATUS_STYLES = {
    draft: 'bg-amber-100 text-amber-800',
    published: 'bg-pcr-100 text-pcr-800',
    archived: 'bg-neutral-200 text-neutral-700',
};

const STATUS_LABELS = {
    draft: 'Draft',
    published: 'Terbit',
    archived: 'Arsip',
};

const FILTERS = [
    { value: '', label: 'Semua', statKey: 'total' },
    { value: 'draft', label: 'Draft', statKey: 'draft' },
    { value: 'published', label: 'Terbit', statKey: 'published' },
    { value: 'archived', label: 'Arsip', statKey: 'archived' },
];

export default function Index({ products, filters, stats }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [confirming, setConfirming] = useState(null);
    const deleteForm = useForm({});

    const applyFilters = (overrides = {}) => {
        const params = { search, status: filters.status ?? '', ...overrides };

        router.get('/dosen/produk', params, {
            preserveState: true,
            replace: true,
        });
    };

    const destroy = () => {
        deleteForm.delete(`/dosen/produk/${confirming.slug}`, {
            onFinish: () => setConfirming(null),
        });
    };

    return (
        <DosenLayout
            title="Produk saya"
            subtitle="Produk yang kamu bimbing. Kamu bisa mengedit semuanya, termasuk yang diinput dosen pembimbing lain."
            action={
                <Link
                    href="/dosen/produk/create"
                    className="block rounded-lg bg-pcr-600 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-pcr-700 sm:inline-block sm:py-2"
                >
                    + Tambah produk
                </Link>
            }
        >
            <Head title="Produk saya" />

            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
                    {FILTERS.map((filter) => {
                        const active = (filters.status ?? '') === filter.value;

                        return (
                            <button
                                key={filter.value || 'all'}
                                onClick={() => applyFilters({ status: filter.value })}
                                className={`shrink-0 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                                    active
                                        ? 'border-pcr-600 bg-pcr-600 text-white'
                                        : 'border-neutral-300 bg-white text-neutral-700 hover:bg-pcr-50'
                                }`}
                            >
                                {filter.label}
                                <span className={active ? 'ml-1.5 text-pcr-200' : 'ml-1.5 text-neutral-400'}>
                                    {stats[filter.statKey]}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <form
                    className="flex gap-2 sm:ml-auto"
                    onSubmit={(e) => {
                        e.preventDefault();
                        applyFilters();
                    }}
                >
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari judul atau deskripsi…"
                        className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-pcr-600 focus:ring-1 focus:ring-pcr-600 sm:w-64 sm:py-2"
                    />
                    <button
                        type="submit"
                        className="shrink-0 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                    >
                        Cari
                    </button>
                </form>
            </div>

            {products.data.length === 0 ? (
                <div className="rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
                    <p className="font-medium text-neutral-800">Belum ada produk</p>
                    <p className="mt-1 text-sm text-neutral-500">
                        {filters.search || filters.status
                            ? 'Tidak ada produk yang cocok dengan filter ini.'
                            : 'Mulai dengan menambahkan produk pertama kamu.'}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products.data.map((product) => (
                        <article
                            key={product.id}
                            className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white"
                        >
                            <div className="aspect-video bg-neutral-100">
                                {product.poster_url ? (
                                    <img
                                        src={product.poster_url}
                                        alt={product.title}
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <div className="grid size-full place-items-center text-sm text-neutral-400">
                                        Tanpa poster
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-1 flex-col p-4">
                                <div className="mb-2 flex items-start justify-between gap-2">
                                    <h3 className="font-semibold text-pcr-800">{product.title}</h3>
                                    <span
                                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[product.status]}`}
                                    >
                                        {STATUS_LABELS[product.status]}
                                    </span>
                                </div>

                                <p className="text-sm text-neutral-600">
                                    {product.category}
                                    {product.course && ` · ${product.course}`}
                                </p>
                                <p className="mt-0.5 mb-4 text-xs text-neutral-500">
                                    {product.academic_year} · Semester {product.semester} ·{' '}
                                    {product.views_count} dilihat
                                </p>

                                {/* mt-auto mendorong baris aksi ke dasar kartu, supaya tetap
                                    sejajar walau judul atau keterangan di atasnya memanjang
                                    sampai dua baris. */}
                                <div className="mt-auto flex items-center justify-between gap-2 border-t border-neutral-100 pt-3">
                                    <span className="text-xs text-neutral-400">
                                        Diubah {product.updated_at}
                                    </span>
                                    <div className="flex gap-2">
                                        <Link
                                            href={`/dosen/produk/${product.slug}/edit`}
                                            className="rounded-lg px-3 py-2 text-sm font-medium text-pcr-700 hover:bg-pcr-50"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => setConfirming(product)}
                                            className="rounded-lg px-3 py-2 text-sm font-medium text-pcrred-600 hover:bg-pcrred-50"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {products.last_page > 1 && (
                <div className="mt-6 flex flex-wrap justify-center gap-1">
                    {products.links.map((link, index) => (
                        <button
                            key={index}
                            disabled={!link.url}
                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                            className={`min-w-10 rounded-lg border px-3 py-2 text-sm ${
                                link.active
                                    ? 'border-pcr-600 bg-pcr-600 text-white'
                                    : 'border-neutral-300 bg-white text-neutral-700 hover:bg-pcr-50'
                            } disabled:cursor-default disabled:opacity-40`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}

            {confirming && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-pcr-900/60 p-6">
                    <div className="w-full max-w-md rounded-xl bg-white p-6">
                        <h2 className="text-lg font-semibold text-pcr-800">Hapus produk?</h2>
                        <p className="mt-2 text-sm text-neutral-600">
                            “{confirming.title}” akan dihapus permanen beserta data anggota
                            mahasiswa dan posternya. Tindakan ini tidak bisa dibatalkan.
                        </p>
                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                onClick={() => setConfirming(null)}
                                className="rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={destroy}
                                disabled={deleteForm.processing}
                                className="rounded-lg bg-pcrred-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-pcrred-600 disabled:opacity-50"
                            >
                                {deleteForm.processing ? 'Menghapus…' : 'Ya, hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DosenLayout>
    );
}
