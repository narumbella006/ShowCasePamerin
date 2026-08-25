import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import PageLoading from './Components/PageLoading';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// `eager: false` (default) supaya tiap halaman jadi chunk JS terpisah —
// membuka katalog guest tidak lagi ikut mengunduh kode Dosen/Admin/Login,
// dan sebaliknya. `lazy()` + `Suspense` di bawah yang menunda render-nya
// sampai chunk-nya benar-benar sudah diunduh.
const pages = import.meta.glob('./Pages/**/*.jsx');

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => ({
        default: lazy(pages[`./Pages/${name}.jsx`]),
    }),
    setup({ el, App, props }) {
        createRoot(el).render(
            <Suspense fallback={<PageLoading />}>
                <App {...props} />
            </Suspense>,
        );
    },
    progress: {
        color: '#4f46e5',
    },
});
