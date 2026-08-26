<?php

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductStudent;
use App\Models\Tag;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();
        $category = $request->string('category')->value();
        $academicYear = $request->string('academic_year')->value();

        $products = Product::query()
            ->published()
            ->with(['category:id,name,slug', 'students:id,product_id,name'])
            ->when($search, function (Builder $query, string $search) {
                $query->where(function (Builder $inner) use ($search) {
                    $inner->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($category, function (Builder $query, string $category) {
                $query->whereHas('category', fn (Builder $q) => $q->where('slug', $category));
            })
            ->when($academicYear, function (Builder $query, string $academicYear) {
                $query->where('academic_year', $academicYear);
            })
            ->latest('published_at')
            ->paginate(9)
            ->withQueryString()
            ->through(fn (Product $product) => [
                'id' => $product->id,
                'slug' => $product->slug,
                'title' => $product->title,
                'academic_year' => $product->academic_year,
                'poster_url' => $product->posterThumbUrl(),
                'category' => $product->category?->name,
                'students' => $product->students->pluck('name'),
                'published_at' => $product->published_at?->toIso8601String(),
            ]);

        $categories = Category::orderBy('name')->get(['id', 'name', 'slug']);

        $academicYears = Product::query()
            ->published()
            ->select('academic_year')
            ->distinct()
            ->orderByDesc('academic_year')
            ->pluck('academic_year');

        $tags = Tag::query()
            ->whereHas('products', fn (Builder $query) => $query->published())
            ->orderBy('name')
            ->pluck('name');

        $stats = [
            'products' => Product::query()->published()->count(),
            'categories' => Category::query()->count(),
            'students' => ProductStudent::query()
                ->whereHas('product', fn (Builder $query) => $query->published())
                ->count(),
        ];

        // Poster produk yang benar-benar sudah diunggah dosen, dipakai untuk
        // carousel & background dekoratif di beranda. Belum tentu semua
        // produk published sudah punya poster, jadi yang kosong disaring.
        $posters = Product::query()
            ->published()
            ->whereNotNull('poster_path')
            ->latest('published_at')
            ->limit(12)
            ->get(['id', 'slug', 'title', 'poster_path'])
            ->map(fn (Product $product) => [
                'image' => $product->posterThumbUrl(),
                'title' => $product->title,
                'slug' => $product->slug,
            ])
            ->values();

        return Inertia::render('Guest/Home', [
            'products' => $products,
            'categories' => $categories,
            'academicYears' => $academicYears,
            'tags' => $tags,
            'stats' => $stats,
            'posters' => $posters,
            'filters' => [
                'search' => $search,
                'category' => $category,
                'academic_year' => $academicYear,
            ],
        ]);
    }
}
