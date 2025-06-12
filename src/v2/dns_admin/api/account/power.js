
import { $http, $qs } from '../../request'

// 获取菜单列表
export function getMenuNav() {
    return $http({
        url: 'sys/menu/nav',
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

/* 角色模块
-------------------------------------------------------------- */
// 获取角色列表
export function getRoleList(params) {
    return $http({
        url: 'sys/role/list',
        method: 'get',
        params
    })
}

// 获取已配置菜单列表
export function getMenuList() {
    return $http({
        url: 'sys/menu/list',
        method: 'get'
    })
}

// 添加 角色
export function doCreateRole(data) {
    return $http({
        url: 'sys/role/save',
        method: 'post',
        data
    })
}

// 修改 角色
export function doUpdateRole(data) {
    return $http({
        url: 'sys/role/update',
        method: 'post',
        data
    })
}

// 分配权限提交
export function doUpdateRights(data) {
    return $http({
        url: 'sys/role/update',
        method: 'post',
        data
    })
}

// 删除角色
export function doDeleteRole(data) {
    return $http({
        url: 'sys/role/delete',
        method: 'post',
        data
    })
}
