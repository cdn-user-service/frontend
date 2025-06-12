// src/components/common/AntsAvatar.tsx
import React from 'react';
import { Dropdown, Avatar } from 'antd';
import type { MenuProps } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const AvatarLayout: React.FC = () => {
    const menuItems: MenuProps['items'] = [
        { key: 'profile', label: 'Profile' },
        { key: 'settings', label: 'Settings' },
        { type: 'divider' } as const,  // 分隔线
        { key: 'logout', label: 'Logout', danger: true }
    ];

    return (
        <div className="layout-avatar-box flex items-center mx-4 cursor-pointer">
            <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                <div className="flex items-center">
                    <Avatar icon={<UserOutlined />} />
                    {/* <span className="ml-2 hidden md:inline">User Name</span> */}
                </div>
            </Dropdown>
        </div>
    );
};

export default AvatarLayout;