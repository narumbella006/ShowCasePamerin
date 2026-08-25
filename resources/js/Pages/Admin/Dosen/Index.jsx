import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Index({ dosen }) {
    const [confirming, setConfirming] = useState(null);
    const actionForm = useForm({});

    const resetPassword = () => {
        actionForm.post(`/admin/dosen/${confirming.dosen.id}/reset-password`, {
            onFinish: () => setConfirming(null),
        });
    };

    const toggleActive = () => {
        actionForm.patch(`/admin/dosen/${confirming.dosen.id}/toggle-active`, {
            onFinish: () => setConfirming(null),
        });
    };

    return (
        <AdminLayout
            title="Akun Dosen"
            subtitle="Kelola akun dosen yang bisa login dan mengelola produk bimbingannya."
            action={
                <Link
                    href="/admin/dosen/tambah"
                    className="block rounded-lg bg-pcr-600 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-pcr-700 sm:inline-block sm:py-2"
                >
                    + Tambah Dosen
                </Link>
            }
        >
            <Head title="Kelola Akun Dosen" />

            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-neutral-200 bg-neutral-50 text-xs tracking-wide text-neutral-500 uppercase">
                        <tr>
                            <th className="px-4 py-3">Nama</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">NIP</th>
                            <th className="px-4 py-3">Produk dibimbing</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {dosen.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-10 text-center text-neutral-500">
                                    Belum ada akun dosen.
                                </td>
                            </tr>
                        )}
                        {dosen.map((d) => (
                            <tr key={d.id} className="hover:bg-neutral-50">
                                <td className="px-4 py-3 font-medium text-neutral-800">{d.name}</td>
                                <td className="px-4 py-3 text-neutral-600">{d.email}</td>
                                <td className="px-4 py-3 text-neutral-500">{d.nip ?? '—'}</td>
                                <td className="px-4 py-3 text-neutral-500">{d.products_count}</td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                            d.is_active
                                                ? 'bg-pcr-100 text-pcr-800'
                                                : 'bg-neutral-200 text-neutral-600'
                                        }`}
                                    >
                                        {d.is_active ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex flex-wrap justify-end gap-2">
                                        <Link
                                            href={`/admin/dosen/${d.id}/edit`}
                                            className="rounded-lg px-3 py-1.5 text-xs font-medium text-pcr-700 hover:bg-pcr-50"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => setConfirming({ type: 'reset', dosen: d })}
                                            className="rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100"
                                        >
                                            Reset Password
                                        </button>
                                        <button
                                            onClick={() => setConfirming({ type: 'toggle', dosen: d })}
                                            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                                                d.is_active
                                                    ? 'text-pcrred-600 hover:bg-pcrred-50'
                                                    : 'text-pcr-700 hover:bg-pcr-50'
                                            }`}
                                        >
                                            {d.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {confirming && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-pcr-900/60 p-6">
                    <div className="w-full max-w-md rounded-xl bg-white p-6">
                        {confirming.type === 'reset' ? (
                            <>
                                <h2 className="text-lg font-semibold text-pcr-800">Reset password?</h2>
                                <p className="mt-2 text-sm text-neutral-600">
                                    Password baru untuk “{confirming.dosen.name}” akan dibuat secara acak dan
                                    ditampilkan sekali di layar ini. Password lama langsung tidak berlaku.
                                </p>
                            </>
                        ) : (
                            <>
                                <h2 className="text-lg font-semibold text-pcr-800">
                                    {confirming.dosen.is_active ? 'Nonaktifkan akun?' : 'Aktifkan kembali akun?'}
                                </h2>
                                <p className="mt-2 text-sm text-neutral-600">
                                    {confirming.dosen.is_active
                                        ? `"${confirming.dosen.name}" tidak akan bisa login lagi sampai diaktifkan kembali. Produk yang dia bimbing tetap tersimpan.`
                                        : `"${confirming.dosen.name}" akan bisa login lagi seperti biasa.`}
                                </p>
                            </>
                        )}
                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                onClick={() => setConfirming(null)}
                                className="rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirming.type === 'reset' ? resetPassword : toggleActive}
                                disabled={actionForm.processing}
                                className="rounded-lg bg-pcr-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-pcr-700 disabled:opacity-50"
                            >
                                {actionForm.processing ? 'Memproses…' : 'Ya, lanjutkan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
