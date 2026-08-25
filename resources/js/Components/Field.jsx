export const inputClass =
    'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm sm:py-2 text-neutral-900 shadow-sm outline-none placeholder:text-neutral-400 focus:border-pcr-600 focus:ring-1 focus:ring-pcr-600 disabled:bg-neutral-100';

export default function Field({ label, error, required, hint, children }) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-800">
                {label}
                {required && <span className="ml-0.5 text-pcrred-500">*</span>}
            </label>
            {children}
            {hint && !error && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
            {error && <p className="mt-1 text-xs text-pcrred-600">{error}</p>}
        </div>
    );
}
