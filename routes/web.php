<?php

use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CourseController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DosenAccountController;
use App\Http\Controllers\Admin\ProductModerationController;
use App\Http\Controllers\Dosen\ProductController as DosenProductController;
use App\Http\Controllers\Dosen\ProfileController;
use App\Http\Controllers\Guest\HomeController;
use App\Http\Controllers\Guest\ProductController;
use Illuminate\Support\Facades\Route;

Route::name('guest.')->group(function () {
    Route::get('/', [HomeController::class, 'index'])->name('home');
    Route::get('/produk/{product}', [ProductController::class, 'show'])->name('products.show');
});
require __DIR__.'/auth.php';

Route::middleware(['auth', 'dosen'])
    ->prefix('dosen')
    ->name('dosen.')
    ->group(function () {
        Route::redirect('/', '/dosen/produk')->name('dashboard');

        Route::resource('produk', DosenProductController::class)
            ->parameters(['produk' => 'product'])
            ->names('products')
            ->except(['show']);

        Route::get('profil', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::put('profil', [ProfileController::class, 'update'])->name('profile.update');
        Route::put('profil/password', [ProfileController::class, 'updatePassword'])
            ->name('profile.password');

        Route::post('logout', [ProfileController::class, 'logout'])->name('logout');
    });

Route::middleware(['auth', 'admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

        Route::resource('kategori', CategoryController::class)
            ->parameters(['kategori' => 'category'])
            ->names('categories')
            ->only(['index', 'store', 'update', 'destroy']);

        Route::resource('mata-kuliah', CourseController::class)
            ->parameters(['mata-kuliah' => 'course'])
            ->names('courses')
            ->only(['index', 'store', 'update', 'destroy']);

        Route::get('dosen', [DosenAccountController::class, 'index'])->name('dosen.index');
        Route::get('dosen/tambah', [DosenAccountController::class, 'create'])->name('dosen.create');
        Route::post('dosen', [DosenAccountController::class, 'store'])->name('dosen.store');
        Route::get('dosen/{dosen}/edit', [DosenAccountController::class, 'edit'])->name('dosen.edit');
        Route::put('dosen/{dosen}', [DosenAccountController::class, 'update'])->name('dosen.update');
        Route::post('dosen/{dosen}/reset-password', [DosenAccountController::class, 'resetPassword'])
            ->name('dosen.reset-password');
        Route::patch('dosen/{dosen}/toggle-active', [DosenAccountController::class, 'toggleActive'])
            ->name('dosen.toggle-active');

        Route::get('produk', [ProductModerationController::class, 'index'])->name('products.index');
        Route::get('produk/tambah', [ProductModerationController::class, 'create'])->name('products.create');
        Route::post('produk', [ProductModerationController::class, 'store'])->name('products.store');
        Route::get('produk/{product}/edit', [ProductModerationController::class, 'edit'])->name('products.edit');
        Route::put('produk/{product}', [ProductModerationController::class, 'update'])->name('products.update');
        Route::delete('produk/{product}', [ProductModerationController::class, 'destroy'])->name('products.destroy');
    });
