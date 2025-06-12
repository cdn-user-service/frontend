// src/components/ui/SettingDrawer.tsx
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Drawer, Radio, Space, Divider, Typography } from 'antd';
import { useLayout } from '../../context/LayoutContext';

const { Title } = Typography;

interface SettingDrawerHandle {
    show: () => void;
}

const SettingDrawer = forwardRef<SettingDrawerHandle>((_, ref) => {
    const [visible, setVisible] = useState(false);
    const { state, changeLayoutTheme } = useLayout();
    const { layoutTheme } = state;

    useImperativeHandle(ref, () => ({
        show: () => setVisible(true)
    }));

    const handleClose = () => {
        setVisible(false);
    };

    const handleLayoutModeChange = (e: any) => {
        changeLayoutTheme({ layoutMode: e.target.value });
    };

    const handleHeaderThemeChange = (e: any) => {
        changeLayoutTheme({ headerTheme: e.target.value });
    };

    const handleAsideThemeChange = (e: any) => {
        changeLayoutTheme({ asideTheme: e.target.value });
    };

    return (
        <Drawer
            title="Theme Settings"
            placement="right"
            closable={true}
            onClose={handleClose}
            visible={visible}
            width={300}
        >
            <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                    <Title level={5}>Layout Mode</Title>
                    <Radio.Group
                        value={layoutTheme.layoutMode}
                        onChange={handleLayoutModeChange}
                        buttonStyle="solid"
                    >
                        <Radio.Button value="ttb">Top to Bottom</Radio.Button>
                        <Radio.Button value="ltr">Left to Right</Radio.Button>
                    </Radio.Group>
                </div>

                <Divider />

                <div>
                    <Title level={5}>Header Theme</Title>
                    <Radio.Group
                        value={layoutTheme.headerTheme}
                        onChange={handleHeaderThemeChange}
                        buttonStyle="solid"
                    >
                        <Radio.Button value="light">Light</Radio.Button>
                        <Radio.Button value="dark">Dark</Radio.Button>
                    </Radio.Group>
                </div>

                <Divider />

                <div>
                    <Title level={5}>Sidebar Theme</Title>
                    <Radio.Group
                        value={layoutTheme.asideTheme}
                        onChange={handleAsideThemeChange}
                        buttonStyle="solid"
                    >
                        <Radio.Button value="light">Light</Radio.Button>
                        <Radio.Button value="dark">Dark</Radio.Button>
                    </Radio.Group>
                </div>
            </Space>
        </Drawer>
    );
});

export default SettingDrawer;