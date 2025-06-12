// src/components/Layout/index.tsx
import React, { useEffect } from 'react';
import { useLayout } from '@/context/LayoutContext';
import Header from './Header';
import Sidebar from './Siderbar';
import Main from './Main';

const Layout: React.FC = () => {
    const { state, toggleMobileAside } = useLayout();
    const { layoutTheme, device, isMobileAsideShow } = state;

    useEffect(() => {
        console.log('测试，当前横竖', layoutTheme.layoutMode);
    }, [layoutTheme.layoutMode]);

    // 处理移动端遮罩点击
    const handleMobileShadowClick = () => {
        toggleMobileAside(false);
    };

    if (layoutTheme.layoutMode === 'ttb') {
        // 上下布局模式
        return (
            <div className="layout-container  vertical">
                <Header />
                <div className="layout-content">
                    <div className={`layout-sidebar ${device === 'pc' || isMobileAsideShow ? 'show' : 'hide'}`}>
                        <Sidebar showLogo={false} />
                    </div>
                    <Main />
                </div>
                {/* 移动端遮罩 */}
                {device !== 'pc' && isMobileAsideShow && (
                    <div className="mobile-shadow" onClick={handleMobileShadowClick} />
                )}
            </div>
        );
    } else {
        // 左右布局模式 ltr
        return (
            <div className="layout-container horizontal ">
                <div className={`layout-sidebar ${device === 'pc' || isMobileAsideShow ? 'show' : 'hide'}`}>
                    <Sidebar showLogo={true} />
                </div>
                <div className="layout-content vertical">
                    <Header showLogo={false} />
                    <Main />
                </div>
                {/* 移动端遮罩 */}
                {device !== 'pc' && isMobileAsideShow && (
                    <div className="mobile-shadow" onClick={handleMobileShadowClick} />
                )}
            </div>
        );
    }
};

export default Layout;