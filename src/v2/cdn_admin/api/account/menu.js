import { $http, $qs } from '../../request'

// 获取已配置菜单列表
export function getMenuList() {
    return $http({
        url: 'sys/menu/list',
        method: 'get'
    })
}

// 获取菜单列表
export function getMenuNav() {
    return $http({
        url: 'sys/menu/nav',
        method: 'get'
    })
}

// 添加、修改菜单的时候，选择上级菜单接口
export function getMenuSelect() {
    return $http({
        url: 'sys/menu/select',
        method: 'get'
    })
}

// by ID 获取菜单信息
export function getMenuInfoById(menuId) {
    return $http({
        url: `sys/menu/info/${menuId}`,
        method: 'get'
    })
}

// 获取权限列表
export function getPermsList() {
    return $http({
        url: 'sys/menu/allPerms',
        method: 'get'
    })
}

// 添加 菜单
export function doCreateMenu(data) {
    return $http({
        url: 'sys/menu/save',
        method: 'post',
        data
    })
}

// 修改 菜单
export function doUpdateMenu(data) {
    return $http({
        url: 'sys/menu/update',
        method: 'post',
        data
    })
}

// 删除菜单
export function doDeleteMenu(menuId) {
    return $http({
        url: `sys/menu/delete/${menuId}`,
        method: 'post'
    })
}
