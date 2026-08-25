import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Avatar from '@/Components/Avatar';
import Field, { inputClass } from '@/Components/Field';
import DosenLayout from '@/Layouts/DosenLayout';

export default function Edit({ profile, stats }) {
    const user = usePage().props.auth?.user;
    const [preview, setPreview] = useState(null);

    const form = useForm({
        name: profile.name ?? '',
        email: profile.email ?? '',
        nip: profile.nip ?? '',
        avatar: null,
        remove_avatar: false,
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleAvatar = (event) => {
        const file = event.target.files?.[0] ?? null;

        form.setData('avatar', file);
        form.setData('remove_avatar', false);
        setPreview(file ? URL.createObjectURL(file) : null);
    };

    const shownAvatar = preview ?? (form.data.remove_avatar ? null : profile.avatar_url);

    // Upload file butuh multipart yang tidak bisa dikirim lewat PUT,
    // jadi dikirim POST dengan method spoofing Laravel.
    const submitProfile = (e) => {
        e.preventDefault();
        form.transform((data) => ({ ...data, _method: 'put' }));
        form.post('/dosen/profil', { forceFormData: true });
    };

    const submitPassword = (e) => {
        e.preventDefault();
        passwordForm.put('/dosen/profil/password', {
            onSuccess: () => passwordForm.reset(),
        });
    };

    return (
        <DosenLayout
            title="Profil saya"
            subtitle="Data ini yang tampil sebagai dosen pembimbing pada produk yang kamu bimbing."
        >
            <Head title="Profil saya" />

            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                <div className="space-y-6">
                    <form
                        onSubmit={submitProfile}
                        className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-6"
                    >
                        <h2 className="mb-4 text-sm font-semibold tracking-wide text-pcr-700 uppercase">
                            Data diri
                        </h2>

                        <div className="space-y-5">
                            <Field
                                label="Foto profil"
                                error={form.errors.avatar}
                                hint="JPG, PNG, atau WebP. Maksimal 1 MB."
                            >
                                <div className="flex flex-wrap items-center gap-4">
                                    {shownAvatar ? (
                                        <img
                                            src={shownAvatar}
                                            alt="Pratinjau foto profil"
                                            className="size-20 shrink-0 rounded-full border border-pcr-100 object-cover"
                                        />
                                    ) : (
                                        <Avatar user={user} size={80} />
                                    )}

                                    <div className="space-y-2">
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={handleAvatar}
                                            className="block text-sm text-neutral-600 file:mr-3 file:rounded-lg file:border-0 file:bg-pcr-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-pcr-700"
                                        />
                                        {shownAvatar && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    form.setData('avatar', null);
                                                    form.setData('remove_avatar', true);
                                                    setPreview(null);
                                                }}
                                                className="text-xs font-medium text-pcrred-600 hover:underline"
                                            >
                                                Hapus foto
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </Field>

                            <Field label="Nama lengkap" error={form.errors.name} required>
                                <input
                                    type="text"
                                    className={inputClass}
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    placeholder="mis. Erzi Hidayat S.T., M.Kom."
                                />
                            </Field>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <Field label="Email" error={form.errors.email} required>
                                    <input
                                        type="email"
                                        className={inputClass}
                                        value={form.data.email}
                                        onChange={(e) => form.setData('email', e.target.value)}
                                    />
                                </Field>

                                <Field
                                    label="NIP"
                                    error={form.errors.nip}
                                    hint="Boleh dikosongkan."
                                >
                                    <input
                                        type="text"
                                        className={inputClass}
                                        value={form.data.nip}
                                        onChange={(e) => form.setData('nip', e.target.value)}
                                    />
                                </Field>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="w-full rounded-lg bg-pcr-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-pcr-700 disabled:opacity-50 sm:w-auto"
                            >
                                {form.processing ? 'Menyimpan…' : 'Simpan perubahan'}
                            </button>
                        </div>
                    </form>

                    <form
                        onSubmit={submitPassword}
                        className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-6"
                    >
                        <h2 className="mb-1 text-sm font-semibold tracking-wide text-pcr-700 uppercase">
                            Ganti password
                        </h2>
                        <p className="mb-4 text-sm text-neutral-600">
                            Kosongkan bagian ini kalau tidak ingin mengganti password.
                        </p>

                        <div className="space-y-5">
                            <Field
                                label="Password saat ini"
                                error={passwordForm.errors.current_password}
                                required
                            >
                                <input
                                    type="password"
                                    autoComplete="current-password"
                                    className={inputClass}
                                    value={passwordForm.data.current_password}
                                    onChange={(e) =>
                                        passwordForm.setData('current_password', e.target.value)
                                    }
                                />
                            </Field>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <Field
                                    label="Password baru"
                                    error={passwordForm.errors.password}
                                    required
                                >
                                    <input
                                        type="password"
                                        autoComplete="new-password"
                                        className={inputClass}
                                        value={passwordForm.data.password}
                                        onChange={(e) =>
                                            passwordForm.setData('password', e.target.value)
                                        }
                                    />
                                </Field>

                                <Field label="Ulangi password baru" required>
                                    <input
                                        type="password"
                                        autoComplete="new-password"
                                        className={inputClass}
                                        value={passwordForm.data.password_confirmation}
                                        onChange={(e) =>
                                            passwordForm.setData(
                                                'password_confirmation',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </Field>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="submit"
                                disabled={passwordForm.processing}
                                className="w-full rounded-lg border border-pcr-300 bg-white px-5 py-2.5 text-sm font-medium text-pcr-700 hover:bg-pcr-50 disabled:opacity-50 sm:w-auto"
                            >
                                {passwordForm.processing ? 'Menyimpan…' : 'Ganti password'}
                            </button>
                        </div>
                    </form>
                </div>

                <aside className="space-y-6">
                    <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-6">
                        <h2 className="mb-4 text-sm font-semibold tracking-wide text-pcr-700 uppercase">
                            Ringkasan
                        </h2>

                        <dl className="space-y-3 text-sm">
                            <div className="flex justify-between gap-4">
                                <dt className="text-neutral-600">Produk dibimbing</dt>
                                <dd className="font-semibold text-pcr-800">{stats.dibimbing}</dd>
                            </div>
                            <div className="flex justify-between gap-4">
                                <dt className="text-neutral-600">Sudah terbit</dt>
                                <dd className="font-semibold text-pcr-800">{stats.terbit}</dd>
                            </div>
                            <div className="flex justify-between gap-4">
                                <dt className="text-neutral-600">Diinput sendiri</dt>
                                <dd className="font-semibold text-pcr-800">{stats.diinput}</dd>
                            </div>
                            <div className="flex justify-between gap-4 border-t border-neutral-100 pt-3">
                                <dt className="text-neutral-600">Bergabung</dt>
                                <dd className="text-neutral-800">{profile.bergabung ?? '—'}</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="rounded-xl border border-pcrred-200 bg-pcrred-50 p-4 sm:p-6">
                        <h2 className="text-sm font-semibold text-pcrred-800">Keluar dari akun</h2>
                        <p className="mt-1 mb-4 text-sm text-pcrred-800/80">
                            Sesi kamu akan diakhiri di perangkat ini.
                        </p>
                        <Link
                            href="/dosen/logout"
                            method="post"
                            as="button"
                            className="w-full rounded-lg bg-pcrred-500 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-pcrred-600"
                        >
                            Keluar
                        </Link>
                    </div>
                </aside>
            </div>
        </DosenLayout>
    );
}
