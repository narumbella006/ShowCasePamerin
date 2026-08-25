<?php
namespace Database\Seeders;

use App\Models\Category;
use App\Models\Course;
use App\Models\Product;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ShowcaseSeeder extends Seeder
{
    /**
     * Data dummy yang cukup banyak & bervariasi supaya katalog, carousel
     * poster, marquee teknologi, dan filter tahun ajaran/kategori di guest
     * view kelihatan terisi — bukan cuma beberapa baris kosong.
     */
    public function run(): void
    {
        $dosen = User::updateOrCreate(
            ['email' => 'dosen@pcr.ac.id'],
            [
                'name' => 'Erzi Hidayat S.T., M.Kom.',
                'password' => Hash::make('password'),
                'role' => 'dosen',
                'nip' => '198504122010012001',
            ],
        );

        $dosenLain = User::updateOrCreate(
            ['email' => 'budi@pcr.ac.id'],
            [
                'name' => 'Budi Santoso, M.Kom.',
                'password' => Hash::make('password'),
                'role' => 'dosen',
                'nip' => '199003152015041002',
            ],
        );

        User::updateOrCreate(
            ['email' => 'admin@pcr.ac.id'],
            [
                'name' => 'Admin Prodi',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ],
        );

        // Dosen tambahan supaya daftar pilihan pembimbing pada form produk
        // tidak cuma berisi satu-dua nama, dan supaya produk dummy bisa
        // disebar ke banyak dosen berbeda (bukan cuma Erzi terus-terusan).
        $dosenTambahan = [
            ['nama' => 'Dr. Siti Rahmawati, M.T.', 'email' => 'siti.rahmawati@pcr.ac.id', 'nip' => '198201152008012003'],
            ['nama' => 'Ahmad Fauzi, S.Kom., M.Cs.', 'email' => 'ahmad.fauzi@pcr.ac.id', 'nip' => '198711202012041005'],
            ['nama' => 'Dr. Ir. Hendra Wijaya, M.Eng.', 'email' => 'hendra.wijaya@pcr.ac.id', 'nip' => '197905082005011004'],
            ['nama' => 'Lestari Ningsih, S.T., M.T.', 'email' => 'lestari.ningsih@pcr.ac.id', 'nip' => '199206302018032001'],
            ['nama' => 'Muhammad Iqbal, M.Kom.', 'email' => 'm.iqbal@pcr.ac.id', 'nip' => '199401122019031002'],
        ];

        $dosenPool = collect([$dosen, $dosenLain])->concat(
            collect($dosenTambahan)->map(fn (array $d) => User::updateOrCreate(
                ['email' => $d['email']],
                [
                    'name' => $d['nama'],
                    'password' => Hash::make('password'),
                    'role' => 'dosen',
                    'nip' => $d['nip'],
                ],
            )),
        )->values();

        $categories = collect([
            ['name' => 'Web Application', 'icon' => 'globe'],
            ['name' => 'Mobile Application', 'icon' => 'smartphone'],
            ['name' => 'IoT & Hardware', 'icon' => 'cpu'],
            ['name' => 'Data & AI', 'icon' => 'brain'],
            ['name' => 'Game', 'icon' => 'gamepad'],
        ])->map(fn (array $c) => Category::updateOrCreate(
            ['slug' => Str::slug($c['name'])],
            ['name' => $c['name'], 'icon' => $c['icon']],
        ));

        $courses = collect([
            ['name' => 'Project Based Learning', 'code' => 'PBL'],
            ['name' => 'Proyek Akhir', 'code' => 'PA'],
            ['name' => 'Teknologi Informasi Cerdas', 'code' => 'TIC'],
            ['name' => 'Deep Learning', 'code' => 'DL'],
        ])->map(fn (array $c) => Course::updateOrCreate(
            ['name' => $c['name']],
            ['code' => $c['code']],
        ));

        $tags = collect([
            'Laravel', 'React', 'Flutter', 'Python', 'Arduino', 'MySQL', 'TensorFlow',
            'Node.js', 'Vue.js', 'Firebase', 'Unity', 'PostgreSQL', 'ESP32', 'OpenCV', 'Next.js',
        ])->map(fn (string $name) => Tag::updateOrCreate(
            ['slug' => Str::slug($name)],
            ['name' => $name],
        ));

        $samples = [
            [
                'title' => 'NutriChain MBG',
                'status' => 'published',
                'category' => 'Web Application',
                'course' => 'Project Based Learning',
                'tags' => ['Laravel', 'MySQL'],
                'academic_year' => '2025/2026',
                'semester' => 'ganjil',
                'dosen' => [0, 1],
                'students' => [
                    ['name' => 'Andi Pratama', 'nim' => '3312301001', 'role' => 'Manager Project'],
                    ['name' => 'Sari Melati', 'nim' => '3312301002', 'role' => 'Development Team'],
                ],
            ],
            [
                'title' => 'SmartFarm Monitoring',
                'status' => 'published',
                'category' => 'IoT & Hardware',
                'course' => 'Proyek Akhir',
                'tags' => ['Arduino', 'Python'],
                'academic_year' => '2025/2026',
                'semester' => 'ganjil',
                'dosen' => [0],
                'students' => [
                    ['name' => 'Reza Fahlevi', 'nim' => '3312301010', 'role' => 'Manager Project'],
                ],
            ],
            [
                'title' => 'Klasifikasi Penyakit Daun Cabai',
                'status' => 'draft',
                'category' => 'Data & AI',
                'course' => 'Deep Learning',
                'tags' => ['Python', 'TensorFlow'],
                'academic_year' => '2025/2026',
                'semester' => 'ganjil',
                'dosen' => [3],
                'students' => [
                    ['name' => 'Nadia Putri', 'nim' => '3312301021', 'role' => 'Development Team'],
                ],
            ],
            [
                'title' => 'Sistem Antrean Poliklinik',
                'status' => 'archived',
                'category' => 'Mobile Application',
                'course' => 'Project Based Learning',
                'tags' => ['Flutter'],
                'academic_year' => '2024/2025',
                'semester' => 'genap',
                'dosen' => [1],
                'students' => [
                    ['name' => 'Yoga Saputra', 'nim' => '3312301033', 'role' => 'Manager Project'],
                ],
            ],
            [
                'title' => 'SIMANIS - Sistem Informasi Inventaris Sekolah',
                'status' => 'published',
                'category' => 'Web Application',
                'course' => 'Project Based Learning',
                'tags' => ['Laravel', 'MySQL'],
                'academic_year' => '2024/2025',
                'semester' => 'genap',
                'dosen' => [2],
                'students' => [
                    ['name' => 'Fajar Nugroho', 'nim' => '3312302005', 'role' => 'Manager Project'],
                    ['name' => 'Dewi Anggraini', 'nim' => '3312302006', 'role' => 'Development Team'],
                ],
            ],
            [
                'title' => 'TaniConnect - Marketplace Hasil Tani Lokal',
                'status' => 'published',
                'category' => 'Web Application',
                'course' => 'Proyek Akhir',
                'tags' => ['Laravel', 'Vue.js', 'PostgreSQL'],
                'academic_year' => '2025/2026',
                'semester' => 'ganjil',
                'dosen' => [4, 0],
                'students' => [
                    ['name' => 'Rangga Saputra', 'nim' => '3312302011', 'role' => 'Manager Project'],
                    ['name' => 'Putri Wulandari', 'nim' => '3312302012', 'role' => 'Development Team'],
                ],
            ],
            [
                'title' => 'HealthTrack - Pemantau Kesehatan Harian',
                'status' => 'published',
                'category' => 'Mobile Application',
                'course' => 'Project Based Learning',
                'tags' => ['Flutter', 'Firebase'],
                'academic_year' => '2024/2025',
                'semester' => 'ganjil',
                'dosen' => [5],
                'students' => [
                    ['name' => 'Bagas Wicaksono', 'nim' => '3312302015', 'role' => 'Development Team'],
                ],
            ],
            [
                'title' => 'AbsensiQR - Presensi QR Code Kampus',
                'status' => 'published',
                'category' => 'Mobile Application',
                'course' => 'Project Based Learning',
                'tags' => ['Flutter', 'MySQL'],
                'academic_year' => '2023/2024',
                'semester' => 'genap',
                'dosen' => [1, 6],
                'students' => [
                    ['name' => 'Citra Ayu Lestari', 'nim' => '3312302019', 'role' => 'Manager Project'],
                    ['name' => 'Doni Firmansyah', 'nim' => '3312302020', 'role' => 'Development Team'],
                ],
            ],
            [
                'title' => 'SmartHome Controller ESP32',
                'status' => 'published',
                'category' => 'IoT & Hardware',
                'course' => 'Proyek Akhir',
                'tags' => ['Arduino', 'ESP32'],
                'academic_year' => '2025/2026',
                'semester' => 'ganjil',
                'dosen' => [2],
                'students' => [
                    ['name' => 'Eka Setiawan', 'nim' => '3312302023', 'role' => 'Manager Project'],
                ],
            ],
            [
                'title' => 'AirQuality Monitor Kota Batam',
                'status' => 'published',
                'category' => 'IoT & Hardware',
                'course' => 'Teknologi Informasi Cerdas',
                'tags' => ['Arduino', 'Python', 'ESP32'],
                'academic_year' => '2024/2025',
                'semester' => 'genap',
                'dosen' => [3, 5],
                'students' => [
                    ['name' => 'Farhan Ramadhan', 'nim' => '3312302027', 'role' => 'Development Team'],
                    ['name' => 'Gita Permatasari', 'nim' => '3312302028', 'role' => 'Development Team'],
                ],
            ],
            [
                'title' => 'Deteksi Sampah Plastik dengan CNN',
                'status' => 'published',
                'category' => 'Data & AI',
                'course' => 'Deep Learning',
                'tags' => ['Python', 'TensorFlow', 'OpenCV'],
                'academic_year' => '2025/2026',
                'semester' => 'ganjil',
                'dosen' => [4],
                'students' => [
                    ['name' => 'Hilman Maulana', 'nim' => '3312302031', 'role' => 'Manager Project'],
                    ['name' => 'Indah Permata', 'nim' => '3312302032', 'role' => 'Development Team'],
                ],
            ],
            [
                'title' => 'Chatbot Layanan Akademik PCR',
                'status' => 'published',
                'category' => 'Data & AI',
                'course' => 'Teknologi Informasi Cerdas',
                'tags' => ['Python', 'TensorFlow', 'Node.js'],
                'academic_year' => '2024/2025',
                'semester' => 'ganjil',
                'dosen' => [0, 5],
                'students' => [
                    ['name' => 'Joko Susilo', 'nim' => '3312302035', 'role' => 'Development Team'],
                ],
            ],
            [
                'title' => 'Prediksi Harga Saham dengan LSTM',
                'status' => 'draft',
                'category' => 'Data & AI',
                'course' => 'Deep Learning',
                'tags' => ['Python', 'TensorFlow'],
                'academic_year' => '2025/2026',
                'semester' => 'ganjil',
                'dosen' => [6],
                'students' => [
                    ['name' => 'Kirana Salsabila', 'nim' => '3312302039', 'role' => 'Manager Project'],
                ],
            ],
            [
                'title' => 'Labirin Misteri Kampus - Game Edukasi 2D',
                'status' => 'published',
                'category' => 'Game',
                'course' => 'Project Based Learning',
                'tags' => ['Unity'],
                'academic_year' => '2024/2025',
                'semester' => 'genap',
                'dosen' => [2, 4],
                'students' => [
                    ['name' => 'Lukman Hakim', 'nim' => '3312302043', 'role' => 'Manager Project'],
                    ['name' => 'Melati Wijaya', 'nim' => '3312302044', 'role' => 'Development Team'],
                ],
            ],
            [
                'title' => 'Quiz Battle - Game Kuis Multiplayer',
                'status' => 'published',
                'category' => 'Game',
                'course' => 'Proyek Akhir',
                'tags' => ['Unity', 'Node.js'],
                'academic_year' => '2025/2026',
                'semester' => 'ganjil',
                'dosen' => [5],
                'students' => [
                    ['name' => 'Naufal Ardiansyah', 'nim' => '3312302047', 'role' => 'Development Team'],
                    ['name' => 'Olivia Rahmawati', 'nim' => '3312302048', 'role' => 'Development Team'],
                ],
            ],
            [
                'title' => 'E-Voting BEM Kampus',
                'status' => 'published',
                'category' => 'Web Application',
                'course' => 'Proyek Akhir',
                'tags' => ['Laravel', 'PostgreSQL'],
                'academic_year' => '2023/2024',
                'semester' => 'ganjil',
                'dosen' => [1],
                'students' => [
                    ['name' => 'Panji Kusuma', 'nim' => '3312302051', 'role' => 'Manager Project'],
                ],
            ],
            [
                'title' => 'Sistem Booking Ruang Kelas',
                'status' => 'archived',
                'category' => 'Web Application',
                'course' => 'Project Based Learning',
                'tags' => ['Next.js', 'PostgreSQL'],
                'academic_year' => '2023/2024',
                'semester' => 'genap',
                'dosen' => [3],
                'students' => [
                    ['name' => 'Qonita Zahra', 'nim' => '3312302055', 'role' => 'Development Team'],
                ],
            ],
            [
                'title' => 'Parkir Pintar - Sensor Parkir IoT',
                'status' => 'published',
                'category' => 'IoT & Hardware',
                'course' => 'Proyek Akhir',
                'tags' => ['Arduino', 'ESP32'],
                'academic_year' => '2024/2025',
                'semester' => 'genap',
                'dosen' => [6, 2],
                'students' => [
                    ['name' => 'Raihan Firdaus', 'nim' => '3312302059', 'role' => 'Manager Project'],
                    ['name' => 'Salsabila Putri', 'nim' => '3312302060', 'role' => 'Development Team'],
                ],
            ],
        ];

        foreach ($samples as $sample) {
            $product = Product::updateOrCreate(
                ['slug' => Str::slug($sample['title'])],
                [
                    'title' => $sample['title'],
                    'description' => 'Deskripsi contoh untuk '.$sample['title'].'. Produk ini dibuat oleh seeder sebagai data uji tampilan katalog.',
                    'category_id' => $categories->firstWhere('name', $sample['category'])->id,
                    'course_id' => $courses->firstWhere('name', $sample['course'])->id,
                    'academic_year' => $sample['academic_year'],
                    'semester' => $sample['semester'],
                    'demo_link' => 'https://example.com/demo',
                    'video_link' => 'https://youtube.com/watch?v=example',
                    'status' => $sample['status'],
                    'created_by' => $dosenPool[$sample['dosen'][0]]->id,
                    'published_at' => $sample['status'] === 'published' ? now() : null,
                ],
            );

            $pembimbing = collect($sample['dosen'])->map(fn (int $i) => $dosenPool[$i]->id)->unique()->all();
            $product->dosen()->sync($pembimbing);

            $product->tags()->sync(
                $tags->whereIn('name', $sample['tags'])->pluck('id')->all(),
            );

            $product->students()->delete();
            $product->students()->createMany($sample['students']);
        }
    }
}
