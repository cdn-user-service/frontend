import { $http, $qs } from '../../request'

// 获取产品列表
export function getProductList(params) {
    return $http({
        url: 'sys/finance/product/list',
        method: 'get',
        params
    })
}

// 获取产品详情
export function getItem(params) {
    return $http({
        url: `sys/finance/product/info/${params}`,
        method: 'get'
    })
}

/** 添加-修改 产品
 *  添加 = sys/finance/product/save 
 *  修改 = sys/finance/product/update 
 */
export function doUpdate(data, type) {
    return $http({
        url: `sys/finance/product/${type}`,
        method: 'post',
        data
    })
}

// 删除产品
export function doDelete(data) {
    return $http({
        url: 'sys/finance/product/delete',
        method: 'post',
        data
    })
}

/* attr
* ------------------------------------------------------------- */

// 获取 attr属性 列表 - 不带分页
export function getAttrNav() {
    return $http({
        url: 'sys/finance/product/GetProductAttrNav',
        method: 'get'
    })
}

// 获取 attr属性 列表 - 带分页
export function getAttrList(params) {
    return $http({
        url: 'sys/finance/product/GetProductAttrList',
        method: 'get',
        params
    })
}

// 添加-修改 attr
export function doUpdateAttr(data) {
    return $http({
        url: 'sys/finance/product/SaveProductAttrInfo',
        method: 'post',
        data
    })
}

// 删除 attr
export function doDeleteAttr(data) {
    return $http({
        url: 'sys/finance/product/DeleteProductAttr',
        method: 'post',
        data
    })
}

/* 已售产品
* ------------------------------------------------------------- */
// 获取已售产品列表
export function getSoldList(data) {
    return $http({
        url: 'sys/finance/product/GetUserConsumeList',
        method: 'post',
        data
    })
}
