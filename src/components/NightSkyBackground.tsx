
// Estrellas generadas estáticamente para evitar re-renderizados costosos
const generateStars = (count: number) => {
    return Array.from({ length: count }, () => ({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: Math.random() < 0.2 ? Math.random() * 3 + 3 : Math.random() * 2 + 1, // Tamaño más grande en general
        type: Math.random() < 0.15 ? 'sparkle' : 'dot', // 15% son estrellas brillantes (cruz)
        animationDuration: `${Math.random() * 3 + 2}s`, // Duración entre 2s y 5s
        animationDelay: `${Math.random() * 5}s`,
        opacity: Math.random() * 0.6 + 0.4, // Más opacidad mínima
        glow: Math.random() < 0.4 // 40% tienen un brillo extra fuerte
    }));
};

const stars = generateStars(200); // Aumentamos a 200 estrellas

export default function NightSkyBackground() {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden bg-gradient-to-b from-[#050510] via-[#0a0a20] to-[#000000] pointer-events-none">
            {/* Luna Creciente */}
            <div className="absolute top-20 right-6 md:top-28 md:right-20 animate-float opacity-100 z-0 scale-[1.5]">
                <svg width="180" height="180" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_50px_rgba(255,255,255,0.9)]">
                    <path
                        d="M78.5 18.5C72.5 25.5 68.5 35.5 68.5 48.5C68.5 70.5914 86.4086 88.5 108.5 88.5C108.5 88.5 78.5 108.5 48.5 78.5C25.5 55.5 48.5 18.5 78.5 18.5Z"
                        fill="#F2F2F2"
                        stroke="none"
                    />
                    {/* Brillo interno */}
                    <path
                        d="M78.5 18.5C72.5 25.5 68.5 35.5 68.5 48.5C68.5 70.5914 86.4086 88.5 108.5 88.5C108.5 88.5 78.5 108.5 48.5 78.5C25.5 55.5 48.5 18.5 78.5 18.5Z"
                        fill="url(#moon-gradient)"
                        fillOpacity="0.3"
                        stroke="none"
                    />
                    <defs>
                        <radialGradient id="moon-gradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(68.5 48.5) rotate(90) scale(40)">
                            <stop stopColor="white" stopOpacity="0.8" />
                            <stop offset="1" stopColor="#E5E7EB" stopOpacity="0.2" />
                        </radialGradient>
                    </defs>

                    {/* Cráteres sutiles restaurados para detalle */}
                    <circle cx="60" cy="50" r="3" fill="rgba(0,0,0,0.15)" />
                    <circle cx="70" cy="65" r="5" fill="rgba(0,0,0,0.15)" />
                    <circle cx="55" cy="70" r="2" fill="rgba(0,0,0,0.15)" />
                </svg>
            </div>

            {/* Estrellas */}
            {stars.map((star, i) => (
                <div
                    key={i}
                    className={`absolute text-white ${i % 3 === 0 ? 'animate-twinkle' : 'animate-pulse'}`}
                    style={{
                        top: star.top,
                        left: star.left,
                        animationDuration: star.animationDuration,
                        animationDelay: star.animationDelay,
                        opacity: star.opacity,
                    }}
                >
                    {star.type === 'sparkle' ? (
                        /* Estrella tipo diamante/resplandor */
                        <svg
                            width={star.size * 4}
                            height={star.size * 4}
                            viewBox="0 0 24 24"
                            fill="white"
                            style={{ filter: 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.8))' }}
                        >
                            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
                        </svg>
                    ) : (
                        /* Estrella circular brillante */
                        <div
                            className="rounded-full bg-white"
                            style={{
                                width: `${star.size}px`,
                                height: `${star.size}px`,
                                boxShadow: star.glow ? `0 0 ${star.size * 3}px 1px rgba(255, 255, 255, 0.8)` : 'none'
                            }}
                        />
                    )}
                </div>
            ))}

            {/* Capa de ruido sutil para textura */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
            />
        </div>
    );
}
