import React, { useState, useEffect } from 'react';

const ImageCarousel = ({
    promos = [],
    interval = 5000,
    placeholder = true,
    badgeTextColor = '#FBF5B7',
    badgeBorderColor = '#BF953F',
    badgeBgColor = 'rgba(0,0,0,0.6)',
    titleColor = '#FFFFFF',
    gradientOverlay = 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)'
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (promos.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % promos.length);
        }, interval);

        return () => clearInterval(timer);
    }, [promos.length, interval]);

    if (promos.length === 0) {
        if (placeholder) {
            return (
                <div style={{ width: '100%', height: '100%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                    Product Image Area
                </div>
            );
        }
        return null;
    }

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', backgroundColor: 'transparent' }}>
            {promos.map((promo, index) => (
                <div
                    key={index}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: index === currentIndex ? 1 : 0,
                        transition: 'opacity 1.5s ease-in-out',
                        pointerEvents: 'none' // Click through to whatever is behind if needed
                    }}
                >
                    {/* Image Layer */}
                    <div style={{
                        width: '100%',
                        height: '100%',
                        backgroundImage: `url(${promo.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center center', // Reset to Center for Wide Shots
                    }} />

                    {/* Gradient Protection for Text - Top Down */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '50%',
                        background: gradientOverlay
                    }} />

                    {/* Promo Text Overlay - Top Left Safe Zone */}
                    <div style={{
                        position: 'absolute',
                        top: '40px',
                        left: '40px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '5px'
                    }}>
                        {/* Golden Badge / Offer */}
                        <span style={{
                            fontFamily: 'Josefin Sans',
                            fontSize: '24px',
                            fontWeight: 700,
                            letterSpacing: '2px',
                            color: badgeTextColor,
                            textTransform: 'uppercase',
                            background: badgeBgColor,
                            padding: '4px 12px',
                            borderRadius: '4px',
                            border: `1px solid ${badgeBorderColor}`
                        }}>
                            {promo.offer}
                        </span>

                        {/* Title */}
                        <span style={{
                            fontFamily: 'Tenor Sans',
                            fontSize: '42px',
                            color: titleColor,
                            textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                        }}>
                            {promo.title}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ImageCarousel;
