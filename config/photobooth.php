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
    |--------------------------------------------------------------------------
    | Foto bersifat sementara
    |--------------------------------------------------------------------------
    |
    | Server ini cuma tempat penitipan sebentar, bukan galeri. Foto dihapus
    | begitu selesai diunduh pengunjung, dan yang tidak pernah diunduh ikut
    | disapu setelah `simpan_menit`.
    |
    | Konsekuensinya: pengunjung hanya punya satu kesempatan mengunduh. Kalau di
    | lapangan itu terlalu berisiko (unduhan putus, mau simpan ulang di iPhone),
    | matikan lewat PHOTOBOOTH_HAPUS_SETELAH_UNDUH=false — foto lalu bertahan
    | sampai batas `simpan_menit`.
    |
    */

    'hapus_setelah_unduh' => filter_var(
        env('PHOTOBOOTH_HAPUS_SETELAH_UNDUH', true),
        FILTER_VALIDATE_BOOL,
    ),

    'simpan_menit' => (int) env('PHOTOBOOTH_SIMPAN_MENIT', 60),

];
