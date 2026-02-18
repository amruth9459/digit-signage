import React, { useState, useEffect } from 'react';

const MediaLibrary = ({ onSelect, selectionMode = false }) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMedia();
    }, []);

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/media');
            const data = await res.json();
            setImages(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e, filename) => {
        e.stopPropagation();
        if (!confirm(`Delete ${filename}? This cannot be undone.`)) return;

        // We need an endpoint for this, assuming /api/media/delete for now or similar
        // Actually we don't have a delete endpoint yet in index.js, I should add that.
        // For now, let's just alert.
        alert("Delete functionality requires backend update.");
    };

    if (loading) return <div style={{ color: '#666', padding: '20px' }}>Loading Media...</div>;

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '20px' }}>
                {images.map((img, i) => (
                    <div
                        key={i}
                        onClick={() => onSelect && onSelect(img.url)}
                        style={{
                            position: 'relative',
                            aspectRatio: '1',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: '1px solid #333',
                            cursor: selectionMode ? 'pointer' : 'default',
                            transition: 'transform 0.2s',
                            group: 'card' // psuedo
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = '#666'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = '#333'}
                    >
                        <img
                            src={img.url}
                            alt={img.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />

                        {/* Overlay with Info */}
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: 'rgba(0,0,0,0.7)',
                            padding: '8px',
                            fontSize: '11px',
                            color: '#ccc',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {img.name}
                        </div>
                    </div>
                ))}
            </div>
            {images.length === 0 && (
                <div style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
                    No media files found. Upload some in the Editor!
                </div>
            )}
        </div>
    );
};

export default MediaLibrary;
