import { Head, Link, useForm } from '@inertiajs/react';
import ProductForm from '@/Components/ProductForm';
import AdminLayout from '@/Layouts/AdminLayout';

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
        students: [{ name: '', nim: '', role: '' }],
        tags: [],
        dosen_ids: [],
    });

    const submit = (status) => {
        form.transform((data) => ({ ...data, status }));
        form.post('/admin/produk', { forceFormData: true });
    };

    return (
        <AdminLayout
            title="Tambah Produk"
            subtitle="Produk yang ditambahkan admin tetap perlu dosen pembimbing yang dipilih di bawah."
            action={
                <Link
                    href="/admin/produk"
                    className="block rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-neutral-700 hover:bg-pcr-50 sm:inline-block sm:py-2"
                >
                    Batal
                </Link>
            }
        >
            <Head title="Tambah Produk" />

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
                    dosenFieldLabel="Dosen pembimbing"
                    dosenFieldHint="Pilih minimal satu dosen sebagai pembimbing produk ini."
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
        </AdminLayout>
    );
}
