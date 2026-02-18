import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const PairingScreen = () => {
    const [code, setCode] = useState('');
    const [status, setStatus] = useState('Generating Code...');

    useEffect(() => {
        initializePairing();
    }, []);

    const initializePairing = async () => {
        // 1. Get or Create Device ID
        let deviceId = localStorage.getItem('signage_device_id');
        if (!deviceId) {
            deviceId = uuidv4();
            localStorage.setItem('signage_device_id', deviceId);
        }

        // 2. Generate Display Code (Simpler for humans: 4 chars)
        let displayCode = localStorage.getItem('signage_display_code');
        if (!displayCode) {
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            displayCode = '';
            for (let i = 0; i < 4; i++) {
                displayCode += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            localStorage.setItem('signage_display_code', displayCode);
        }
        setCode(displayCode);

        // 3. Register with Server
        try {
            await fetch('/api/devices/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    deviceId,
                    code: displayCode,
                    name: `Display ${displayCode}` // Default name
                })
            });
            setStatus('Waiting for assignment...');
            startPolling(deviceId);
        } catch (err) {
            console.error(err);
            setStatus('Connection Error. Retrying...');
            setTimeout(initializePairing, 5000);
        }
    };

    const startPolling = (deviceId) => {
        setInterval(async () => {
            try {
                const res = await fetch(`/api/devices/poll/${deviceId}`);
                const data = await res.json();

                if (data.assignedProject) {
                    // Redirect to project!
                    window.location.href = `/?project=${data.assignedProject}`;
                }
            } catch (err) {
                console.error("Polling error", err);
            }
        }, 3000); // Poll every 3 seconds
    };

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            background: '#111',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Inter', sans-serif"
        }}>
            <h1 style={{ fontSize: '24px', color: '#888', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '40px' }}>New Display Detected</h1>

            <div style={{
                background: '#222',
                border: '2px solid #444',
                borderRadius: '20px',
                padding: '60px 100px',
                textAlign: 'center',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}>
                <div style={{ fontSize: '16px', color: '#666', marginBottom: '20px' }}>PAIRING CODE</div>
                <div style={{ fontSize: '120px', fontWeight: 800, letterSpacing: '10px', color: '#fff', lineHeight: 1 }}>
                    {code}
                </div>
            </div>

            <div style={{ marginTop: '60px', color: '#666', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '10px', height: '10px', background: '#0f0', borderRadius: '50%', boxShadow: '0 0 10px #0f0' }}></div>
                {status}
            </div>

            <div style={{ marginTop: '20px', color: '#444', fontSize: '14px' }}>
                Go to <b>Admin Hub</b> to assign a project.
            </div>
        </div>
    );
};

export default PairingScreen;
