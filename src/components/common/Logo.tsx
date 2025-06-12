// src/components/common/Logo.tsx
import React from 'react';

interface LogoProps {
    themeMode?: 'light' | 'dark';
    style?: React.CSSProperties;
}

const Logo: React.FC<LogoProps> = ({ themeMode = 'light', style }) => {
    return (
        <div className={`layout-logo-box layout-logo-${themeMode}`} style={style}>
            <div className="logo-content">
                <span className="logo-icon"> </span>
                <span className="logo-text">CDN管理</span>
            </div>
        </div>
    );
};

export default Logo;