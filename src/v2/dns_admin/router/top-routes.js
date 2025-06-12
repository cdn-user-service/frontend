export default [
    {
        path: '/home',
        redirect: '/home/dashboard',
        meta: {
            title: '首页',
            icon: 'aicon icon-shouye'
        }
    },
    {
        path: '/dns',
        redirect: '/dns/domain',
        meta: {
            title: '权威DNS',
            icon: 'aicon icon-wangluo'
        }
    },
    {
        path: '/account',
        redirect: '/account/users',
        meta: {
            title: '账户',
            icon: 'el-icon-user'
        }
    },
    {
        path: '/system',
        redirect: '/system/config',
        meta: {
            title: '系统',
            icon: 'el-icon-setting'
        }
    }
]
