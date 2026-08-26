<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

#[Fillable([
    'title',
    'slug',
    'description',
    'category_id',
    'course_id',
    'academic_year',
    'semester',
    'poster_path',
    'poster_thumb_path',
    'poster_medium_path',
    'demo_link',
    'video_link',
    'status',
    'created_by',
    'published_at',
])]
class Product extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
            'views_count' => 'integer',
        ];
    }

    /**
     * Pakai slug di URL, bukan id.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * @return BelongsTo<Course, $this>
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Dosen/admin yang pertama kali menginput produk ini.
     *
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Dosen pembimbing. Hak edit/hapus ditentukan lewat relasi ini,
     * bukan lewat kolom `created_by`.
     *
     * @return BelongsToMany<User, $this>
     */
    public function dosen(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'product_dosen');
    }

    /**
     * @return HasMany<ProductStudent, $this>
     */
    public function students(): HasMany
    {
        return $this->hasMany(ProductStudent::class);
    }

    /**
     * @return BelongsToMany<Tag, $this>
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'product_tag');
    }

    /**
     * @param  Builder<Product>  $query
     */
    public function scopePublished(Builder $query): void
    {
        $query->where('status', 'published');
    }

    /**
     * Produk yang boleh diakses seorang dosen, yaitu produk di mana dia
     * terdaftar sebagai pembimbing.
     *
     * @param  Builder<Product>  $query
     */
    public function scopeSupervisedBy(Builder $query, User $user): void
    {
        $query->whereHas('dosen', fn (Builder $q) => $q->whereKey($user->getKey()));
    }

    /**
     * URL poster untuk ditampilkan di frontend, null kalau belum diupload.
     */
    public function posterUrl(): ?string
    {
        return $this->poster_path ? Storage::disk('public')->url($this->poster_path) : null;
    }

    /**
     * URL poster kecil untuk grid dan ubin dekoratif. Produk lama yang belum
     * punya varian mundur ke poster asli supaya gambarnya tetap muncul.
     */
    public function posterThumbUrl(): ?string
    {
        return $this->poster_thumb_path
            ? Storage::disk('public')->url($this->poster_thumb_path)
            : $this->posterUrl();
    }

    /**
     * URL poster ukuran sedang untuk halaman detail.
     */
    public function posterMediumUrl(): ?string
    {
        return $this->poster_medium_path
            ? Storage::disk('public')->url($this->poster_medium_path)
            : $this->posterUrl();
    }

    /**
     * Slug unik dari judul. `$ignoreId` dipakai saat update supaya produk
     * tidak bentrok dengan slug miliknya sendiri.
     */
    public static function generateSlug(string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title) ?: 'produk';
        $slug = $base;
        $suffix = 1;

        while (
            static::query()
                ->where('slug', $slug)
                ->when($ignoreId, fn (Builder $q) => $q->whereKeyNot($ignoreId))
                ->exists()
        ) {
            $slug = $base.'-'.++$suffix;
        }

        return $slug;
    }
}
