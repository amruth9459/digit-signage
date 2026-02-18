import React, { useState } from 'react';

const ScrollingList = ({
    items = [],
    onChange,
    className = "",
    itemStyle = {},
    borderColor = null
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState("");

    // Parse items
    const listItems = Array.isArray(items)
        ? items
            .filter(item => typeof item === 'object' ? (item.visible !== false) : true) // Filter hidden objects
            .map(item => typeof item === 'object' ? item.text : item) // Extract text from objects
        : typeof items === 'string'
            ? items.split('\n').filter(i => i.trim() !== '')
            : [];

    const handleStartEdit = () => {
        setEditValue(listItems.join('\n'));
        setIsEditing(true);
    };

    const handleStopEdit = () => {
        setIsEditing(false);
        if (onChange) {
            onChange(editValue);
        }
    };

    const handleChange = (e) => {
        setEditValue(e.target.value);
    };

    if (isEditing) {
        return (
            <div style={{ width: '100%', height: '100%', position: 'relative', zIndex: 50 }}>
                <textarea
                    value={editValue}
                    onChange={handleChange}
                    onBlur={handleStopEdit}
                    autoFocus
                    style={{
                        width: '100%',
                        height: '100%',
                        background: 'rgba(255,255,255,0.95)',
                        border: '1px solid #ccc',
                        color: '#333',
                        fontSize: '24px',
                        padding: '20px',
                        fontFamily: 'inherit',
                        resize: 'none',
                        outline: 'none',
                        whiteSpace: 'pre-wrap'
                    }}
                />
            </div>
        );
    }

    return (
        <div
            className={className}
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                // overflow: 'hidden' // Removed to allow content to dictate height of border if needed, 
                // but usually we want to contain it. 
                // Actually for "adaptive hairline", we want the border to follow the content.
                // The container is fixed height (flex 1 in parent).
                // We'll put the border on the inner div.
            }}
            onClick={handleStartEdit}
        >
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                height: 'auto', // content-fit
                position: 'relative',
                paddingLeft: '20px'
            }}>
                {/* Adaptive Fading Hairline */}
                {borderColor && (
                    <div style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '1px',
                        background: `linear-gradient(to bottom, ${borderColor} 0%, rgba(255, 255, 255, 0) 100%)`
                    }} />
                )}

                {listItems.map((item, index) => (
                    <div
                        key={index}
                        style={{
                            ...itemStyle,
                            marginBottom: '0.6em',
                            lineHeight: '1.2'
                        }}
                    >
                        {item}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ScrollingList;
