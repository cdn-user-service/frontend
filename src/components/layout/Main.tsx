// src/components/Layout/Main.tsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Breadcrumb from '../common/Breadcrumb';
import Footer from './Footer'
import '@/assets/styles/pages.scss';

interface MainProps {
    children?: React.ReactNode;
}

const Main: React.FC<MainProps> = () => {
    const location = useLocation();

    const shouldHideBreadcrumb = location.pathname === '/login';

    return (
        <main className="layout-main vertical">
            <div className="main-container">
                {/* 面包屑导航 */}
                {!shouldHideBreadcrumb && <Breadcrumb />}

                {/* 主要内容区域 */}
                <div className="main-content">
                    <Outlet />
                </div>
            </div>

            {/* 页脚 */}
            <Footer />
        </main>
    );
};

export default Main;