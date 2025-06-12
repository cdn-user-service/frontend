// src/pages/Plan/index.tsx
import { Outlet } from 'react-router-dom';

const PlanLayout = () => {
    return (
        <div className="plan-wrapper">
            <h2 className="text-xl font-bold mb-4">套餐管理</h2>
            {/* 所有子页面会渲染在这里 */}
            <Outlet />
        </div>
    );
};

export default PlanLayout;