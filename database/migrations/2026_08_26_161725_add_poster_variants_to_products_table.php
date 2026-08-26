<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Path varian disimpan di kolom sendiri, bukan disusun dari poster_path
     * di view. Dengan begitu produk lama yang belum diproses tetap bernilai
     * null dan bisa mundur ke poster asli, tanpa perlu memeriksa keberadaan
     * berkas untuk setiap gambar setiap kali halaman dibuka.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('poster_thumb_path')->nullable()->after('poster_path');
            $table->string('poster_medium_path')->nullable()->after('poster_thumb_path');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['poster_thumb_path', 'poster_medium_path']);
        });
    }
};
