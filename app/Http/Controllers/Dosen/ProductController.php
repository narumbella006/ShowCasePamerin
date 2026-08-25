<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dosen\StoreProductRequest;
use App\Http\Requests\Dosen\UpdateProductRequest;
use App\Models\Category;
use App\Models\Course;
use App\Models\Product;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Product::class);

        $dosen = $request->user();

        $base = fn () => Product::query()->supervisedBy($dosen);

        $products = $base()
            ->with(['category:id,name', 'course:id,name,code'])
            ->when($request->string('search')->trim()->value(), function (Builder $q, string $search) {
                $q->where(function (Builder $inner) use ($search) {
                    $inner->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($request->string('status')->value(), function (Builder $q, string $status) {
                $q->where('status', $status);
            })
            ->latest('updated_at')
            ->paginate(9)
            ->withQueryString()
            ->through(fn (Product $product) => [
                'id' => $product->id,
                'slug' => $product->slug,
                'title' => $product->title,
                'status' => $product->status,
                'academic_year' => $product->academic_year,
                'semester' => $product->semester,
                'views_count' => $product->views_count,
                'poster_url' => $product->posterUrl(),
                'category' => $product->category?->name,
                'course' => $product->course?->code ?? $product->course?->name,
                'updated_at' => $product->updated_at?->diffForHumans(),
            ]);

        return Inertia::render('Dosen/Products/Index', [
            'products' => $products,
            'filters' => [
                'search' => $request->string('search')->value(),
                'status' => $request->string('status')->value(),
            ],
            'stats' => [
                'total' => $base()->count(),
                'draft' => $base()->where('status', 'draft')->count(),
                'published' => $base()->where('status', 'published')->count(),
                'archived' => $base()->where('status', 'archived')->count(),
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Product::class);

        return Inertia::render('Dosen/Products/Create', [
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
            }

            $product->save();

            $this->syncRelations($product, $request->user(), $data);

            return $product;
        });

        return to_route('dosen.products.index')->with(
            'success',
            $product->status === 'published'
                ? "Produk \"{$product->title}\" berhasil dipublikasikan."
                : "Produk \"{$product->title}\" tersimpan sebagai draft.",
        );
    }

    public function edit(Product $product): Response
    {
        $this->authorize('update', $product);

        $product->load(['students', 'tags:id', 'dosen:id']);

        return Inertia::render('Dosen/Products/Edit', [
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
                'github_link' => $product->github_link,
                'poster_url' => $product->posterUrl(),
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

            // `published_at` menandai kapan produk pertama kali tampil publik,
            // jadi hanya diisi sekali dan tidak ditimpa saat republish.
            if ($product->status === 'published' && $product->published_at === null) {
                $product->published_at = now();
            }

            if ($request->hasFile('poster')) {
                $this->deletePoster($product);
                $product->poster_path = $request->file('poster')->store('posters', 'public');
            } elseif ($request->boolean('remove_poster')) {
                $this->deletePoster($product);
                $product->poster_path = null;
            }

            $product->save();

            $this->syncRelations($product, $request->user(), $data);
        });

        return to_route('dosen.products.index')
            ->with('success', "Perubahan pada \"{$product->title}\" tersimpan.");
    }

    public function destroy(Product $product): RedirectResponse
    {
        $this->authorize('delete', $product);

        $title = $product->title;

        DB::transaction(function () use ($product) {
            $this->deletePoster($product);
            $product->delete();
        });

        return to_route('dosen.products.index')->with('success', "Produk \"{$title}\" dihapus.");
    }

    /**
     * Pilihan dropdown untuk form. Dosen tidak boleh membuat kategori atau
     * mata kuliah baru — itu wewenang admin.
     *
     * @return array<string, mixed>
     */
    protected function formOptions(): array
    {
        return [
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'courses' => Course::orderBy('name')->get(['id', 'name', 'code']),
            'tags' => Tag::orderBy('name')->get(['id', 'name']),
            'dosen' => User::where('role', 'dosen')
                ->whereKeyNot(request()->user()->id)
                ->orderBy('name')
                ->get(['id', 'name', 'nip']),
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     */
    protected function syncRelations(Product $product, User $actor, array $data): void
    {
        // Dosen yang sedang login wajib ikut jadi pembimbing. Tanpa ini dia
        // langsung kehilangan akses ke produknya sendiri, karena hak akses
        // dihitung dari pivot `product_dosen`.
        $pembimbing = collect($data['dosen_ids'] ?? [])
            ->push($actor->id)
            ->unique()
            ->all();

        $product->dosen()->sync($pembimbing);
        $product->tags()->sync($data['tags'] ?? []);

        $product->students()->delete();
        if (! empty($data['students'])) {
            $product->students()->createMany($data['students']);
        }
    }

    protected function deletePoster(Product $product): void
    {
        if ($product->poster_path) {
            Storage::disk('public')->delete($product->poster_path);
        }
    }
}
