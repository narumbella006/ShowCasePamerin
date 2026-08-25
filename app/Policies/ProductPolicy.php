<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    /**
     * Semua dosen pembimbing punya hak yang sama atas sebuah produk —
     * bukan hanya yang menginput. Keputusan ini mengikuti alur B.1 dokumen
     * rancangan: apa pun yang muncul di dashboard dosen boleh dia ubah.
     */
    protected function supervises(User $user, Product $product): bool
    {
        if ($product->relationLoaded('dosen')) {
            return $product->dosen->contains($user);
        }

        return $product->dosen()->whereKey($user->getKey())->exists();
    }

    public function viewAny(User $user): bool
    {
        return $user->isDosen();
    }

    public function view(User $user, Product $product): bool
    {
        return $user->isDosen() && $this->supervises($user, $product);
    }

    public function create(User $user): bool
    {
        return $user->isDosen();
    }

    public function update(User $user, Product $product): bool
    {
        return $user->isDosen() && $this->supervises($user, $product);
    }

    public function delete(User $user, Product $product): bool
    {
        return $user->isDosen() && $this->supervises($user, $product);
    }
}
