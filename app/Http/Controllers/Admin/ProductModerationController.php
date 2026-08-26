<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Models\Category;
use App\Models\Course;
use App\Models\Product;
use App\Services\PosterImageService;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProductModerationController extends Controller
{
    public function index(Request $request): Response
    {
        $products = Product::query()
            ->with(['category:id,name', 'course:id,name,code', 'dosen:id,name'])
            ->when($request->string('search')->trim()->value(), function (Builder $query, string $search) {
                $query->where(function (Builder $inner) use ($search) {
                    $inner->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($request->string('status')->value(), function (Builder $query, string $status) {
                $query->where('status', $status);
            })
            ->when($request->string('category')->value(), function (Builder $query, string $category) {
                $query->whereHas('category', fn (Builder $q) => $q->where('slug', $category));
            })
            ->latest('updated_at')
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Product $product) => [
                'id' => $product->id,
                'slug' => $product->slug,
                'title' => $product->title,
                'status' => $product->status,
                'academic_year' => $product->academic_year,
                'poster_url' => $product->posterThumbUrl(),
                'category' => $product->category?->name,
                'course' => $product->course?->code ?? $product->course?->name,
                'dosen' => $product->dosen->pluck('name'),
                'updated_at' => $product->updated_at?->diffForHumans(),
            ]);

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
            'categories' => Category::orderBy('name')->get(['id', 'name', 'slug']),
            'filters' => [
                'search' => $request->string('search')->value(),
                'status' => $request->string('status')->value(),
                'category' => $request->string('category')->value(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Products/Create', [
            'options' => $this->formOptions(),
        ]);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $product = DB::transaction(function () use ($request, $data) {
            $product = new Product([
                ...collect($data)->except(['poster', 'students', 'tags', 'dosen_ids'])->all(),
                'slug' => Product::generateSlug($data['title']),
                'created_by' => $request->user()->id,
                'published_at' => $data['status'] === 'published' ? now() : null,
            ]);

            if ($request->hasFile('poster')) {
                $product->poster_path = $request->file('poster')->store('posters', 'public');
                $this->terapkanVarianPoster($product);
            }

            $product->save();

            $product->dosen()->sync($data['dosen_ids']);
            $product->tags()->sync($data['tags'] ?? []);

            if (! empty($data['students'])) {
                $product->students()->createMany($data['students']);
            }

            return $product;
        });

        return to_route('admin.products.index')->with(
            'success',
            "Produk \"{$product->title}\" ditambahkan."
        );
    }

    public function edit(Product $product): Response
    {
        $product->load(['students', 'tags:id', 'dosen:id']);

        return Inertia::render('Admin/Products/Edit', [
            'options' => $this->formOptions(),
            'product' => [
                'id' => $product->id,
                'slug' => $product->slug,
                'title' => $product->title,
                'description' => $product->description,
                'category_id' => $product->category_id,
                'course_id' => $product->course_id,
                'academic_year' => $product->academic_year,
                'semester' => $product->semester,
                'status' => $product->status,
                'demo_link' => $product->demo_link,
                'video_link' => $product->video_link,
                'poster_url' => $product->posterThumbUrl(),
                'students' => $product->students
                    ->map(fn ($s) => ['name' => $s->name, 'nim' => $s->nim, 'role' => $s->role])
                    ->values(),
                'tags' => $product->tags->pluck('id'),
                'dosen_ids' => $product->dosen->pluck('id'),
            ],
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($request, $product, $data) {
            $product->fill(collect($data)->except(['poster', 'students', 'tags', 'dosen_ids', 'remove_poster'])->all());

            if ($product->isDirty('title')) {
                $product->slug = Product::generateSlug($data['title'], $product->id);
            }

            if ($product->status === 'published' && $product->published_at === null) {
                $product->published_at = now();
            }

            if ($request->hasFile('poster')) {
                $this->deletePoster($product);
                $product->poster_path = $request->file('poster')->store('posters', 'public');
                $this->terapkanVarianPoster($product);
            } elseif ($request->boolean('remove_poster')) {
                $this->deletePoster($product);
                $product->poster_path = null;
                $product->poster_thumb_path = null;
                $product->poster_medium_path = null;
            }

            $product->save();

            $product->dosen()->sync($data['dosen_ids']);
            $product->tags()->sync($data['tags'] ?? []);

            $product->students()->delete();
            if (! empty($data['students'])) {
                $product->students()->createMany($data['students']);
            }
        });

        return to_route('admin.products.index')->with('success', "Perubahan pada \"{$product->title}\" tersimpan.");
    }

    public function destroy(Product $product): RedirectResponse
    {
        $title = $product->title;

        DB::transaction(function () use ($product) {
            $this->deletePoster($product);
            $product->delete();
        });

        return back()->with('success', "Produk \"{$title}\" dihapus.");
    }

    /**
     * @return array<string, mixed>
     */
    protected function formOptions(): array
    {
        return [
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'courses' => Course::orderBy('name')->get(['id', 'name', 'code']),
            'tags' => Tag::orderBy('name')->get(['id', 'name']),
            'dosen' => User::where('role', 'dosen')->orderBy('name')->get(['id', 'name', 'nip']),
        ];
    }

    protected function deletePoster(Product $product): void
    {
        if ($product->poster_path) {
            Storage::disk('public')->delete($product->poster_path);
        }

        app(PosterImageService::class)->hapusVarian([
            $product->poster_thumb_path,
            $product->poster_medium_path,
        ]);
    }

    /**
     * Bikin turunan kecil untuk poster yang baru diunggah. Kalau GD tidak
     * tersedia di server, varian bernilai null dan tampilan mundur ke poster
     * asli — tidak ada yang rusak, hanya tidak hemat.
     */
    protected function terapkanVarianPoster(Product $product): void
    {
        $varian = app(PosterImageService::class)->buatVarian($product->poster_path);

        $product->poster_thumb_path = $varian['thumb'];
        $product->poster_medium_path = $varian['medium'];
    }
}
