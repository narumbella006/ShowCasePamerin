import { Head, useForm } from '@inertiajs/react';
import Field, { inputClass } from '@/Components/Field';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Login({ status }) {
    const form = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        form.post('/login', {
            onFinish: () => form.reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Masuk" />

            <div className="mx-auto max-w-md">
                <div className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8">
                    <h1 className="text-xl font-semibold text-pcr-800">Masuk Dosen/Admin</h1>
                    <p className="mt-1 text-sm text-neutral-600">Khusus untuk dosen &amp; admin pengelola arsip karya.</p>

                    {status && (
                        <div className="mt-4 rounded-lg border border-pcr-200 bg-pcr-50 px-4 py-3 text-sm text-pcr-800">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="mt-6 space-y-5">
                        <Field label="Email" error={form.errors.email} required>
                            <input
                                type="email"
                                autoFocus
                                className={inputClass}
                                value={form.data.email}
                                onChange={(e) => form.setData('email', e.target.value)}
                            />
                        </Field>

                        <Field label="Password" error={form.errors.password} required>
                            <input
                                type="password"
                                className={inputClass}
                                value={form.data.password}
                                onChange={(e) => form.setData('password', e.target.value)}
                            />
                        </Field>

                        <label className="flex items-center gap-2 text-sm text-neutral-600">
                            <input
                                type="checkbox"
                                checked={form.data.remember}
                                onChange={(e) => form.setData('remember', e.target.checked)}
                                className="rounded border-neutral-300 text-pcr-600 focus:ring-pcr-600"
                            />
                            Ingat saya
                        </label>

                        <button
                            type="submit"
                            disabled={form.processing}
                            className="w-full rounded-lg bg-pcr-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-pcr-700 disabled:opacity-50"
                        >
                            {form.processing ? 'Memproses…' : 'Masuk'}
                        </button>
                    </form>
                </div>
            </div>
        </GuestLayout>
    );
}
