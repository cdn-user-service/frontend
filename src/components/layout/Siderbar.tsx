// src/components/Layout/Sidebar/index.tsx
import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useLayout } from '@/context/LayoutContext';
import {
    Landmark,
    Globe,
    Network,
    BarChart2,
    PieChart,
    Package,
    Wallet,
    User,
    FileText,
    MessageCircle,
    ClipboardList,
    Menu as MenuIcon,
    Blocks,
    ArrowLeftToLine,
    ArrowRightToLine
} from 'lucide-react';
// import Logo from '../../common/Logo';

const iconMap: Record<string, React.ReactNode> = {
    '服务概览': <Landmark size={18} strokeWidth={2} />,
    '站点管理': <Globe size={18} />,
    '流量转发': <Network size={18} />,
    '流量分析': <BarChart2 size={18} />,
    '统计分析': <PieChart size={18} />,
    '套餐管理': <Package size={18} />,
    '财务中心': <Wallet size={18} />,
    '个人中心': <User size={18} />,
    '工单管理': <ClipboardList size={18} />,
    '消息管理': <MessageCircle size={18} />,
    '日志服务': <FileText size={18} />,
};

const menuStructure: Record<string, { path: string; children: { title: string; path: string }[] }> = {
    '服务概览': {
        path: '/overview',
        children: []
    },
    '站点管理': {
        path: '/sites',
        children: [
            { title: '我的域名', path: '/sites/domains' },
            { title: '批量操作', path: '/sites/batch' },
            { title: '预热更新', path: '/sites/preload' },
            { title: '证书管理', path: '/sites/certificates' },
            { title: 'URL转发', path: '/sites/forwarding' },
            { title: '强制跳转', path: '/sites/redirect' },
            { title: 'DNS设置', path: '/sites/dns' }
        ]
    },
    '流量转发': {
        path: '/stream',
        children: [
            { title: '四层转发', path: '/stream/index' },
            { title: '转发监控', path: '/stream/monitor' },
            { title: '转发排行', path: '/stream/rank' },
            { title: '转发日志', path: '/stream/logs' }
        ]
    },
    '流量分析': {
        path: '/traffic',
        children: [
            { title: '站点流量', path: '/traffic/sites' },
            { title: '请求排行', path: '/traffic/top' }
        ]
    },
    '统计分析': {
        path: '/stats',
        children: [
            { title: '请求查询', path: '/stats/request' },
            { title: '实时连接', path: '/stats/connection' }
        ]
    },
    '套餐管理': {
        path: '/plan',
        children: [
            { title: '我的套餐', path: '/plan/mine' },
            { title: '购买套餐', path: '/plan/purchase' },
            { title: '增值服务', path: '/plan/vas' },
            { title: '用量查询', path: '/plan/usage' }
        ]
    },
    '工单管理': {
        path: '/tickets',
        children: [
            { title: '工单列表', path: '/tickets/list' },
            { title: '提交工单', path: '/tickets/submit' }
        ]
    },
    '日志服务': {
        path: '/logs',
        children: []
    },
    '个人中心': {
        path: '/account',
        children: [
            { title: '帐号信息', path: '/account/info' },
            { title: '实名认证', path: '/account/verify' },
            { title: '我的订单', path: '/finance/orders' },
            { title: '余额充值', path: '/finance/recharge' }
            // { title: '登录白名单', path: '/account/whitelist' }
        ]
    },
};


const Sidebar: React.FC<{ showLogo?: boolean }> = ({ showLogo = true }) => {
    const { state, toggleSidebarCollapse } = useLayout();
    const { sidebarCollapsed } = state;
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

    const navigate = useNavigate();
    const location = useLocation();

    const handleToggleMenu = (title: string, hasChildren: boolean, path: string) => {
        if (hasChildren) {
            setOpenMenus(prev => ({ ...prev, [title]: !prev[title] }));
        } else {
            navigate(path);
        }
    };

    return (
        <aside
            className={`sidebar-container ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}
        >
            {/* 顶部标题/Logo */}

            <div
                className={`sidebar-header ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}
                onClick={() => toggleSidebarCollapse()}
            >
                {sidebarCollapsed ? (
                    <>
                        <span className="icon default-icon">
                            <MenuIcon />
                        </span>
                        <span className="icon hover-icon"><ArrowRightToLine size={20} /></span>
                    </>
                ) : (
                    <>
                        <ArrowLeftToLine size={18} />
                        <span className="sidebar-title">CDN 管理</span>
                    </>
                )}
            </div>


            {/* 主菜单 */}
            <div className="sidebar-menu">
                {Object.entries(menuStructure).map(([menuTitle, menuData]) => {
                    const hasChildren = menuData.children.length > 0;
                    // 判断当前主菜单是否激活（当前路径匹配主菜单或其子菜单）
                    const isActive =
                        (!hasChildren && location.pathname === menuData.path) ||
                        (hasChildren && menuData.children.some(child => location.pathname === child.path));

                    return (
                        <div key={menuTitle} className={`menu-section ${isActive ? 'active' : ''}`}>
                            <div
                                className={`menu-wrapper ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}
                                onClick={() => handleToggleMenu(menuTitle, hasChildren, menuData.path)}
                            >
                                <span className="menu-icon">{iconMap[menuTitle]}</span>
                                {!sidebarCollapsed && <span className="menu-title">{menuTitle}</span>}
                                {!sidebarCollapsed && hasChildren && (
                                    <span className="menu-arrow">
                                        {openMenus[menuTitle] ? '▲' : '▼'}
                                    </span>
                                )}
                            </div>
                            {/* 子菜单 */}
                            {!sidebarCollapsed && openMenus[menuTitle] && hasChildren && (
                                <div className="menu-list">
                                    {menuData.children.map(item => (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            className={({ isActive }) =>
                                                `menu-item menu-child ${isActive ? 'active' : ''}`
                                            }
                                        ><span className="menu-icon"><Blocks /> </span>
                                            <div className="menu-title">{item.title}</div>
                                        </NavLink>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </aside>
    );
};

export default Sidebar;