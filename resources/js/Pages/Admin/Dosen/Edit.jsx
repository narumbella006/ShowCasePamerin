import { Head, Link, useForm } from '@inertiajs/react';
import Field, { inputClass } from '@/Components/Field';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Edit({ dosen }) {
    const form = useForm({
        name: dosen.name,
        email: dosen.email,
        nip: dosen.nip ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(`/admin/dosen/${dosen.id}`);
    };

    return (
        <AdminLayout
            title="Edit Dosen"
            subtitle={dosen.name}
            action={
                <Link
                    href="/admin/dosen"
                    className="block rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-neutral-700 hover:bg-pcr-50 sm:inline-block sm:py-2"
                >
                    Batal
                </Link>
            }
        >
            <Head title={`Edit — ${dosen.name}`} />

            <form
                onSubmit={submit}
                className="max-w-xl space-y-5 rounded-xl border border-neutral-200 bg-white p-4 sm:p-6"
            >
                <Field label="Nama lengkap" error={form.errors.name} required>
                    <input
                        type="text"
                        className={inputClass}
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                    />
                </Field>

                <Field label="Email" error={form.errors.email} required>
                    <input
                        type="email"
                        className={inputClass}
                        value={form.data.email}
                        onChange={(e) => form.setData('email', e.target.value)}
                    />
                </Field>

                <Field label="NIP" error={form.errors.nip} hint="Boleh dikosongkan.">
                    <input
                        type="text"
                        className={inputClass}
                        value={form.data.nip}
                        onChange={(e) => form.setData('nip', e.target.value)}
                    />
                </Field>

                <p className="text-xs text-neutral-500">
                    Untuk mengganti password, gunakan tombol "Reset Password" di halaman daftar dosen.
                </p>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="w-full rounded-lg bg-pcr-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-pcr-700 disabled:opacity-50 sm:w-auto"
                    >
                        {form.processing ? 'Menyimpan…' : 'Simpan Perubahan'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
