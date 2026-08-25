<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\Dosen\ProductRequestRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    use ProductRequestRules;

    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * Admin tidak otomatis tercatat sebagai pembimbing (dia bukan dosen),
     * jadi beda dari versi dosen: `dosen_ids` di sini wajib diisi minimal satu.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            ...$this->productRules(),
            'remove_poster' => ['boolean'],
            'dosen_ids' => ['required', 'array', 'min:1'],
            'dosen_ids.*' => ['integer', Rule::exists('users', 'id')->where('role', 'dosen')],
        ];
    }
}
