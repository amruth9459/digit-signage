import React, { useState, useEffect, useRef, useCallback } from 'react';

// Use a binary search to find the largest font size that fits
const AutoScalableText = ({
    value,
    onChange,
    minFontSize = 12,
    maxFontSize = 200,
    className = "",
    placeholder = "Type here...",
    multiline = false,
    style: externalStyle = {}
}) => {
    const [fontSize, setFontSize] = useState(minFontSize);
    const containerRef = useRef(null);
    const hiddenRef = useRef(null);

    const recalc = useCallback(() => {
        const container = containerRef.current;
        const hidden = hiddenRef.current;
        if (!container || !hidden) return;

        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        if (containerWidth === 0 || containerHeight === 0) return;

        // Set hidden div to match container width for measurement
        hidden.style.width = `${containerWidth}px`;

        const checkFit = (size) => {
            hidden.style.fontSize = `${size}px`;
            if (multiline) {
                return hidden.scrollHeight <= containerHeight && hidden.scrollWidth <= containerWidth;
            } else {
                return hidden.scrollWidth <= containerWidth && hidden.scrollHeight <= containerHeight;
            }
        };

        let low = minFontSize;
        let high = maxFontSize;
        let best = minFontSize;

        // Binary search
        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            if (checkFit(mid)) {
                best = mid;
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }

        setFontSize(best);
    }, [value, minFontSize, maxFontSize, multiline]);

    useEffect(() => {
        recalc();
    }, [recalc]);

    // Re-measure when the window resizes (critical for vh/vw containers)
    useEffect(() => {
        window.addEventListener('resize', recalc);
        return () => window.removeEventListener('resize', recalc);
    }, [recalc]);

    // Also use ResizeObserver on the container itself
    useEffect(() => {
        const container = containerRef.current;
        if (!container || typeof ResizeObserver === 'undefined') return;
        const ro = new ResizeObserver(() => recalc());
        ro.observe(container);
        return () => ro.disconnect();
    }, [recalc]);

    const style = {
        fontSize: `${fontSize}px`,
        width: '100%',
        height: '100%',
        background: 'transparent',
        border: 'none',
        outline: 'none',
        resize: 'none',
        overflow: 'hidden',
        textAlign: 'center', // Default to center, can be overridden by className
        fontFamily: 'inherit',
        color: 'inherit',
        padding: 0,
        margin: 0,
        lineHeight: multiline ? 1.2 : 1,
        ...externalStyle,
    };

    // Hidden div to measure text size
    const hiddenStyle = {
        ...style,
        position: 'absolute',
        visibility: 'hidden',
        whiteSpace: multiline ? 'pre-wrap' : 'pre',
        height: 'auto',
        maxHeight: 'none',
        top: 0,
        left: 0,
        pointerEvents: 'none',
    };

    return (
        <div ref={containerRef} className={className} style={{ position: 'relative', overflow: 'hidden', width: '100%', height: '100%' }}>
            <div ref={hiddenRef} style={hiddenStyle}>
                {value || placeholder}
            </div>

            {multiline ? (
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={style}
                    placeholder={placeholder}
                />
            ) : (
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={style}
                    placeholder={placeholder}
                />
            )}
        </div>
    );
};

export default AutoScalableText;
