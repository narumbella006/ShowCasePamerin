<?php

namespace App\Http\Requests\Dosen;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    use ProductRequestRules;

    public function authorize(): bool
    {
        return $this->user()->can('create', Product::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return $this->productRules();
    }
}
