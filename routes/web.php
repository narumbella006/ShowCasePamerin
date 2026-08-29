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
use App\Http\Controllers\PhotoboothController;
use Illuminate\Support\Facades\Route;

Route::name('guest.')->group(function () {
    Route::get('/', [HomeController::class, 'index'])->name('home');
    Route::get('/produk/{product}', [ProductController::class, 'show'])->name('products.show');
});
require __DIR__.'/auth.php';

// Titipan hasil photobooth acara. Aktif hanya kalau PHOTOBOOTH_TOKEN diisi.
// Jalur unduh sengaja pendek supaya QR-nya rapat dan gampang di-scan.
Route::name('photobooth.')->group(function () {
    Route::get('photobooth', [PhotoboothController::class, 'halaman'])->name('index');

    // Jepretan dari halaman photobooth (dijaga CSRF sesi browser).
    Route::post('photobooth/jepret', [PhotoboothController::class, 'jepret'])
        ->middleware('throttle:30,1')
        ->name('jepret');

    // Titipan dari aplikasi photobooth di laptop panitia (dijaga token).
    Route::post('photobooth/unggah', [PhotoboothController::class, 'unggah'])
        ->middleware('throttle:60,1')
        ->name('unggah');

    Route::prefix('f/{kode}')
        ->where(['kode' => '[0-9a-z]{4,16}', 'indeks' => '[1-9][0-9]?'])
        ->group(function () {
            Route::get('/', [PhotoboothController::class, 'tampil'])->name('tampil');
            Route::get('semua', [PhotoboothController::class, 'semua'])->name('semua');
            Route::get('g/{indeks}', [PhotoboothController::class, 'gambar'])->name('gambar');
            Route::get('u/{indeks}', [PhotoboothController::class, 'unduh'])->name('unduh');
        });
});

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
