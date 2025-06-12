// src/components/ui/Setting.tsx
import React from 'react';
import { Button } from 'antd';
import { SettingOutlined } from '@ant-design/icons';

interface SettingProps {
    onOpenDrawer: () => void;
}

const Setting: React.FC<SettingProps> = ({ onOpenDrawer }) => {
    return (
        <div
            className="setting-button"
            style={{
                position: 'fixed',
                right: '15px',
                bottom: '15px',
                zIndex: 1000,
            }}
        >
            <Button
                type="primary"
                shape="circle"
                icon={<SettingOutlined />}
                size="large"
                onClick={onOpenDrawer}
            />
        </div>
    );
};

export default Setting;