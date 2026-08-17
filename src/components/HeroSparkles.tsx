import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

/**
 * Decorative sparkle overlay for the hero section.
 *
 * The animation JSON (~65kB) is fetched from /public at runtime rather than
 * bundled, and is skipped entirely when the user prefers reduced motion.
 * Failures are silent because the overlay is purely cosmetic.
 */
export default function HeroSparkles() {
    const [animationData, setAnimationData] = useState<unknown>(null);

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        let cancelled = false;
        fetch('/sparkles.json')
            .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
            .then((data) => {
                if (!cancelled) setAnimationData(data);
            })
            .catch(() => {
                /* decorative only — safe to render nothing */
            });

        return () => {
            cancelled = true;
        };
    }, []);

    if (!animationData) return null;

    return (
        <Lottie
            animationData={animationData}
            loop
            className="w-[150%] h-[150%] max-w-none opacity-60"
        />
    );
}
