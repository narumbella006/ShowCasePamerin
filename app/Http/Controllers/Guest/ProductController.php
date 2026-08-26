<?php

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function show(Product $product): Response
    {
        abort_unless($product->status === 'published', 404);

        $product->load(['category', 'course', 'students', 'dosen', 'tags']);

        return Inertia::render('Guest/Show', [
            'product' => [
                'id' => $product->id,
                'title' => $product->title,
                'description' => $product->description,
                'academic_year' => $product->academic_year,
                'semester' => $product->semester,
                'poster_url' => $product->posterUrl(),
                'demo_link' => $product->demo_link,
                'video_link' => $product->video_link,
                'category' => $product->category?->name,
                'course' => $product->course?->code ?? $product->course?->name,
                'students' => $product->students->map(fn ($s) => [
                    'name' => $s->name,
                    'nim' => $s->nim,
                    'role' => $s->role,
                ]),
                'dosen' => $product->dosen->map(fn ($d) => [
                    'name' => $d->name,
                    'nip' => $d->nip,
                ]),
                'tags' => $product->tags->pluck('name'),
            ],
        ]);
    }
}
