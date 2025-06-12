import { $http, $qs } from '../../request'

/* =====================================
*       工单列表
*  =====================================
*/
// 分页获取工单列表
export function getWorkOrderList(data) {
    return $http({
        url: 'app/work/order/wol/list',
        method: 'post',
        data
    })
}

// 删除工单
export function doDeleteWorkerOrder(data) {
    return $http({
        url: 'app/work/order/wol/bat/delete',
        method: 'post',
        data
    })
}

// 回复工单
export function doReplayWorkOrder(data) {
    return $http({
        url: 'app/work/order/wo/send/message',
        method: 'post',
        data
    })
}

// 修改工单状态
export function changeWorkerOrderStatus(params) {
    return $http({
        url: 'app/work/order/wol/change/status',
        method: 'get',
        params
    })
}

// 获取工单详情
export function getWorkOrderDetail(params) {
    return $http({
        url: 'app/work/order/wol/detail',
        method: 'get',
        params
    })
}

// 获取工单分类列表 parentId
export function getWorkOrderCategoryList(params) {
    return $http({
        url: 'app/work/order/category/list',
        method: 'get',
        params
    })
}

// 创建工单
export function doCreateWorkOrder(data) {
    return $http({
        url: 'app/work/order/wol/save',
        method: 'post',
        data
    })
}

// 上传图片、文件
export function doOssUpload(data) {
    return $http({
        url: 'sys/oss/upload',
        method: 'post',
        data
    })
}
