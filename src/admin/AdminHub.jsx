import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminHub = () => {
    const [projects, setProjects] = useState([]);
    const [newProjectName, setNewProjectName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const navigate = useNavigate();

    const [devices, setDevices] = useState([]);

    useEffect(() => {
        fetchProjects();
        fetchDevices();
        // Poll devices every 5s to see new ones
        const interval = setInterval(fetchDevices, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await fetch('/api/projects');
            const data = await res.json();
            setProjects(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchDevices = async () => {
        try {
            const res = await fetch('/api/devices');
            const data = await res.json();
            setDevices(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateProject = async () => {
        if (!newProjectName) return;
        setIsCreating(true);
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId: newProjectName.toLowerCase().replace(/ /g, '-') })
            });
            if (res.ok) {
                setNewProjectName('');
                fetchProjects();
            } else {
                alert('Failed to create project');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsCreating(false);
        }
    };

    const handleAssignDevice = async (deviceId, projectId) => {
        try {
            await fetch('/api/devices/assign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deviceId, projectId })
            });
            fetchDevices(); // Refresh list immediately
        } catch (err) {
            alert('Failed to assign device');
        }
    };

    const handleUnassignDevice = async (deviceId) => {
        if (!confirm("Unassign this device? It will return to pairing mode.")) return;
        try {
            // Re-use assign but with null? Or specialized endpoint?
            // Sending projectId: null
            // OR delete it? If we delete it, it re-registers on next poll? 
            // Better to just delete for now to force re-pair.
            await fetch('/api/devices/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deviceId })
            });
            fetchDevices();
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#111',
            color: '#eee',
            fontFamily: "'Inter', sans-serif",
            padding: '40px'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <header style={{ marginBottom: '60px', borderBottom: '1px solid #333', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600, letterSpacing: '-0.5px' }}>CMS Hub</h1>
                        <p style={{ margin: '5px 0 0', color: '#888', fontSize: '14px' }}>Projects & Devices</p>
                    </div>
                </header>

                <h2 style={{ fontSize: '18px', color: '#888', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>Projects</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '60px' }}>
                    {/* New Project Card */}
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px dashed #444',
                        borderRadius: '12px',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '15px'
                    }}>
                        <input
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            placeholder="New Project Name"
                            style={{
                                background: '#222',
                                border: '1px solid #444',
                                padding: '10px',
                                borderRadius: '6px',
                                color: '#fff',
                                width: '100%',
                                boxSizing: 'border-box'
                            }}
                        />
                        <button
                            onClick={handleCreateProject}
                            disabled={!newProjectName || isCreating}
                            style={{
                                background: '#fff',
                                color: '#000',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '6px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                width: '100%',
                                opacity: (!newProjectName || isCreating) ? 0.5 : 1
                            }}
                        >
                            {isCreating ? 'Creating...' : '+ Create Space'}
                        </button>
                    </div>

                    {/* Project Cards */}
                    {projects.map(proj => (
                        <div
                            key={proj}
                            onClick={() => navigate(`/admin/editor/${proj}`)}
                            style={{
                                background: 'linear-gradient(145deg, #1a1a1a, #222)',
                                border: '1px solid #333',
                                borderRadius: '12px',
                                padding: '24px',
                                cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
                                e.currentTarget.style.borderColor = '#555';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.borderColor = '#333';
                            }}
                        >
                            <div style={{
                                width: '40px',
                                height: '40px',
                                background: '#333',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '20px',
                                fontSize: '20px'
                            }}>
                                📁
                            </div>
                            <h3 style={{ margin: '0 0 5px', fontSize: '18px', fontWeight: 600, textTransform: 'capitalize' }}>{proj}</h3>
                            <div style={{ fontSize: '12px', color: '#666' }}>Last edited: Just now</div>

                            <div style={{
                                marginTop: '20px',
                                display: 'flex',
                                gap: '10px',
                                borderTop: '1px solid #333',
                                paddingTop: '15px'
                            }}>
                                <span style={{ fontSize: '12px', color: '#888' }}>Open Editor →</span>
                            </div>
                        </div>
                    ))}
                </div>

                <h2 style={{ fontSize: '18px', color: '#888', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Screens</h2>
                <div style={{
                    background: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '12px',
                    overflow: 'hidden'
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #333', background: '#222' }}>
                                <th style={{ padding: '15px 20px', fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>Status</th>
                                <th style={{ padding: '15px 20px', fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>Code</th>
                                <th style={{ padding: '15px 20px', fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>Name</th>
                                <th style={{ padding: '15px 20px', fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>Assigned Project</th>
                                <th style={{ padding: '15px 20px', fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {devices.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#666' }}>No devices detected. Open the player on a new screen!</td>
                                </tr>
                            ) : devices.map(device => (
                                <tr key={device.id} style={{ borderBottom: '1px solid #222' }}>
                                    <td style={{ padding: '15px 20px' }}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            background: device.status === 'active' ? 'rgba(0,255,0,0.1)' : 'rgba(255,200,0,0.1)',
                                            color: device.status === 'active' ? '#4caf50' : '#ffc107'
                                        }}>
                                            {device.status === 'active' ? 'ONLINE' : 'PAIRING...'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px 20px', fontFamily: 'monospace', fontSize: '14px', letterSpacing: '1px' }}>{device.code}</td>
                                    <td style={{ padding: '15px 20px' }}>{device.name}</td>
                                    <td style={{ padding: '15px 20px' }}>
                                        <select
                                            value={device.projectId || ''}
                                            onChange={(e) => handleAssignDevice(device.id, e.target.value)}
                                            style={{
                                                background: '#111',
                                                color: '#fff',
                                                border: '1px solid #444',
                                                padding: '5px 10px',
                                                borderRadius: '4px'
                                            }}
                                        >
                                            <option value="" disabled>Select Project...</option>
                                            {projects.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </td>
                                    <td style={{ padding: '15px 20px' }}>
                                        <button
                                            onClick={() => handleUnassignDevice(device.id)}
                                            style={{ background: 'transparent', border: 'none', color: '#f44336', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline' }}
                                        >
                                            Forget
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminHub;
