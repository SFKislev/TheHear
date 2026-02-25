export default function TranslatedLabel({ locale, active, className }) {
    if (!active) return null
    return (
        <div className={`absolute top-0 ${locale === 'heb' ? 'left-0' : 'right-0'} bg-neutral-100 text-xs text-gray-500 p-2 rounded-bl-md z-[1] ${className}`}>
            {locale === 'heb' ? 'מתורגם' : 'translated'}
        </div>
    );
}