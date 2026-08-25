<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

#[Fillable(['name', 'email', 'password', 'role', 'nip', 'avatar', 'is_active'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    public function isDosen(): bool
    {
        return $this->role === 'dosen';
    }

    /**
     * URL foto profil, null kalau belum pernah diunggah.
     */
    public function avatarUrl(): ?string
    {
        return $this->avatar ? Storage::disk('public')->url($this->avatar) : null;
    }

    /**
     * Inisial untuk dipakai sebagai pengganti foto profil.
     */
    public function initials(): string
    {
        preg_match_all('/\b[\p{L}]/u', $this->name ?? '', $m);

        return Str::upper(implode('', array_slice($m[0], 0, 2))) ?: '?';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isActive(): bool
    {
        return (bool) $this->is_active;
    }

    /**
     * Produk yang dia bimbing. Ini yang menentukan hak akses, bukan `products`.
     *
     * @return BelongsToMany<Product, $this>
     */
    public function supervisedProducts(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_dosen');
    }

    /**
     * Produk yang dia input sendiri. Dipakai untuk jejak audit saja.
     *
     * @return HasMany<Product, $this>
     */
    public function createdProducts(): HasMany
    {
        return $this->hasMany(Product::class, 'created_by');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }
}
