import React, { useEffect, useState } from 'react';

/**
 * Toast Object Structure:
 * {
 *   id: string,
 *   type: 'success' | 'error' | 'info' | 'warning',
 *   message: string,
 *   duration: number (ms)
 * }
 */

const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            pointerEvents: 'none' // Allow clicks through container
        }}>
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
            ))}
        </div>
    );
};

const ToastItem = ({ toast, onRemove }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, toast.duration || 3000);

        return () => clearTimeout(timer);
    }, [toast]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            onRemove(toast.id);
        }, 300); // Match animation duration
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return '✅';
            case 'error': return '⚠️';
            case 'info': return 'ℹ️';
            case 'warning': return '🔔';
            default: return '📢';
        }
    };

    const getColors = (type) => {
        switch (type) {
            case 'success': return { bg: 'rgba(26, 90, 42, 0.95)', border: '#28a745', text: '#ccffdd' };
            case 'error': return { bg: 'rgba(90, 26, 26, 0.95)', border: '#ff4d4d', text: '#ffcccc' };
            case 'warning': return { bg: 'rgba(90, 70, 26, 0.95)', border: '#ffcc00', text: '#fff3cd' };
            default: return { bg: 'rgba(40, 40, 40, 0.95)', border: '#666', text: '#eee' };
        }
    };

    const colors = getColors(toast.type);

    return (
        <div
            style={{
                pointerEvents: 'auto',
                minWidth: '250px',
                padding: '12px 20px',
                borderRadius: '8px',
                background: colors.bg,
                color: colors.text,
                border: `1px solid ${colors.border}`,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '14px',
                fontWeight: 600,
                animation: isExiting ? 'slideOutFade 0.3s ease-in forwards' : 'slideUpFade 0.3s ease-out',
                cursor: 'pointer'
            }}
            onClick={handleClose}
        >
            <span style={{ fontSize: '18px' }}>{getIcon(toast.type)}</span>
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', opacity: 0.7 }}>✕</button>

            <style>{`
                @keyframes slideUpFade {
                    from { opacity: 0; transform: translateY(20px) scale(0.9); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes slideOutFade {
                    from { opacity: 1; transform: translateY(0) scale(1); }
                    to { opacity: 0; transform: translateY(20px) scale(0.9); }
                }
            `}</style>
        </div>
    );
};

export default ToastContainer;
