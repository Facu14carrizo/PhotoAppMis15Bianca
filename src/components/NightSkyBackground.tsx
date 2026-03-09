
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
            {/* Luna Creciente Premium */}
            <div className="absolute top-20 right-6 md:top-28 md:right-20 animate-float opacity-100 z-0 scale-[1.5]">
                {/* Glow/Halo exterior suave */}
                <div className="absolute inset-0 rounded-full bg-white/10 blur-[60px] scale-150" />
                <div className="absolute inset-0 rounded-full bg-silver-200/5 blur-[40px] scale-125" />

                <svg width="180" height="180" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_45px_rgba(255,255,255,0.8)] filter">
                    <defs>
                        {/* Degradado metálico aperlado */}
                        <linearGradient id="moon-surface" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#FFFFFF" />
                            <stop offset="50%" stopColor="#F8FAFC" />
                            <stop offset="100%" stopColor="#E2E8F0" />
                        </linearGradient>

                        {/* Brillo interno suave */}
                        <radialGradient id="inner-glow" cx="70%" cy="35%" r="50%">
                            <stop offset="0%" stopColor="white" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="white" stopOpacity="0" />
                        </radialGradient>

                        {/* Máscara para la forma de la luna */}
                        <mask id="moon-mask">
                            <path d="M78.5 18.5C72.5 25.5 68.5 35.5 68.5 48.5C68.5 70.5914 86.4086 88.5 108.5 88.5C108.5 88.5 78.5 108.5 48.5 78.5C25.5 55.5 48.5 18.5 78.5 18.5Z" fill="white" />
                        </mask>
                    </defs>

                    {/* Forma principal de la luna */}
                    <path
                        d="M78.5 18.5C72.5 25.5 68.5 35.5 68.5 48.5C68.5 70.5914 86.4086 88.5 108.5 88.5C108.5 88.5 78.5 108.5 48.5 78.5C25.5 55.5 48.5 18.5 78.5 18.5Z"
                        fill="url(#moon-surface)"
                    />

                    {/* Brillo interno sobre la superficie */}
                    <path
                        d="M78.5 18.5C72.5 25.5 68.5 35.5 68.5 48.5C68.5 70.5914 86.4086 88.5 108.5 88.5C108.5 88.5 78.5 108.5 48.5 78.5C25.5 55.5 48.5 18.5 78.5 18.5Z"
                        fill="url(#inner-glow)"
                        style={{ mixBlendMode: 'overlay' }}
                    />

                    {/* Cráteres detallados (usando la máscara) */}
                    <g mask="url(#moon-mask)" style={{ opacity: 0.15 }}>
                        <circle cx="60" cy="50" r="4" fill="#000" />
                        <circle cx="75" cy="65" r="6" fill="#000" />
                        <circle cx="55" cy="72" r="3" fill="#000" />
                        <circle cx="45" cy="45" r="2" fill="#000" />
                    </g>
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
