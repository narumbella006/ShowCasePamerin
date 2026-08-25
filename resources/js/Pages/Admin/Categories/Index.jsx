import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Field, { inputClass } from '@/Components/Field';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Index({ categories }) {
    const [editingId, setEditingId] = useState(null);
    const [confirming, setConfirming] = useState(null);

    const createForm = useForm({ name: '', icon: '' });
    const editForm = useForm({ name: '', icon: '' });
    const deleteForm = useForm({});

    const submitCreate = (e) => {
        e.preventDefault();
        createForm.post('/admin/kategori', {
            onSuccess: () => createForm.reset(),
        });
    };

    const startEdit = (category) => {
        setEditingId(category.id);
        editForm.setData({ name: category.name, icon: category.icon ?? '' });
        editForm.clearErrors();
    };

    const submitEdit = (e, id) => {
        e.preventDefault();
        editForm.transform((data) => ({ ...data, _method: 'put' }));
        editForm.post(`/admin/kategori/${id}`, {
            forceFormData: true,
            onSuccess: () => setEditingId(null),
        });
    };

    const destroy = () => {
        deleteForm.delete(`/admin/kategori/${confirming.id}`, {
            onFinish: () => setConfirming(null),
        });
    };

    return (
        <AdminLayout title="Kategori" subtitle="Kategori produk yang tampil sebagai filter di katalog publik.">
            <Head title="Kelola Kategori" />

            <form
                onSubmit={submitCreate}
                className="mb-6 flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 sm:flex-row sm:items-end sm:p-5"
            >
                <div className="flex-1">
                    <Field label="Nama kategori" error={createForm.errors.name} required>
                        <input
                            type="text"
                            className={inputClass}
                            value={createForm.data.name}
                            onChange={(e) => createForm.setData('name', e.target.value)}
                            placeholder="mis. Web Application"
                        />
                    </Field>
                </div>
                <div className="sm:w-48">
                    <Field label="Ikon" error={createForm.errors.icon} hint="Opsional">
                        <input
                            type="text"
                            className={inputClass}
                            value={createForm.data.icon}
                            onChange={(e) => createForm.setData('icon', e.target.value)}
                            placeholder="mis. globe"
                        />
                    </Field>
                </div>
                <button
                    type="submit"
                    disabled={createForm.processing}
                    className="shrink-0 rounded-lg bg-pcr-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-pcr-700 disabled:opacity-50"
                >
                    Tambah
                </button>
            </form>

            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-neutral-200 bg-neutral-50 text-xs tracking-wide text-neutral-500 uppercase">
                        <tr>
                            <th className="px-4 py-3">Nama</th>
                            <th className="px-4 py-3">Ikon</th>
                            <th className="px-4 py-3">Jumlah produk</th>
                            <th className="px-4 py-3 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {categories.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-4 py-10 text-center text-neutral-500">
                                    Belum ada kategori.
                                </td>
                            </tr>
                        )}
                        {categories.map((category) =>
                            editingId === category.id ? (
                                <tr key={category.id} className="bg-pcr-50/40">
                                    <td className="px-4 py-3" colSpan={2}>
                                        <form
                                            id={`edit-category-${category.id}`}
                                            onSubmit={(e) => submitEdit(e, category.id)}
                                            className="flex flex-col gap-2 sm:flex-row"
                                        >
                                            <input
                                                type="text"
                                                className={inputClass}
                                                value={editForm.data.name}
                                                onChange={(e) => editForm.setData('name', e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                className={inputClass}
                                                value={editForm.data.icon}
                                                onChange={(e) => editForm.setData('icon', e.target.value)}
                                                placeholder="Ikon"
                                            />
                                        </form>
                                        {(editForm.errors.name || editForm.errors.icon) && (
                                            <p className="mt-1 text-xs text-pcrred-600">
                                                {editForm.errors.name ?? editForm.errors.icon}
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-neutral-500">{category.products_count}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="submit"
                                                form={`edit-category-${category.id}`}
                                                disabled={editForm.processing}
                                                className="rounded-lg bg-pcr-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-pcr-700 disabled:opacity-50"
                                            >
                                                Simpan
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setEditingId(null)}
                                                className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50"
                                            >
                                                Batal
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                <tr key={category.id} className="hover:bg-neutral-50">
                                    <td className="px-4 py-3 font-medium text-neutral-800">{category.name}</td>
                                    <td className="px-4 py-3 text-neutral-500">{category.icon ?? '—'}</td>
                                    <td className="px-4 py-3 text-neutral-500">{category.products_count}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => startEdit(category)}
                                                className="rounded-lg px-3 py-1.5 text-xs font-medium text-pcr-700 hover:bg-pcr-50"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => setConfirming(category)}
                                                className="rounded-lg px-3 py-1.5 text-xs font-medium text-pcrred-600 hover:bg-pcrred-50"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ),
                        )}
                    </tbody>
                </table>
            </div>

            {confirming && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-pcr-900/60 p-6">
                    <div className="w-full max-w-md rounded-xl bg-white p-6">
                        <h2 className="text-lg font-semibold text-pcr-800">Hapus kategori?</h2>
                        <p className="mt-2 text-sm text-neutral-600">
                            “{confirming.name}” akan dihapus.
                            {confirming.products_count > 0 && (
                                <span className="mt-1 block font-medium text-pcrred-600">
                                    Kategori ini masih dipakai {confirming.products_count} produk, penghapusan akan
                                    ditolak.
                                </span>
                            )}
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
