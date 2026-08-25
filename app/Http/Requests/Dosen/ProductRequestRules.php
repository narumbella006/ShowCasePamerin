<?php

namespace App\Http\Requests\Dosen;

use Illuminate\Validation\Rule;

trait ProductRequestRules
{
    /**
     * @return array<string, mixed>
     */
    protected function productRules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'course_id' => ['nullable', 'integer', 'exists:courses,id'],
            'academic_year' => ['required', 'string', 'regex:/^\d{4}\/\d{4}$/'],
            'semester' => ['required', Rule::in(['ganjil', 'genap'])],
            'status' => ['required', Rule::in(['draft', 'published', 'archived'])],
            'poster' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'demo_link' => ['nullable', 'url', 'max:255'],
            'video_link' => ['nullable', 'url', 'max:255'],
            'github_link' => ['nullable', 'url', 'max:255'],

            'students' => ['array'],
            'students.*.name' => ['required', 'string', 'max:255'],
            'students.*.nim' => ['nullable', 'string', 'max:30'],
            'students.*.role' => ['nullable', 'string', 'max:100'],

            'tags' => ['array'],
            'tags.*' => ['integer', 'exists:tags,id'],

            // Dosen pembimbing tambahan. User yang sedang login selalu
            // ikut ter-attach di controller, jadi tidak wajib dikirim.
            'dosen_ids' => ['array'],
            'dosen_ids.*' => [
                'integer',
                Rule::exists('users', 'id')->where('role', 'dosen'),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'academic_year.regex' => 'Tahun ajaran harus berformat 2025/2026.',
            'students.*.name.required' => 'Nama mahasiswa tidak boleh kosong.',
            'students.*.nim.max' => 'NIM maksimal 30 karakter.',
            'poster.max' => 'Ukuran poster maksimal 2 MB.',
            'poster.mimes' => 'Poster harus berformat JPG, PNG, atau WebP.',
            'dosen_ids.*.exists' => 'Dosen pembimbing yang dipilih tidak valid.',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'title' => 'Judul produk',
            'description' => 'Deskripsi',
            'category_id' => 'Kategori',
            'course_id' => 'Mata kuliah',
            'academic_year' => 'Tahun ajaran',
            'semester' => 'Semester',
            'status' => 'Status',
            'poster' => 'Poster',
            'demo_link' => 'Link demo',
            'video_link' => 'Link video',
            'github_link' => 'Link GitHub',
            'tags' => 'Teknologi',
            'dosen_ids' => 'Dosen pembimbing',
        ];
    }
}
