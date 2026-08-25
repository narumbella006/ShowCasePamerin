import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

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

const STATUS_FILTERS = [
    { value: '', label: 'Semua status' },
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Terbit' },
    { value: 'archived', label: 'Arsip' },
];

export default function Index({ products, categories, filters }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [confirming, setConfirming] = useState(null);
    const deleteForm = useForm({});

    const applyFilters = (overrides = {}) => {
        router.get(
            '/admin/produk',
            { search, status: filters.status ?? '', category: filters.category ?? '', ...overrides },
            { preserveState: true, replace: true },
        );
    };

    const destroy = () => {
        deleteForm.delete(`/admin/produk/${confirming.slug}`, {
            onFinish: () => setConfirming(null),
        });
    };

    return (
        <AdminLayout
            title="Semua Produk"
            subtitle="Moderasi produk dari seluruh dosen — tambah, edit, ubah status, atau hapus."
            action={
                <Link
                    href="/admin/produk/tambah"
                    className="block rounded-lg bg-pcr-600 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-pcr-700 sm:inline-block sm:py-2"
                >
                    + Tambah Produk
                </Link>
            }
        >
            <Head title="Kelola Produk" />

            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <form
                    className="flex flex-1 gap-2 sm:min-w-64"
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
                        className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-pcr-600 focus:ring-1 focus:ring-pcr-600"
                    />
                    <button
                        type="submit"
                        className="shrink-0 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                    >
                        Cari
                    </button>
                </form>

                <select
                    value={filters.status ?? ''}
                    onChange={(e) => applyFilters({ status: e.target.value })}
                    className="rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-pcr-600 focus:ring-1 focus:ring-pcr-600"
                >
                    {STATUS_FILTERS.map((s) => (
                        <option key={s.value} value={s.value}>
                            {s.label}
                        </option>
                    ))}
                </select>

                <select
                    value={filters.category ?? ''}
                    onChange={(e) => applyFilters({ category: e.target.value })}
                    className="rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-pcr-600 focus:ring-1 focus:ring-pcr-600"
                >
                    <option value="">Semua kategori</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.slug}>
                            {c.name}
                        </option>
                    ))}
                </select>
            </div>

            {products.data.length === 0 ? (
                <div className="rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
                    <p className="font-medium text-neutral-800">Tidak ada produk yang cocok</p>
                    <p className="mt-1 text-sm text-neutral-500">Coba ubah kata kunci atau filter.</p>
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
                                <p className="mt-0.5 text-xs text-neutral-500">{product.academic_year}</p>
                                <p className="mt-1 text-xs text-neutral-500">
                                    Pembimbing: {product.dosen.length > 0 ? product.dosen.join(', ') : '—'}
                                </p>

                                <div className="mt-auto flex items-center justify-between gap-2 border-t border-neutral-100 pt-3">
                                    <span className="text-xs text-neutral-400">Diubah {product.updated_at}</span>
                                    <div className="flex gap-2">
                                        <Link
                                            href={`/admin/produk/${product.slug}/edit`}
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
                            “{confirming.title}” akan dihapus permanen beserta data anggota mahasiswa dan posternya.
                            Tindakan ini tidak bisa dibatalkan.
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
        </AdminLayout>
    );
}
