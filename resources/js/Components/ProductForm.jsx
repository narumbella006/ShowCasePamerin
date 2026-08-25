import { useState } from 'react';
import Field, { inputClass } from './Field';

const CURRENT_YEAR = new Date().getFullYear();
const ACADEMIC_YEARS = Array.from({ length: 5 }, (_, i) => {
    const start = CURRENT_YEAR - i;

    return `${start}/${start + 1}`;
});

export default function ProductForm({
    data,
    setData,
    errors,
    options,
    existingPosterUrl,
    dosenFieldLabel = 'Dosen pembimbing lain',
    dosenFieldHint = 'Kamu otomatis tercatat sebagai pembimbing. Dosen yang dipilih di sini juga bisa mengedit produk ini.',
}) {
    const [posterPreview, setPosterPreview] = useState(null);

    const students = data.students ?? [];

    const updateStudent = (index, key, value) => {
        const next = students.map((student, i) =>
            i === index ? { ...student, [key]: value } : student,
        );

        setData('students', next);
    };

    const addStudent = () =>
        setData('students', [...students, { name: '', nim: '', role: '' }]);

    const removeStudent = (index) =>
        setData('students', students.filter((_, i) => i !== index));

    const toggleInArray = (key, id) => {
        const current = data[key] ?? [];

        setData(
            key,
            current.includes(id) ? current.filter((v) => v !== id) : [...current, id],
        );
    };

    const handlePoster = (event) => {
        const file = event.target.files?.[0] ?? null;

        setData('poster', file);
        setData('remove_poster', false);
        setPosterPreview(file ? URL.createObjectURL(file) : null);
    };

    const shownPoster = posterPreview ?? (data.remove_poster ? null : existingPosterUrl);

    return (
        <div className="space-y-6">
            <section className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-6">
                <h2 className="mb-4 text-sm font-semibold tracking-wide text-pcr-700 uppercase">
                    Informasi produk
                </h2>

                <div className="space-y-5">
                    <Field label="Judul produk" error={errors.title} required>
                        <input
                            type="text"
                            className={inputClass}
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="mis. NutriChain MBG"
                        />
                    </Field>

                    <Field label="Deskripsi" error={errors.description} required>
                        <textarea
                            rows={5}
                            className={inputClass}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Jelaskan latar belakang, fitur, dan teknologi yang dipakai."
                        />
                    </Field>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="Kategori" error={errors.category_id} required>
                            <select
                                className={inputClass}
                                value={data.category_id ?? ''}
                                onChange={(e) => setData('category_id', e.target.value)}
                            >
                                <option value="">— pilih kategori —</option>
                                {options.categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field
                            label="Mata kuliah"
                            error={errors.course_id}
                            hint="Boleh dikosongkan kalau produk bukan dari mata kuliah tertentu."
                        >
                            <select
                                className={inputClass}
                                value={data.course_id ?? ''}
                                onChange={(e) => setData('course_id', e.target.value)}
                            >
                                <option value="">— tidak ada —</option>
                                {options.courses.map((course) => (
                                    <option key={course.id} value={course.id}>
                                        {course.code ? `${course.code} — ${course.name}` : course.name}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Tahun ajaran" error={errors.academic_year} required>
                            <select
                                className={inputClass}
                                value={data.academic_year}
                                onChange={(e) => setData('academic_year', e.target.value)}
                            >
                                {ACADEMIC_YEARS.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Semester" error={errors.semester} required>
                            <select
                                className={inputClass}
                                value={data.semester}
                                onChange={(e) => setData('semester', e.target.value)}
                            >
                                <option value="ganjil">Ganjil</option>
                                <option value="genap">Genap</option>
                            </select>
                        </Field>
                    </div>
                </div>
            </section>

            <section className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-6">
                <h2 className="mb-4 text-sm font-semibold tracking-wide text-pcr-700 uppercase">
                    Poster & tautan
                </h2>

                <div className="space-y-5">
                    <Field
                        label="Poster"
                        error={errors.poster}
                        hint="JPG, PNG, atau WebP. Maksimal 2 MB."
                    >
                        <div className="flex flex-wrap items-start gap-4">
                            {shownPoster && (
                                <img
                                    src={shownPoster}
                                    alt="Pratinjau poster"
                                    className="h-32 w-24 rounded-lg border border-neutral-200 object-cover"
                                />
                            )}
                            <div className="space-y-2">
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handlePoster}
                                    className="block text-sm text-neutral-600 file:mr-3 file:rounded-lg file:border-0 file:bg-pcr-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-pcr-700"
                                />
                                {shownPoster && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setData('poster', null);
                                            setData('remove_poster', true);
                                            setPosterPreview(null);
                                        }}
                                        className="text-xs font-medium text-pcrred-600 hover:underline"
                                    >
                                        Hapus poster
                                    </button>
                                )}
                            </div>
                        </div>
                    </Field>

                    <div className="grid gap-5 sm:grid-cols-3">
                        <Field label="Link demo" error={errors.demo_link}>
                            <input
                                type="url"
                                className={inputClass}
                                value={data.demo_link ?? ''}
                                onChange={(e) => setData('demo_link', e.target.value)}
                                placeholder="https://"
                            />
                        </Field>
                        <Field label="Link video" error={errors.video_link}>
                            <input
                                type="url"
                                className={inputClass}
                                value={data.video_link ?? ''}
                                onChange={(e) => setData('video_link', e.target.value)}
                                placeholder="https://"
                            />
                        </Field>
                        <Field label="Link GitHub" error={errors.github_link}>
                            <input
                                type="url"
                                className={inputClass}
                                value={data.github_link ?? ''}
                                onChange={(e) => setData('github_link', e.target.value)}
                                placeholder="https://"
                            />
                        </Field>
                    </div>
                </div>
            </section>

            <section className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold tracking-wide text-pcr-700 uppercase">
                        Anggota mahasiswa
                    </h2>
                    <button
                        type="button"
                        onClick={addStudent}
                        className="shrink-0 rounded-lg border border-neutral-300 px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                    >
                        + Tambah anggota
                    </button>
                </div>

                {students.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-neutral-300 px-4 py-6 text-center text-sm text-neutral-500">
                        Belum ada anggota. Klik “Tambah anggota” untuk mencatat mahasiswa.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {students.map((student, index) => (
                            <div
                                key={index}
                                className="grid items-start gap-2 rounded-lg bg-neutral-50 p-3 sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:gap-3"
                            >
                                <div>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        placeholder="Nama mahasiswa"
                                        value={student.name}
                                        onChange={(e) => updateStudent(index, 'name', e.target.value)}
                                    />
                                    {errors[`students.${index}.name`] && (
                                        <p className="mt-1 text-xs text-pcrred-600">
                                            {errors[`students.${index}.name`]}
                                        </p>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    className={inputClass}
                                    placeholder="NIM"
                                    value={student.nim ?? ''}
                                    onChange={(e) => updateStudent(index, 'nim', e.target.value)}
                                />
                                <input
                                    type="text"
                                    className={inputClass}
                                    placeholder="Peran (mis. Manager Project)"
                                    value={student.role ?? ''}
                                    onChange={(e) => updateStudent(index, 'role', e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeStudent(index)}
                                    className="rounded-lg border border-pcrred-200 px-3 py-2.5 text-sm font-medium text-pcrred-600 hover:bg-pcrred-50 sm:border-transparent"
                                >
                                    Hapus
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-6">
                <h2 className="mb-4 text-sm font-semibold tracking-wide text-pcr-700 uppercase">
                    Pembimbing & teknologi
                </h2>

                <div className="space-y-5">
                    <Field
                        label={dosenFieldLabel}
                        error={errors.dosen_ids}
                        hint={dosenFieldHint}
                    >
                        {options.dosen.length === 0 ? (
                            <p className="text-sm text-neutral-500">Belum ada dosen lain terdaftar.</p>
                        ) : (
                            <div className="grid gap-2 sm:grid-cols-2">
                                {options.dosen.map((dosen) => (
                                    <label
                                        key={dosen.id}
                                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2.5 text-sm hover:bg-neutral-50"
                                    >
                                        <input
                                            type="checkbox"
                                            className="size-4 rounded border-neutral-300 text-pcr-600 focus:ring-pcr-600"
                                            checked={(data.dosen_ids ?? []).includes(dosen.id)}
                                            onChange={() => toggleInArray('dosen_ids', dosen.id)}
                                        />
                                        <span className="text-neutral-800">{dosen.name}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </Field>

                    <Field label="Teknologi / tag" error={errors.tags}>
                        <div className="flex flex-wrap gap-2">
                            {options.tags.map((tag) => {
                                const active = (data.tags ?? []).includes(tag.id);

                                return (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        onClick={() => toggleInArray('tags', tag.id)}
                                        className={`rounded-full border px-3.5 py-2.5 text-sm font-medium transition ${
                                            active
                                                ? 'border-pcr-600 bg-pcr-600 text-white'
                                                : 'border-neutral-300 text-neutral-700 hover:bg-pcr-50'
                                        }`}
                                    >
                                        {tag.name}
                                    </button>
                                );
                            })}
                        </div>
                    </Field>
                </div>
            </section>
        </div>
    );
}
