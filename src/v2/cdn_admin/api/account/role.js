import { $http, $qs } from '../../request'
// 获取角色列表
export function getRoleList(data) {
    return $http({
        url: 'sys/role/list',
        method: 'post',
        data
    })
}

// 获取当前账号角色列表
export function getNowRoleList(params) {
    return $http({
        url: 'sys/role/select',
        method: 'get',
        params
    })
}

// by ID 获取角色信息
export function getRoleInfoById(id) {
    return $http({
        url: `sys/role/info/${id}`,
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

// 删除角色
export function doDeleteRole(data) {
    return $http({
        url: 'sys/role/delete',
        method: 'post',
        data
    })
}

// 分配权限提交
// export function doUpdateRights(data) {
//     return $http({
//         url: 'sys/role/update',
//         method: 'post',
//         data
//     })
// }
