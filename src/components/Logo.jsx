import React from 'react';

const Logo = ({
    width = "100%",
    height = "100%",
    className = "",
    gradientStart = "#1B4D3E",
    gradientEnd = "#2E8B57",
    dropShadow = "rgba(27, 77, 62, 0.6)"
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            style={{
                display: 'block',
                // Outer glow for extra dimension on black background
                filter: `drop-shadow(0px 0px 10px ${dropShadow})`
            }}
        >
            <defs>
                {/* 
                   Dynamic Gradient
                   Diagonal sweep for "Polished" look
                */}
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={gradientStart} />
                    <stop offset="100%" stopColor={gradientEnd} />
                </linearGradient>

                {/* Inner Bevel/Shadow for 3D feel within the stroke */}
                <filter id="innerDepth">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur" />
                    <feOffset dx="1" dy="1" result="offsetBlur" />
                    <feComposite in="offsetBlur" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff" />
                    <feFlood floodColor="black" floodOpacity="0.2" />
                    <feComposite in2="shadowDiff" operator="in" />
                    <feComposite in2="SourceGraphic" operator="over" />
                </filter>
            </defs>

            {/* 
                Arch Shape (Vector Recreation)
                M 20 90: Start Bottom Left
                L 20 40: Line Up to start of curve
                A 30 30 0 0 1 80 40: Semi-circle Arc to Right (Radius 30)
                L 80 90: Line Down to Bottom Right
            */}
            <path
                d="M 20 90 L 20 45 A 30 30 0 0 1 80 45 L 80 90"
                stroke="url(#logoGradient)"
                strokeWidth="18"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            // Optional: Apply inner depth filter if desired, but gradient might be enough
            // filter="url(#innerDepth)" 
            />
        </svg>
    );
};

export default Logo;
