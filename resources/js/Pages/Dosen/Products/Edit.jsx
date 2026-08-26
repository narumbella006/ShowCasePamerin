import { Head, Link, useForm } from '@inertiajs/react';
import ProductForm from '@/Components/ProductForm';
import DosenLayout from '@/Layouts/DosenLayout';

export default function Edit({ product, options }) {
    const form = useForm({
        title: product.title,
        description: product.description,
        category_id: product.category_id ?? '',
        course_id: product.course_id ?? '',
        academic_year: product.academic_year,
        semester: product.semester,
        status: product.status,
        poster: null,
        remove_poster: false,
        demo_link: product.demo_link ?? '',
        video_link: product.video_link ?? '',
        students: product.students ?? [],
        tags: product.tags ?? [],
        dosen_ids: product.dosen_ids ?? [],
    });

    // Upload file butuh multipart, sedangkan multipart tidak bisa dikirim
    // lewat PUT. Jadi dikirim sebagai POST dengan method spoofing Laravel.
    // `transform` pada adapter React mengembalikan undefined, jadi tidak bisa
    // dirangkai langsung dengan .post() seperti di Vue.
    const submit = (status) => {
        form.transform((data) => ({ ...data, status, _method: 'put' }));
        form.post(`/dosen/produk/${product.slug}`, { forceFormData: true });
    };

    return (
        <DosenLayout
            title="Edit produk"
            subtitle={product.title}
            action={
                <Link
                    href="/dosen/produk"
                    className="block rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-neutral-700 hover:bg-pcr-50 sm:inline-block sm:py-2"
                >
                    Batal
                </Link>
            }
        >
            <Head title={`Edit — ${product.title}`} />

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    submit(form.data.status);
                }}
            >
                <ProductForm
                    data={form.data}
                    setData={form.setData}
                    errors={form.errors}
                    options={options}
                    existingPosterUrl={product.poster_url}
                />

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                    <button
                        type="button"
                        disabled={form.processing}
                        onClick={() => submit('archived')}
                        className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 disabled:opacity-50 sm:w-auto"
                    >
                        Arsipkan
                    </button>

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap">
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
                            {form.processing ? 'Menyimpan…' : 'Simpan & publikasikan'}
                        </button>
                    </div>
                </div>
            </form>
        </DosenLayout>
    );
}
