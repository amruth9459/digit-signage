import React from 'react';

const PreviewFrame = ({ projectId }) => {
    // We pass projectId to the iframe URL so the player knows what to load
    const src = `/?project=${projectId || 'default'}`;

    return (
        <div style={{
            width: '100%',
            height: '100%',
            background: '#000',
            borderRadius: '16px',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}>
            {/* 
                The iframe loads the main app. 
                Since the app is reactive to config.json, updates might lag slightly 
                unless we force refresh or use window.postMessage (advanced).
                For now, we rely on the app's auto-fetch interval or manual refresh if needed.
                Actually, the app fetches ONLY on mount. 
                We might need to trigger a reload or simply reload the iframe.
            */}
            <iframe
                id="preview-frame"
                src="http://localhost:3000/"
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    transformOrigin: 'top left'
                }}
                title="Live Preview"
            />

            <div style={{ position: 'absolute', bottom: '10px', right: '10px', zIndex: 100 }}>
                <button
                    onClick={() => document.getElementById('preview-frame').contentWindow.location.reload()}
                    style={{
                        padding: '8px 12px',
                        background: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '20px',
                        fontSize: '12px',
                        cursor: 'pointer'
                    }}
                >
                    ↻ Refresh Preview
                </button>
            </div>
        </div>
    );
};

export default PreviewFrame;
