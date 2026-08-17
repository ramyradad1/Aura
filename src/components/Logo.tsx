interface LogoProps {
    /** Render for a dark (navy) background instead of the light ivory surface. */
    onDark?: boolean;
    /** Hide the "AURA" wordmark and show the monogram only. */
    markOnly?: boolean;
    className?: string;
}

/**
 * Aura brand lockup: a gold monogram inside a navy rounded square,
 * followed by the serif wordmark. Uses currentColor-free explicit
 * brand colours so it stays on-identity in both light and dark contexts.
 */
export default function Logo({ onDark = false, markOnly = false, className = '' }: LogoProps) {
    return (
        <span className={`inline-flex items-center gap-2.5 ${className}`}>
            <svg
                viewBox="0 0 64 64"
                className="w-8 h-8 sm:w-9 sm:h-9 shrink-0"
                aria-hidden="true"
                focusable="false"
            >
                <defs>
                    <linearGradient id="aura-logo-gold" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#E3C77B" />
                        <stop offset="45%" stopColor="#C9A227" />
                        <stop offset="100%" stopColor="#8A6D1F" />
                    </linearGradient>
                </defs>
                <rect width="64" height="64" rx="14" fill="#0E1C3A" />
                <circle
                    cx="32"
                    cy="32"
                    r="25"
                    fill="none"
                    stroke="url(#aura-logo-gold)"
                    strokeWidth="1"
                    opacity="0.45"
                />
                <path
                    d="M32 15 L45 47 H38.6 L35.6 39.2 H28.4 L25.4 47 H19 Z M32 25.6 L29.9 33.6 H34.1 Z"
                    fill="url(#aura-logo-gold)"
                />
            </svg>

            {!markOnly && (
                <span className="flex flex-col leading-none">
                    <span
                        className={`font-serif text-2xl sm:text-[28px] tracking-[0.22em] ${onDark ? 'text-gold-300' : 'text-primary'
                            }`}
                    >
                        AURA
                    </span>
                    <span
                        className={`text-[8px] tracking-[0.42em] uppercase mt-0.5 ${onDark ? 'text-gold-300/60' : 'text-primary/45'
                            }`}
                    >
                        Perfumes
                    </span>
                </span>
            )}
        </span>
    );
}
