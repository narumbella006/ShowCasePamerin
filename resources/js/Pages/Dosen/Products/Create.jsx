import { Head, Link, useForm } from '@inertiajs/react';
import ProductForm from '@/Components/ProductForm';
import DosenLayout from '@/Layouts/DosenLayout';

export default function Create({ options }) {
    const currentYear = new Date().getFullYear();

    const form = useForm({
        title: '',
        description: '',
        category_id: '',
        course_id: '',
        academic_year: `${currentYear}/${currentYear + 1}`,
        semester: 'ganjil',
        status: 'draft',
        poster: null,
        demo_link: '',
        video_link: '',
        github_link: '',
        students: [{ name: '', nim: '', role: '' }],
        tags: [],
        dosen_ids: [],
    });

    // `transform` pada adapter React mengembalikan undefined, jadi tidak bisa
    // dirangkai langsung dengan .post() seperti di Vue.
    const submit = (status) => {
        form.transform((data) => ({ ...data, status }));
        form.post('/dosen/produk', { forceFormData: true });
    };

    return (
        <DosenLayout
            title="Tambah produk"
            subtitle="Simpan sebagai draft dulu kalau datanya belum lengkap."
            action={
                <Link
                    href="/dosen/produk"
                    className="block rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-neutral-700 hover:bg-pcr-50 sm:inline-block sm:py-2"
                >
                    Batal
                </Link>
            }
        >
            <Head title="Tambah produk" />

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    submit('draft');
                }}
            >
                <ProductForm
                    data={form.data}
                    setData={form.setData}
                    errors={form.errors}
                    options={options}
                    existingPosterUrl={null}
                />

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
                    <button
                        type="button"
                        disabled={form.processing}
                        onClick={() => submit('draft')}
                        className="w-full rounded-lg border border-pcr-300 bg-white px-5 py-2.5 text-sm font-medium text-pcr-700 hover:bg-pcr-50 disabled:opacity-50 sm:w-auto"
                    >
                        Simpan sebagai draft
                    </button>
                    <button
                        type="button"
                        disabled={form.processing}
                        onClick={() => submit('published')}
                        className="w-full rounded-lg bg-pcr-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-pcr-700 disabled:opacity-50 sm:w-auto"
                    >
                        {form.processing ? 'Menyimpan…' : 'Publikasikan'}
                    </button>
                </div>
            </form>
        </DosenLayout>
    );
}
