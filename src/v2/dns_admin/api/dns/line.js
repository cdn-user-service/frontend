
import { $http, $qs } from '../../request'

// 获取基础区域数据
export function getAreaList(data) {
    return $http({
        url: 'sys/dns/GetAreaList',
        method: 'post',
        data: $qs.stringify(data)
    })
}

// 获取区域分类列表
export function getLineAreaLEnum() {
    return $http({
        url: 'sys/dns/LineAreaEnum',
        method: 'get'
    })
}

// 点击添加数据，获取父级列表
export function getAreaParentList(data) {
    return $http({
        url: 'sys/dns/AreaParentList',
        method: 'post',
        data: $qs.stringify(data)
    })
}

/* area
------------------------------------------------------------- */
// 获取 area列表数据
export function getAclAreaList(data) {
    return $http({
        url: 'sys/dns/GetAclAresList',
        method: 'post',
        data: $qs.stringify(data)
    })
}

// 添加 area数据
export function doCreateArea(data) {
    return $http({
        url: 'sys/dns/AddAreaCodeData',
        method: 'post',
        data: $qs.stringify(data)
    })
}

// 修改 area数据
export function doUpdateArea(data) {
    return $http({
        url: 'sys/dns/UpdateAreaCode',
        method: 'post',
        data: $qs.stringify(data)
    })
}

// 删除 area
export function doDeleteArea(data) {
    return $http({
        url: 'sys/dns/DeleteAreaCodeByIds',
        method: 'post',
        data: $qs.stringify(data)
    })
}

// area 追加IP段
export function doCreateAclIp(data) {
    return $http({
        url: 'sys/dns/CreateAclIp',
        method: 'post',
        data
    })
}

/* line
------------------------------------------------------------- */
// 获取 line 列表数据
export function getLineList(data) {
    return $http({
        url: 'sys/dns/PageLineList',
        method: 'post',
        data: $qs.stringify(data)
    })
}

// 添加线路获取级联区域数据
export function getAllAraCodeList(params) {
    return $http({
        url: `sys/dns/GetAllAreaCodeList?parent=${params}`,
        method: 'get'
    })
}

// 添加 line 数据
export function doCreateLine(data) {
    return $http({
        url: 'sys/dns/CreateLine',
        method: 'post',
        data
    })
}

// 修改 line 数据
export function doUpdateLine(data) {
    return $http({
        url: '',
        method: 'post',
        data
    })
}

// 删除 line 
export function doDeleteLine(data) {
    return $http({
        url: 'sys/dns/DeleteFinalLineAreaCodeByIds',
        method: 'post',
        data: $qs.stringify(data)
    })
}
