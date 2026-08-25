/**
 * Foto profil dosen. Kalau belum ada fotonya, tampilkan inisial namanya
 * supaya tidak ada kotak kosong.
 */
export default function Avatar({ user, size = 40, className = '' }) {
    const style = { width: size, height: size };

    if (user?.avatar_url) {
        return (
            <img
                src={user.avatar_url}
                alt={`Foto ${user.name}`}
                style={style}
                className={`shrink-0 rounded-full border border-pcr-100 object-cover ${className}`}
            />
        );
    }

    return (
        <span
            style={{ ...style, fontSize: Math.round(size * 0.38) }}
            className={`grid shrink-0 place-items-center rounded-full bg-pcr-600 font-semibold text-white ${className}`}
            aria-hidden="true"
        >
            {user?.initials ?? '?'}
        </span>
    );
}
