import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
            fonts: [
                bunny('Instrument Sans', {
                    weights: [400, 500, 600],
                }),
            ],
        }),
        tailwindcss(),
        react(),
    ],
    resolve: {
        alias: {
            '@': '/resources/js',
        },
    },
    server: {
        // IP Wi-Fi PC di jaringan lokal — supaya HP yang konek ke Wi-Fi yang
        // sama bisa memuat aset Vite (bukan cuma 127.0.0.1 yang cuma bisa
        // diakses dari PC ini sendiri). Sesuaikan kalau IP-nya berubah
        // (cek lewat `ipconfig`, cari bagian "Wireless LAN adapter Wi-Fi").
        host: '192.168.100.66',
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
