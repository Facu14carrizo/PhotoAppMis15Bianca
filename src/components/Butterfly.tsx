import React from 'react';

interface ButterflyProps {
    size?: number;
    className?: string;
}

export const Butterfly: React.FC<ButterflyProps> = ({ size = 24, className = '' }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            {/* Upper Wings */}
            <path d="M12 9.5C12 5.5 8 3 5.5 3S2 5 2 8.5c0 3.5 3 5 6 5.5" />
            <path d="M12 9.5c0-4 4-6.5 6.5-6.5s3.5 2 3.5 5.5c0 3.5-3 5-6 5.5" />

            {/* Lower Wings */}
            <path d="M8 15c-3 0-5 1.5-5 4s2 4 4.5 4c2.5 0 4.5-2.5 4.5-3.5" />
            <path d="M16 15c3 0 5 1.5 5 4s-2 4-4.5 4c-2.5 0-4.5-2.5-4.5-3.5" />

            {/* Body */}
            <path d="M12 9v11" />

            {/* Antennae */}
            <path d="M9 3l3 6.5" />
            <path d="M15 3l-3 6.5" />
        </svg>
    );
};

export default Butterfly;
