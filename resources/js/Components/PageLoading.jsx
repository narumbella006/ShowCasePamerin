/**
 * Fallback yang tampil sebentar saat chunk halaman (lazy-loaded) masih
 * diunduh — cuma kejadian saat pertama kali mengunjungi suatu halaman,
 * navigasi berikutnya ke halaman yang sama sudah di-cache browser.
 */
export default function PageLoading() {
    return (
        <div className="grid min-h-screen place-items-center bg-neutral-50">
            <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-pcr-200 border-t-pcr-600" />
                <p className="text-xs font-medium tracking-wide text-neutral-400 uppercase">Memuat…</p>
            </div>
        </div>
    );
}
