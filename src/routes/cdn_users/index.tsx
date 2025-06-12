// src/routes/index.tsx
import { RouteObject, useRoutes } from 'react-router-dom';
import Layout from '@/components/layout';
import Overview from '@/pages/cdn_users/Overview';
import PlanLayout from '@/pages/cdn_users/Plan';
import PlanUsage from '@/pages/cdn_users/Plan/PlanUsage';
import PlanOwn from '@/pages/cdn_users/Plan/PlanOwn';
import Log from '@/pages/cdn_users/Log';
import Account from '@/pages/cdn_users/Account';
import NotFound from '@/pages/NotFound';

const routes: RouteObject[] = [
    {
        path: '/',
        element: <Layout />,
        children: [
            { index: true, element: <Overview /> },
            { path: 'overview', element: <Overview /> },
            {
                path: 'plan',
                element: <PlanLayout />,
                children: [
                    { index: true, element: <PlanLayout /> },
                    { path: 'usage', element: <PlanUsage /> },
                    { path: 'own', element: <PlanOwn /> },
                ],
            },
            { path: 'account', element: <Account /> },
            { path: 'log', element: <Log /> },
            { path: '*', element: <NotFound /> },
        ],
    },
];

const AppRoutes = () => useRoutes(routes);

export default AppRoutes;