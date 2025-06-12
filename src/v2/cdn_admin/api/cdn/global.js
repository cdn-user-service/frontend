import { $http, $qs } from '../../request'

// 根据组名 groups 获取全局属性，可同时获取多个组名
export function getGlobalAttrList(data) {
    return $http({
        url: 'sys/cdn/public/nginx/attr/list',
        method: 'post',
        data
    })
}

// 获取单个属性 key, (c_m_text 类型需要传 parentId)
export function getGlobalAttrDetail(data) {
    return $http({
        url: 'sys/cdn/public/nginx/attr/key/detail',
        method: 'post',
        data
    })
}

// 保存全局属性
export function doSaveGlobalAttr(data) {
    return $http({
        url: 'sys/cdn/public/nginx/attr/save',
        method: 'post',
        data
    })
}

// 修改全局属性状态，优先取ID,无id 取KEY,id 返回单个，KEY 返回list
export function doChangeGlobalAttrStatus(data) {
    return $http({
        url: 'sys/cdn/public/nginx/attr/status/change',
        method: 'post',
        data
    })
}

// 属性权重修改(m_text mm_text c_m_text 可修改）
export function doChangeGlobalAttrWeight(data) {
    return $http({
        url: 'sys/cdn/public/nginx/attr/weight/change',
        method: 'post',
        data
    })
}

// 批量删除全局属性 ids
export function doDeleteGlobalAttr(data) {
    return $http({
        url: 'sys/cdn/public/nginx/attr/delete',
        method: 'post',
        data
    })
}
