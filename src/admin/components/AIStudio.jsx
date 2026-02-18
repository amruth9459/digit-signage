import React, { useState } from 'react';
// import { FaMagic, FaPalette, FaImage, FaPenFancy, FaRobot } from 'react-icons/fa';

const AIStudio = ({ onUpdateTheme, onInsertImage, onUpdateCopy }) => {
    const [activeTab, setActiveTab] = useState('theme');
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [generatedImage, setGeneratedImage] = useState(null);

    // AI Handlers
    const handleGenerateTheme = async () => {
        if (!prompt) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/ai/theme?prompt=${encodeURIComponent(prompt)}`);
            const theme = await res.json();
            onUpdateTheme(theme);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateImage = async () => {
        if (!prompt) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/ai/image?prompt=${encodeURIComponent(prompt)}`);
            const data = await res.json();
            setGeneratedImage(data.url); // Use the URL returned by the backend
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateCopy = async () => {
        if (!prompt) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/ai/copy?product=${encodeURIComponent(prompt)}`);
            const copy = await res.json();
            // Pass the copy up to the parent to handle (e.g. fill a form)
            if (onUpdateCopy) onUpdateCopy(copy);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // UI Renderers
    return (
        <div style={{
            background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '30px',
            border: '1px solid #0f3460',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <span style={{ fontSize: '24px' }}>🤖</span>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '18px', fontWeight: 700, letterSpacing: '1px' }}>AI STUDIO <span style={{ fontSize: '10px', background: '#e94560', padding: '2px 6px', borderRadius: '4px', verticalAlign: 'middle' }}>BETA</span></h3>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <TabButton active={activeTab === 'theme'} onClick={() => setActiveTab('theme')} icon="🎨" label="Magic Theme" />
                <TabButton active={activeTab === 'image'} onClick={() => setActiveTab('image')} icon="🖼️" label="Image Gen" />
                <TabButton active={activeTab === 'copy'} onClick={() => setActiveTab('copy')} icon="✨" label="Smart Copy" />
            </div>

            {/* Content Area */}
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '8px' }}>

                {/* Theme Generator */}
                {activeTab === 'theme' && (
                    <div>
                        <p style={{ color: '#ccc', fontSize: '13px', marginBottom: '10px' }}>Describe a mood (e.g., "Cyberpunk Neon", "Calm Ocean", "Sunset Luxury")</p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Enter mood keywords..."
                                style={inputStyle}
                            />
                            <button onClick={handleGenerateTheme} disabled={loading} style={aiBtnStyle}>
                                {loading ? 'Dreaming...' : 'Generate Theme'} ✨
                            </button>
                        </div>
                    </div>
                )}

                {/* Image Generator */}
                {activeTab === 'image' && (
                    <div>
                        <p style={{ color: '#ccc', fontSize: '13px', marginBottom: '10px' }}>Describe the product image you want to create.</p>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                            <input
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="E.g., Bottle of olive oil on a wooden table, cinematic lighting..."
                                style={inputStyle}
                            />
                            <button onClick={handleGenerateImage} disabled={loading} style={aiBtnStyle}>
                                {loading ? 'Painting...' : 'Create Art'} 🎨
                            </button>
                        </div>
                        {generatedImage && (
                            <div style={{ textAlign: 'center' }}>
                                <img src={generatedImage} alt="AI Generated" style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid #333' }} />
                                <div style={{ marginTop: '10px', fontSize: '12px', color: '#888' }}>
                                    Disclaimer: Simulated Generation (Placeholder Service)
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Copy Generator */}
                {activeTab === 'copy' && (
                    <div>
                        <p style={{ color: '#ccc', fontSize: '13px', marginBottom: '10px' }}>Enter a product name to generate marketing copy.</p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="E.g., Truffle Oil"
                                style={inputStyle}
                            />
                            <button onClick={handleGenerateCopy} disabled={loading} style={aiBtnStyle}>
                                {loading ? 'Writing...' : 'Remix Copy'} ✒️
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

// Styles & Subcomponents
const TabButton = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        style={{
            flex: 1,
            padding: '10px',
            background: active ? '#e94560' : 'transparent',
            border: active ? 'none' : '1px solid #333',
            color: active ? '#fff' : '#888',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            fontSize: '13px',
            fontWeight: 600
        }}
    >
        {icon} {label}
    </button>
);

const inputStyle = {
    flex: 1,
    padding: '12px',
    background: '#0f182b',
    border: '1px solid #333',
    borderRadius: '6px',
    color: '#fff',
    outline: 'none',
    fontSize: '14px'
};

const aiBtnStyle = {
    padding: '0 20px',
    background: 'linear-gradient(45deg, #e94560, #ff2e63)',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    whiteSpace: 'nowrap'
};

export default AIStudio;
