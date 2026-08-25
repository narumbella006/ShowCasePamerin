<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\Dosen\ProductRequestRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
{
    use ProductRequestRules;

    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * Admin tidak otomatis tercatat sebagai pembimbing (dia bukan dosen),
     * jadi `dosen_ids` di sini wajib diisi minimal satu.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            ...$this->productRules(),
            'dosen_ids' => ['required', 'array', 'min:1'],
            'dosen_ids.*' => ['integer', Rule::exists('users', 'id')->where('role', 'dosen')],
        ];
    }
}
