// src/components/common/Breadcrumb.tsx
import React from 'react';
import { useLocation, Link } from 'react-router-dom';

interface BreadcrumbItem {
    title: string;
    path?: string;
}

const Breadcrumb: React.FC = () => {
    const location = useLocation();

    // 根据当前路径生成面包屑
    const generateBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
        const pathSegments = pathname.split('/').filter(Boolean);
        const breadcrumbs: BreadcrumbItem[] = [
            { title: '首页', path: '/' }
        ];

        // 根据路径段生成面包屑
        let currentPath = '';
        pathSegments.forEach((segment, index) => {
            currentPath += `/${segment}`;

            // 这里应该根据实际的路由配置来生成标题
            let title = segment;
            switch (segment) {
                case 'dashboard':
                    title = '仪表盘';
                    break;
                case 'sites':
                    title = '站点管理';
                    break;
                case 'list':
                    title = '列表';
                    break;
                default:
                    title = segment.charAt(0).toUpperCase() + segment.slice(1);
            }

            breadcrumbs.push({
                title,
                path: index === pathSegments.length - 1 ? undefined : currentPath
            });
        });

        return breadcrumbs;
    };

    const breadcrumbs = generateBreadcrumbs(location.pathname);

    return (
        <nav className="layout-breadcrumb">
            <ol className="flex align-center gap-2">
                {breadcrumbs.map((item, index) => (
                    <li key={index} className="flex align-center gap-2">
                        {item.path ? (
                            <Link to={item.path} className="breadcrumb-link">
                                {item.title}
                            </Link>
                        ) : (
                            <span className="breadcrumb-current">{item.title}</span>
                        )}
                        {index < breadcrumbs.length - 1 && (
                            <span className="breadcrumb-separator">/</span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumb;