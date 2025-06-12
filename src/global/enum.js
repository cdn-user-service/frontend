// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getProductAttrObj } = require(`@/v2/${PROCESS_NAME}/api/public`)

/**
 * @description: 日志类型
 */
export const logType = {
  0: '其它日志',
  1: '登录日志',
  2: '操作日志',
  3: '产品日志',
  4: '财务日志',
  5: '调度日志'
}
export function getLogType(key) {
  return logType[+key]
}

/**
 * @description: 工单状态
 */
export const workOrderStatus = {
  0: '处理中',
  1: '处理完成',
  2: '申诉处理中',
  3: '已结单'
}
export function getWorkOrderStatus(key) {
  return workOrderStatus[+key]
}

/**
 * @description: 订单类型，这个是CDN的，DNS 的好像不一样！！！
 */
export const orderType = {
  1: '实名认证',
  2: '余额充值',
  10: '套餐购买',
  11: '套餐续费',
  12: '增值服务',
  13: '套餐升级',
  30: '预付费套餐',
  20: 'SSL证书购买',
  21: 'SSL证书续费',
  22: 'SSL免费证书',
  23: 'SSL免费证书'
}
export function getOrderType(key) {
  return orderType[+key]
}

/**
 * @description: 支付状态
 */
export const payStatus = {
  0: '未知',
  10: '待支付',
  11: '已过期',
  12: '已关闭',
  13: '支付失败',
  14: '支付成功',
  15: '退款中', // 支付成功后请求退款
  16: '已退款', // 支付成功后已退款

  // 退款相关，这个走另外的接口
  20: '待退款',
  21: '退款过期',
  22: '退款关闭',
  23: '退款失败',
  24: '退款完成'
}
export function getPayStatus(key) {
  return payStatus[+key] || ''
}

/**
 * @description: 支付类型
 */
export const payType = {
  0: '余额支付',
  1: '后台支付',
  2: '支付宝支付',
  3: '微信支付',
  4: '富友支付',
  5: '银联支付',
  7: '在线支付',
  8: '加密货币',
  9: '彩虹易支付',
  10: '通联支付'
}
export function getPayType(key) {
  return payType[+key] || ''
}

/**
 * @description: 产品状态
 */
export const productStatus = {
  0: '下架（不可购买不可续费）',
  1: '上架（可购买可续费）',
  2: '体验版(可新购不可续费)',
  3: '典藏版（不可新购可续费）'
}
export function getProductStatus(key) {
  return productStatus[+key]
}

/**
 * @description: 价格
 */
export const priceName = {
  m: '月',
  s: '季',
  y: '年',
  d: '天',
  p: '次'
}
export function getPriceName(key) {
  return priceName[key] || ''
}

/**
 * @description: 计费类型
 */
export const billName = {
  1: '流量月结',
  2: '平均日峰带宽',
  3: '月95带宽'
}
export function getBillName(key) {
  return billName[+key]
}

/**
 * @description: 获取产品参数数据
 */
// const proAttrObj = {}
// const proAttr = {}
export let productAttrObj
export let productAttr

export async function doGetProductAttr() {
  const { data: res } = await getProductAttrObj()
  if (res.code !== 1) return
  const obj = res.data || {}
  productAttrObj = obj.productAttrObj || {}

  // 不显示已使用多少  0 / 100
  if (typeof productAttrObj.defense === 'object') {
    productAttrObj.defense.hiddenUsed = true
  }
  if (typeof productAttrObj.sms === 'object') {
    productAttrObj.sms.hiddenUsed = true
  }

  productAttr = {
    ...obj.productAttr,
    ...productAttrObj
  }
}

// 下面的不需要 ========================================
/**
 * @description: 产品属性对象、分割了的
 */
export const _productAttrObj1 = {
  site: {
    name: '站点',
    valueType: 'int',
    unit: '个',
    value: 10
  },
  port_forwarding: {
    name: '端口转发',
    valueType: 'int',
    unit: '个',
    value: 5
  },
  defense: {
    name: '防御',
    valueType: 'int',
    unit: 'G',
    value: 100,
    // 显示时，隐藏已使用
    hiddenUsed: true
  },
  sms: {
    name: '短信通知',
    valueType: 'int',
    unit: '条/月',
    value: 100,
    // 显示时，隐藏已使用
    hiddenUsed: true
  },

  live_data: {
    name: '实时数据',
    valueType: 'bool',
    value: '1'
  },
  monitor: {
    name: '流量监控',
    valueType: 'bool',
    value: '1'
  },
  private_waf: {
    name: '专属WAF',
    valueType: 'bool',
    value: '1'
  },
  public_waf: {
    name: '公共WAF',
    valueType: 'bool',
    value: '1'
  },
  ai_waf: {
    name: 'AI WAF',
    valueType: 'bool',
    value: '1'
  },
  custom_dns: {
    name: '自定义dns',
    valueType: 'bool',
    value: '1'
  },
  service: {
    name: '服务级别',
    valueType: 'text',
    value: '7x24专属服务'
  }
}

/**
 * @description: 产品属性对象、包含所有的
 */
export const productAttr1 = {
  charging_mode: {
    name: '计费方式',
    valueType: 'select',
    select: {
      1: '流量月结',
      2: '平均日峰带宽',
      3: '月95带宽'
    },
    value: 1
  },
  flow: {
    name: '流量月包',
    valueType: 'int',
    unit: 'G',
    value: 10
  },
  bandwidth: {
    name: '带宽单价',
    valueType: 'price_int',
    unit: 'Mbps/月',
    value: 20
  },

  ...productAttrObj
}
export function getProductAttr(key) {
  return productAttr1[key]
}
