import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ThemeSelector from './components/ThemeSelector';
import ListEditor from './components/ListEditor';
import ToastContainer from './components/ToastContainer';
import PreviewFrame from './components/PreviewFrame';
import AIStudio from './components/AIStudio';
import MediaLibrary from './components/MediaLibrary';

const AdminDashboard = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [config, setConfig] = useState(null);
    const [promotions, setPromotions] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [toasts, setToasts] = useState([]);
    const [activeTab, setActiveTab] = useState('editor'); // editor, media, settings, scheduling
    const [uploading, setUploading] = useState(false);
    const [showMediaPicker, setShowMediaPicker] = useState(false);

    // New Promo State
    const [newPromoTitle, setNewPromoTitle] = useState('');
    const [newPromoOffer, setNewPromoOffer] = useState('');
    const [newPromoImage, setNewPromoImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        if (projectId) fetchData();
    }, [projectId]);

    const [projectsList, setProjectsList] = useState([]);

    useEffect(() => {
        if (projectId) {
            fetchData();
            fetchProjectsList();
        }
    }, [projectId]);

    const fetchProjectsList = async () => {
        try {
            const res = await fetch('/api/projects');
            const data = await res.json();
            setProjectsList(data);
        } catch (err) {
            console.error("Failed to load projects list");
        }
    };

    const fetchData = async () => {
        try {
            const configRes = await fetch(`/api/config?project=${projectId}`);
            const configData = await configRes.json();
            setConfig(configData);

            const promoRes = await fetch(`/api/promotions?project=${projectId}`);
            const promoData = await promoRes.json();
            setPromotions(promoData);

            const scheduleRes = await fetch(`/api/schedule?project=${projectId}`);
            const scheduleData = await scheduleRes.json();
            setSchedules(scheduleData);
        } catch (err) {
            console.error(err);
            addToast('Error loading data.', 'error');
        }
    };

    const addToast = (message, type = 'success', duration = 3000) => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message, type, duration }]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const handleConfigChange = (key, value) => {
        const newConfig = { ...config, [key]: value };
        setConfig(newConfig);
        // Live Preview: Send message to iframe
        const iframe = document.getElementById('preview-frame');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({ type: 'PREVIEW_UPDATE', config: newConfig }, '*');
        }
    };

    const saveConfig = async () => {
        try {
            await fetch(`/api/config?project=${projectId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            addToast('Configuration Saved!');
            // Re-sync iframe to be sure, although postMessage handles visual
            const iframe = document.getElementById('preview-frame');
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage({ type: 'PREVIEW_UPDATE', config: config }, '*');
            }
        } catch (err) {
            addToast('Error saving config.', 'error');
        }
    };

    // --- Media Library Handler ---
    const handleMediaSelect = (url) => {
        setPreviewImage(url);
        setNewPromoImage(null);
        setShowMediaPicker(false);
        addToast("Image selected from Library");
    };

    // --- Scheduling Handlers ---
    const saveSchedules = async (updatedSchedules) => {
        setSchedules(updatedSchedules);
        try {
            await fetch(`/api/schedule?project=${projectId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedSchedules)
            });
        } catch (err) {
            addToast('Error saving schedules', 'error');
        }
    };

    const toggleSchedule = (index) => {
        const updated = [...schedules];
        updated[index].active = !updated[index].active;
        saveSchedules(updated);
        addToast(`Schedule ${updated[index].active ? 'Enabled' : 'Disabled'}`);
    };

    const addSchedule = () => {
        const newSchedule = {
            id: Date.now().toString(),
            name: "New Schedule",
            startTime: "09:00",
            endTime: "17:00",
            configOverrides: { theme: "light_luxury" },
            active: false
        };
        const updated = [...schedules, newSchedule];
        saveSchedules(updated);
        addToast("New Schedule Added");
    };

    const updateSchedule = (index, field, value) => {
        const updated = [...schedules];
        updated[index] = { ...updated[index], [field]: value };
        saveSchedules(updated);
    };

    const updateScheduleOverride = (index, field, value) => {
        const updated = [...schedules];
        updated[index].configOverrides = { ...updated[index].configOverrides, [field]: value };
        saveSchedules(updated);
    };

    const deleteSchedule = (index) => {
        if (!confirm("Are you sure you want to delete this schedule?")) return;
        const updated = schedules.filter((_, i) => i !== index);
        saveSchedules(updated);
        addToast("Schedule Deleted");
    };

    // --- AI Handlers ---
    const handleAITheme = (newTheme) => {
        addToast('AI Theme Generated! (Preview Only)', 'success');
        console.log("AI Generated Theme:", newTheme);
    };

    const handleAICopy = (copy) => {
        setNewPromoTitle(copy.title);
        setNewPromoOffer(copy.offer);
        addToast('AI Copy Applied!');
    };

    const handleAIImageUpdate = (url) => {
        setPreviewImage(url);
        setNewPromoImage(null);
        addToast('AI Image ready to add!');
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setNewPromoImage(file);
        setPreviewImage(URL.createObjectURL(file));
    };

    const addPromotion = async () => {
        if ((!newPromoImage && !previewImage) || !newPromoTitle || !newPromoOffer) {
            alert("Please fill in all fields and provide an image.");
            return;
        }

        setUploading(true);
        try {
            let imagePath = '';
            if (newPromoImage) {
                const formData = new FormData();
                formData.append('image', newPromoImage);
                const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
                const uploadData = await uploadRes.json();
                if (!uploadData.success) throw new Error('Upload failed');
                imagePath = uploadData.filePath;
            } else if (previewImage) {
                imagePath = previewImage;
            }

            const newPromo = {
                image: imagePath,
                title: newPromoTitle,
                offer: newPromoOffer
            };

            const updatedPromos = [...promotions, newPromo];
            setPromotions(updatedPromos);

            await fetch(`/api/promotions?project=${projectId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedPromos)
            });

            setNewPromoTitle('');
            setNewPromoOffer('');
            setNewPromoImage(null);
            setPreviewImage(null);
            addToast('Promotion Added!');

            const iframe = document.getElementById('preview-frame');
            if (iframe) iframe.contentWindow.location.reload();

        } catch (err) {
            console.error(err);
            addToast('Error adding promotion.', 'error');
        } finally {
            setUploading(false);
        }
    };

    const deletePromotion = async (index) => {
        if (!confirm('Delete this promotion?')) return;
        const updatedPromos = promotions.filter((_, i) => i !== index);
        setPromotions(updatedPromos);
        try {
            await fetch(`/api/promotions?project=${projectId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedPromos)
            });
            addToast('Promotion Deleted!');
            const iframe = document.getElementById('preview-frame');
            if (iframe) iframe.contentWindow.location.reload();
        } catch (err) {
            addToast('Error deleting promotion.', 'error');
        }
    };

    if (!config) return <div style={{ color: '#fff', padding: 20, background: '#111', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Project...</div>;

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#050505', fontFamily: "'Inter', sans-serif", color: '#eee', overflow: 'hidden' }}>

            {/* SIDEBAR */}
            <div style={{
                width: '260px',
                backgroundColor: 'rgba(15, 15, 15, 0.95)',
                borderRight: '1px solid #222',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px'
            }}>
                <div
                    onClick={() => navigate('/admin')}
                    style={{
                        fontSize: '24px',
                        fontWeight: 700,
                        fontFamily: "'Outfit', sans-serif",
                        marginBottom: '40px',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        letterSpacing: '-0.5px'
                    }}
                >
                    <span style={{
                        width: '32px', height: '32px', background: 'linear-gradient(135deg, #fff, #888)',
                        borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#000', fontSize: '18px'
                    }}>✦</span>
                    CMS Hub
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <SidebarItem icon="📝" label="Content Editor" active={activeTab === 'editor'} onClick={() => setActiveTab('editor')} />
                    <SidebarItem icon="🎨" label="Media Library" active={activeTab === 'media'} onClick={() => setActiveTab('media')} />
                    <SidebarItem icon="🕒" label="Scheduling" active={activeTab === 'scheduling'} onClick={() => setActiveTab('scheduling')} />
                    <SidebarItem icon="⚙️" label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                </div>

                <div style={{ marginTop: 'auto', padding: '20px', background: '#111', borderRadius: '12px', border: '1px solid #222' }}>
                    <div style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: 600 }}>Current Project</div>
                    <div style={{ fontWeight: 600, color: '#fff', marginTop: '6px', fontSize: '15px' }}>{projectId}</div>
                    <div style={{ fontSize: '12px', color: '#4caf50', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '6px', height: '6px', background: '#4caf50', borderRadius: '50%' }}></span> Online
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', background: 'radial-gradient(circle at top right, #1a1a1a 0%, #050505 40%)' }}>

                {/* TOP BAR */}
                <div style={{
                    height: '70px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 40px',
                    backdropFilter: 'blur(10px)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#666', fontSize: '14px', fontWeight: 500 }}>
                        <span style={{ color: '#888' }}>Projects</span>
                        <span style={{ fontSize: '10px' }}>/</span>
                        <span style={{ color: '#ccc' }}>{projectId}</span>
                        <span style={{ fontSize: '10px' }}>/</span>
                        <span style={{ color: '#fff', fontWeight: 600 }}>Editor</span>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={saveConfig} style={primaryBtnStyle}>Save Changes</button>
                    </div>
                </div>

                {/* WORKSPACE */}
                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                    {/* LEFT PANEL: CONFIG */}
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '40px',
                        maxWidth: '900px',
                        margin: '0 auto',
                        width: '100%'
                    }}>
                        {activeTab === 'editor' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                <Section title="Quick Actions">
                                    <AIStudio
                                        onUpdateTheme={handleAITheme}
                                        onInsertImage={handleAIImageUpdate}
                                        onUpdateCopy={handleAICopy}
                                    />
                                </Section>

                                {/* ZONE A: TOP HEADER */}
                                <div style={cardStyle}>
                                    <h3 style={cardHeaderStyle}>
                                        <span style={{ color: '#ffeb3b', marginRight: '8px' }}>●</span> Zone A: Header
                                    </h3>
                                    <div style={{ padding: '24px' }}>
                                        <div style={{ display: 'flex', gap: '20px' }}>
                                            <div style={{ flex: 1 }}>
                                                <InputGroup label="Big Number" value={config.number} onChange={(e) => handleConfigChange('number', e.target.value)} />
                                            </div>
                                            <div style={{ flex: 2 }}>
                                                <InputGroup label="Main Title" value={config.title} onChange={(e) => handleConfigChange('title', e.target.value)} />
                                            </div>
                                        </div>
                                        <InputGroup label="Subtitle" value={config.subtitle} onChange={(e) => handleConfigChange('subtitle', e.target.value)} />
                                    </div>
                                </div>

                                {/* ZONE B: MENU BOARD */}
                                <div style={cardStyle}>
                                    <h3 style={cardHeaderStyle}>
                                        <span style={{ color: '#4caf50', marginRight: '8px' }}>●</span> Zone B: Menu Board
                                    </h3>
                                    <div style={{ padding: '24px' }}>
                                        <p style={{ marginBottom: '16px', color: '#666', fontSize: '13px' }}>Edit the main list of items displayed in the center of the screen.</p>
                                        <ListEditor itemsData={config.items} onChange={(val) => handleConfigChange('items', val)} />
                                    </div>
                                </div>

                                {/* ZONE C: FOOTER */}
                                <div style={cardStyle}>
                                    <h3 style={cardHeaderStyle}>
                                        <span style={{ color: '#2196f3', marginRight: '8px' }}>●</span> Zone C: Footer & Promotions
                                    </h3>
                                    <div style={{ padding: '24px' }}>
                                        <p style={{ marginBottom: '16px', color: '#666', fontSize: '13px' }}>Manage the rotating product carousel at the bottom of the screen.</p>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {promotions.map((promo, i) => (
                                                <div key={i} style={promoCardStyle}>
                                                    <img src={promo.image} alt="" style={{ width: '60px', height: '60px', borderRadius: '6px', objectFit: 'cover' }} />
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: 600, fontSize: '15px', color: '#fff' }}>{promo.title}</div>
                                                        <div style={{ fontSize: '13px', color: '#888' }}>{promo.offer}</div>
                                                    </div>
                                                    <button onClick={() => deletePromotion(i)} style={iconBtnStyle}>✕</button>
                                                </div>
                                            ))}
                                        </div>

                                        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #333' }}>
                                            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', color: '#eee', fontFamily: "'Outfit', sans-serif" }}>Add New Promotion</div>

                                            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                                                <button
                                                    onClick={() => document.getElementById('promo-file-input').click()}
                                                    style={secondaryBtnStyle}
                                                >
                                                    Upload New
                                                </button>
                                                <input id="promo-file-input" type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />

                                                <button
                                                    onClick={() => setShowMediaPicker(!showMediaPicker)}
                                                    style={secondaryBtnStyle}
                                                >
                                                    Select from Library
                                                </button>
                                            </div>

                                            {showMediaPicker && (
                                                <div style={{ marginBottom: '20px', border: '1px solid #444', borderRadius: '12px', padding: '16px', background: '#111' }}>
                                                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Select an image from library</div>
                                                    <MediaLibrary onSelect={handleMediaSelect} selectionMode={true} />
                                                </div>
                                            )}

                                            {previewImage && <img src={previewImage} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', marginBottom: '16px', border: '1px solid #333' }} />}

                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                                <div style={{ flex: 1 }}>
                                                    <input style={inputStyle} placeholder="Product Title (e.g., Summer Sale)" value={newPromoTitle} onChange={(e) => setNewPromoTitle(e.target.value)} />
                                                    <input style={inputStyle} placeholder="Offer Badge (e.g., 50% OFF)" value={newPromoOffer} onChange={(e) => setNewPromoOffer(e.target.value)} />
                                                </div>
                                            </div>
                                            <button onClick={addPromotion} disabled={uploading} style={{ ...primaryBtnStyle, width: '100%', marginTop: '12px', justifyContent: 'center' }}>
                                                {uploading ? 'Uploading...' : 'Add Promotion'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ height: '50px' }}></div>
                            </div>
                        )}

                        {activeTab === 'media' && (
                            <div>
                                <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px', fontFamily: "'Outfit', sans-serif" }}>Media Library</h2>
                                <MediaLibrary />
                            </div>
                        )}

                        {activeTab === 'scheduling' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h2 style={{ fontSize: '24px', fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>Dayparting Schedules</h2>
                                        <p style={{ color: '#888', fontSize: '15px', marginTop: '8px' }}>Automatically switch themes and content based on time of day.</p>
                                    </div>
                                    <button onClick={addSchedule} style={primaryBtnStyle}>+ Add Schedule</button>
                                </div>

                                {schedules.length === 0 ? (
                                    <div style={{ padding: '60px', textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px dashed #333' }}>
                                        <div style={{ fontSize: '40px', marginBottom: '16px' }}>🕒</div>
                                        <h3 style={{ color: '#fff', marginBottom: '8px' }}>No Schedules Found</h3>
                                        <p style={{ color: '#666', fontSize: '14px' }}>Create a schedule to automate your displays.</p>
                                    </div>
                                ) : (
                                    schedules.map((sched, i) => (
                                        <div key={i} style={{
                                            background: 'rgba(255,255,255,0.03)',
                                            padding: '24px',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '20px'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <input
                                                    value={sched.name}
                                                    onChange={e => updateSchedule(i, 'name', e.target.value)}
                                                    style={{ ...inputStyle, width: 'auto', fontWeight: 600, fontSize: '16px', background: 'transparent', border: '1px solid transparent', padding: '0' }}
                                                    placeholder="Schedule Name"
                                                />
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <button
                                                        onClick={() => toggleSchedule(i)}
                                                        style={{
                                                            background: sched.active ? '#4caf50' : '#222',
                                                            color: sched.active ? '#fff' : '#888',
                                                            border: 'none',
                                                            padding: '6px 14px',
                                                            borderRadius: '20px',
                                                            cursor: 'pointer',
                                                            fontWeight: 600,
                                                            fontSize: '12px'
                                                        }}
                                                    >
                                                        {sched.active ? 'ACTIVE' : 'INACTIVE'}
                                                    </button>
                                                    <button onClick={() => deleteSchedule(i)} style={{ ...iconBtnStyle, color: '#f44336' }}>🗑</button>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                                <div>
                                                    <label style={{ ...labelStyle, fontSize: '11px', marginBottom: '4px' }}>Start Time</label>
                                                    <input
                                                        type="time"
                                                        value={sched.startTime}
                                                        onChange={e => updateSchedule(i, 'startTime', e.target.value)}
                                                        style={{ ...inputStyle, width: '120px' }}
                                                    />
                                                </div>
                                                <div style={{ color: '#444' }}>➜</div>
                                                <div>
                                                    <label style={{ ...labelStyle, fontSize: '11px', marginBottom: '4px' }}>End Time</label>
                                                    <input
                                                        type="time"
                                                        value={sched.endTime}
                                                        onChange={e => updateSchedule(i, 'endTime', e.target.value)}
                                                        style={{ ...inputStyle, width: '120px' }}
                                                    />
                                                </div>
                                                <div style={{ flex: 1, paddingLeft: '20px' }}>
                                                    <label style={{ ...labelStyle, fontSize: '11px', marginBottom: '4px' }}>Theme Override</label>
                                                    <select
                                                        value={sched.configOverrides.theme || ''}
                                                        onChange={e => updateScheduleOverride(i, 'theme', e.target.value)}
                                                        style={{ ...inputStyle, cursor: 'pointer' }}
                                                    >
                                                        <option value="">No Change</option>
                                                        <option value="dark_luxury">Dark Luxury</option>
                                                        <option value="nordic_light">Nordic Light</option>
                                                        <option value="forest_rainfall">Forest Rainfall</option>
                                                        <option value="midnight_blue">Midnight Blue</option>
                                                        <option value="sunset_glow">Sunset Glow</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                <div style={cardStyle}>
                                    <h3 style={cardHeaderStyle}>Appearance</h3>
                                    <div style={{ padding: '24px' }}>
                                        <label style={labelStyle}>Select Theme</label>
                                        <ThemeSelector currentTheme={config.theme} onSelect={(val) => handleConfigChange('theme', val)} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT PANEL: PREVIEW */}
                    <div style={{
                        width: '420px',
                        borderLeft: '1px solid rgba(255,255,255,0.05)',
                        background: '#080808',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '30px',
                            left: '30px',
                            fontSize: '11px',
                            color: '#444',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '2px'
                        }}>
                            Live Preview
                        </div>
                        <div style={{
                            width: '340px', // Slightly larger
                            height: '600px',
                            borderRadius: '24px',
                            overflow: 'hidden',
                            boxShadow: '0 40px 80px rgba(0,0,0,0.8)',
                            border: '6px solid #222'
                        }}>
                            <PreviewFrame projectId={projectId} />
                        </div>
                    </div>

                </div>
            </div>

            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </div>
    );
};

// Sub-components
const SidebarItem = ({ icon, label, active, onClick }) => (
    <div
        onClick={onClick}
        style={{
            padding: '14px 16px',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            background: active ? '#fff' : 'transparent',
            color: active ? '#000' : '#888',
            transition: 'all 0.2s ease',
            fontWeight: active ? 600 : 500,
            fontSize: '14px'
        }}
        onMouseEnter={e => !active && (e.currentTarget.style.color = '#fff')}
        onMouseLeave={e => !active && (e.currentTarget.style.color = '#888')}
    >
        <span style={{ fontSize: '18px' }}>{icon}</span> {label}
    </div>
);

const Section = ({ title, children }) => (
    <div style={{ marginBottom: '10px' }}>
        {children}
    </div>
);

const InputGroup = ({ label, value, onChange }) => (
    <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>{label}</label>
        <input value={value} onChange={onChange} style={inputStyle} />
    </div>
);

// Glassmorphism Styles (Refined)
const cardStyle = {
    background: '#141414',
    border: '1px solid #222',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
};

const cardHeaderStyle = {
    padding: '18px 24px',
    margin: 0,
    fontSize: '15px',
    fontWeight: 600,
    color: '#eee',
    borderBottom: '1px solid #222',
    background: '#1a1a1a',
    fontFamily: "'Outfit', sans-serif"
};

const labelStyle = { display: 'block', marginBottom: '10px', fontSize: '13px', color: '#888', fontWeight: 600, letterSpacing: '0.5px' };
const inputStyle = { width: '100%', padding: '14px', background: '#0a0a0a', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '15px', boxSizing: 'border-box', marginBottom: '0', transition: 'border 0.2s', fontFamily: "'Inter', sans-serif" };

const primaryBtnStyle = { padding: '10px 24px', background: '#fff', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', transition: 'transform 0.1s' };
const secondaryBtnStyle = { padding: '10px 20px', background: '#222', color: '#ccc', border: '1px solid #333', borderRadius: '8px', fontWeight: 500, cursor: 'pointer', fontSize: '13px', transition: 'background 0.2s' };
const iconBtnStyle = { width: '30px', height: '30px', background: 'transparent', color: '#666', border: '1px solid transparent', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const promoCardStyle = { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#0a0a0a', borderRadius: '10px', border: '1px solid #222' };

export default AdminDashboard;
