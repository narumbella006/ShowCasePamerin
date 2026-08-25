import logoUnggul from '@/img/Logo Unggul (1).png';
import logoUtama from '@/img/Logo Utama (1).png';
import logoPsti from '@/img/LogoPSTI.png';

/**
 * Logo kampus mengikuti aturan struktur emblem akreditasi:
 *   1. Emblem akreditasi ditempatkan di kiri logo utama.
 *   2. Jarak antara emblem dan logo utama 1 px — di sini dipakai 2 px
 *      atas permintaan, karena 1 px terlihat terlalu berdempet di layar.
 *   3. Tinggi emblem mengikuti tinggi logo utama, lebar menyesuaikan.
 *
 * `height` adalah tinggi logo utama (wordmark) dalam px; tinggi emblem
 * diturunkan dari situ lewat EMBLEM_RATIO supaya proporsinya tetap sama
 * di ukuran berapa pun.
 */
const EMBLEM_RATIO = 1.5;
const PSTI_RATIO = 1.8;
const GAP_PX = 2;

export default function Logo({ height = 20, className = '' }) {
    return (
        <span className={`inline-flex items-center ${className}`} style={{ gap: GAP_PX }}>
            <img
                src={logoUnggul}
                alt="Akreditasi Unggul BAN-PT"
                className="w-auto shrink-0"
                style={{ height: height * EMBLEM_RATIO }}
            />
            <img
                src={logoUtama}
                alt="Politeknik Caltex Riau"
                className="w-auto shrink-0"
                style={{ height }}
            />
            <img
                src={logoPsti}
                alt="PSTI"
                className="w-auto shrink-0"
                style={{ height: height * PSTI_RATIO }}
            />
        </span>
    );
}
