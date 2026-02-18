import React from 'react';
import { themes } from '../../themes';

const ThemeSelector = ({ currentTheme, onSelect }) => {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '15px' }}>
            {Object.keys(themes).map(key => {
                const theme = themes[key];
                const isActive = currentTheme === key;
                return (
                    <div
                        key={key}
                        onClick={() => onSelect(key)}
                        style={{
                            cursor: 'pointer',
                            borderRadius: '8px',
                            border: isActive ? '2px solid #007bff' : '2px solid transparent',
                            overflow: 'hidden',
                            position: 'relative',
                            transition: 'all 0.2s ease',
                            boxShadow: isActive ? '0 0 0 2px rgba(0,123,255,0.3)' : 'none',
                            backgroundColor: '#2a2a2a'
                        }}
                    >
                        {/* Preview Swatch */}
                        <div style={{ height: '80px', background: theme.background, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                background: theme.headerGradient,
                                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                            }} />
                            {isActive && (
                                <div style={{
                                    position: 'absolute',
                                    top: '5px',
                                    right: '5px',
                                    background: '#007bff',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: '20px',
                                    height: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px'
                                }}>✓</div>
                            )}
                        </div>
                        {/* Label */}
                        <div style={{ padding: '8px', fontSize: '12px', color: '#fff', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {key.replace(/_/g, ' ')}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ThemeSelector;
