import { $http, $qs } from '../../request'

// 分页获取URL转发列表
export function getRewriteList(data) {
    return $http({
        url: 'app/rewrite/list',
        method: 'post',
        data
    })
}

// 根据 ID 获取转发信息
export function getRewriteInfoById(id) {
    return $http({
        url: `app/rewrite/info/${id}`,
        method: 'get'
    })
}

// 添加-修改 URL转发
export function doSaveRewrite(data) {
    return $http({
        url: 'app/rewrite/save',
        method: 'post',
        data
    })
}

// 批量删除URL转发
export function doDeleteRewrite(data) {
    return $http({
        url: 'app/rewrite/delete',
        method: 'post',
        data
    })
}
