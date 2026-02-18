import React, { useState, useEffect, useRef } from 'react';

// Use a binary search to find the largest font size that fits
const AutoScalableText = ({
    value,
    onChange,
    minFontSize = 12,
    maxFontSize = 200,
    className = "",
    placeholder = "Type here...",
    multiline = false
}) => {
    const [fontSize, setFontSize] = useState(maxFontSize);
    const containerRef = useRef(null);
    const hiddenRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        const hidden = hiddenRef.current;
        if (!container || !hidden) return;

        const checkFit = (size) => {
            hidden.style.fontSize = `${size}px`;
            // For multiline, we care about height mostly, but also width
            // For single line, we care about width mostly
            if (multiline) {
                return hidden.scrollHeight <= container.clientHeight && hidden.scrollWidth <= container.clientWidth;
            } else {
                return hidden.scrollWidth <= container.clientWidth && hidden.scrollHeight <= container.clientHeight;
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
    };

    // Hidden div to measure text size
    const hiddenStyle = {
        ...style,
        position: 'absolute',
        visibility: 'hidden',
        whiteSpace: multiline ? 'pre-wrap' : 'pre',
        width: containerRef.current ? containerRef.current.clientWidth : 'auto',
        height: 'auto', // Allow it to grow to measure
        maxHeight: multiline ? containerRef.current?.clientHeight : 'none',
    };

    return (
        <div ref={containerRef} className={className} style={{ position: 'relative', overflow: 'hidden' }}>
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
