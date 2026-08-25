<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCategoryRequest;
use App\Http\Requests\Admin\UpdateCategoryRequest;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Categories/Index', [
            'categories' => Category::withCount('products')
                ->orderBy('name')
                ->get()
                ->map(fn (Category $category) => [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'icon' => $category->icon,
                    'products_count' => $category->products_count,
                ]),
        ]);
    }

    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        $data = $request->validated();

        Category::create([
            ...$data,
            'slug' => Str::slug($data['name']),
        ]);

        return back()->with('success', "Kategori \"{$data['name']}\" ditambahkan.");
    }

    public function update(UpdateCategoryRequest $request, Category $category): RedirectResponse
    {
        $data = $request->validated();

        $category->update([
            ...$data,
            'slug' => Str::slug($data['name']),
        ]);

        return back()->with('success', "Kategori \"{$category->name}\" diperbarui.");
    }

    public function destroy(Category $category): RedirectResponse
    {
        $count = $category->products()->count();

        if ($count > 0) {
            return back()->with(
                'error',
                "Kategori \"{$category->name}\" masih dipakai {$count} produk, tidak bisa dihapus."
            );
        }

        $category->delete();

        return back()->with('success', "Kategori \"{$category->name}\" dihapus.");
    }
}
