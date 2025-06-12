
// src/components/Layout/Header.tsx
import React from 'react';
import { useLayout } from '@/context/LayoutContext';
import Logo from '../common/Logo';
import AvatarLayout from '../common/Avatar';
import ThemeToggle from '../common/ThemeToggle';



interface HeaderProps {
    showLogo?: boolean;
}

const Header: React.FC<HeaderProps> = ({ showLogo = true }) => {
    const { state, toggleMobileAside } = useLayout();
    const { device } = state;

    const handleMobileToggle = () => {
        toggleMobileAside(true);
    };

    return (
        <header className="layout-header">
            <div className="header-left">
                {device === 'pc' ? (
                    <>
                        {showLogo && (
                            <div className="logo-transition">
                                <Logo />
                            </div>
                        )}
                        {/* CDN用户的顶部导航栏 */}
                        <div className="top-bar">
                            {/* 这里可以放置具体的导航项 */}
                        </div>
                    </>
                ) : (
                    <div className="icon-toggle" onClick={handleMobileToggle}>
                        <span className="expand-icon">☰</span>
                    </div>
                )}
            </div>

            <div className="header-right">
                <ThemeToggle />
                <AvatarLayout />
            </div>
        </header>
    );
};

export default Header;