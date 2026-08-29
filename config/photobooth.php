<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Token unggah photobooth
    |--------------------------------------------------------------------------
    |
    | Dipakai aplikasi photobooth di laptop untuk menitipkan hasil foto ke sini.
    | Selama token kosong, seluruh fitur photobooth mati total (endpoint balas
    | 404), jadi kode ini aman ikut ter-deploy sebelum tokennya disiapkan.
    |
    */

    'token' => env('PHOTOBOOTH_TOKEN'),

    /*
    | Batas ukuran satu foto (KB). Hasil photobooth 2600x1463 biasanya < 1 MB.
    */
    'maks_kb' => (int) env('PHOTOBOOTH_MAKS_KB', 8192),

    /*
    | Foto lebih tua dari sekian hari dibersihkan sendiri saat ada unggahan
    | baru, supaya Railway Volume tidak penuh pelan-pelan. Isi 0 untuk
    | menyimpan selamanya.
    */
    'simpan_hari' => (int) env('PHOTOBOOTH_SIMPAN_HARI', 30),

];
