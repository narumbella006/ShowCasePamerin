import { useEffect, useRef, useState } from 'react';

/**
 * Bungkus section dengan ini supaya fade-up muncul begitu section-nya
 * masuk viewport pas di-scroll — bukan sekali barengan pas halaman dimuat.
 * Cuma main sekali per section (unobserve setelah kelihatan), biar nggak
 * mengganggu kalau user scroll naik-turun berulang.
 */
export default function Reveal({ children, delay = '', className = '', as: Tag = 'div', ...rest }) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node) return undefined;

        if (typeof IntersectionObserver === 'undefined') {
            setVisible(true);
            return undefined;
        }

        // Threshold kecil + rootMargin longgar dengan sengaja — supaya animasi
        // gampang kepicu begitu sedikit aja bagian elemennya masuk layar.
        // Sebelumnya threshold 0.15 + rootMargin -80px kadang nggak pernah
        // kepicu di HP (viewport pendek + address bar yang naik-turun bikin
        // ukuran viewport berubah-ubah saat scroll), akibatnya section jadi
        // "hilang" (nyangkut di opacity-0) selamanya.
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.unobserve(node);
                }
            },
            { threshold: 0, rootMargin: '0px 0px 100px 0px' }
        );

        observer.observe(node);

        // Jaring pengaman: kalau karena sesuatu hal observer-nya nggak
        // pernah kepicu (bug browser, layout aneh, dll), paksa muncul
        // setelah 2.5 detik daripada kontennya nyangkut transparan terus.
        const fallback = setTimeout(() => setVisible(true), 2500);

        return () => {
            observer.disconnect();
            clearTimeout(fallback);
        };
    }, []);

    return (
        <Tag
            ref={ref}
            className={`transition-all duration-700 ease-out ${delay} ${
                visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            } ${className}`}
            {...rest}
        >
            {children}
        </Tag>
    );
}
