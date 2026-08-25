<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Course;
use App\Models\Product;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'products' => [
                    'total' => Product::count(),
                    'draft' => Product::where('status', 'draft')->count(),
                    'published' => Product::where('status', 'published')->count(),
                    'archived' => Product::where('status', 'archived')->count(),
                ],
                'categories' => Category::count(),
                'courses' => Course::count(),
                'dosen' => [
                    'total' => User::where('role', 'dosen')->count(),
                    'active' => User::where('role', 'dosen')->where('is_active', true)->count(),
                ],
            ],
            'productsByCategory' => Category::withCount('products')
                ->orderByDesc('products_count')
                ->get(['id', 'name'])
                ->map(fn (Category $category) => [
                    'name' => $category->name,
                    'total' => $category->products_count,
                ]),
            'productsByYear' => Product::query()
                ->select('academic_year')
                ->selectRaw('count(*) as total')
                ->groupBy('academic_year')
                ->orderByDesc('academic_year')
                ->get(),
        ]);
    }
}
