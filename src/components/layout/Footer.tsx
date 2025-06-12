// src/components/layout/Footer.tsx
import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="layout-footer">
            <p> Copyright © {new Date().getFullYear()}</p>
            <div>
                首页 | 服务协议
            </div>
        </footer>
    );
};

export default Footer;