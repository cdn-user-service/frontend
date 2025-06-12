import Vue from 'vue'
// 导入lodash
import _ from 'lodash'
import { STEP } from '@/utils/unit'

const dayjs = require('dayjs')

/**
 * @description: 简化批量删除
 * @param {*} selectArrLength: 选中数组长度， msg 提示信息
 */
export async function batchDelete(
  selectArrLength = [],
  msg = {
    tag: '数据',
    title: '',
    content: ''
  }
) {
  if (!selectArrLength) {
    this.$msg.warning('请选择要删除的' + msg.tag)
    return false
  }

  const confirmResult = await this.$confirm(msg.title || `批量删除${msg.tag}`, {
    title: msg.title || `批量删除${msg.tag}`,
    message:
      msg.content ||
      `该操作将永久删除 ${selectArrLength} 个${msg.tag}，是否继续？`,
    type: msg.type || 'error',
    center: true
  }).catch(err => err)
  if (confirmResult !== 'confirm') {
    this.$msg.info(this.antsT('已取消操作'))
    return false
  }
  return true
}

/**
 * @description: 单个删除
 */
export async function doDelete(
  msg = {
    name: '',
    tag: '数据',
    title: '',
    content: '',
    type: 'error',
    confirmButtonText: '确定'
  }
) {
  const confirmResult = await this.$confirm(msg.title || `删除${msg.tag}`, {
    title: msg.title || `删除${msg.tag}`,
    message:
      msg.content ||
      (msg.name
        ? `该操作将永久删除${msg.tag}“ <strong class="error_color"> ${msg.name} </strong> ”，是否继续？`
        : `该操作将永久删除该${msg.tag}，是否继续？`),
    dangerouslyUseHTMLString: true,
    center: true,
    type: msg.type || 'error',
    confirmButtonText: msg.confirmButtonText
  }).catch(err => err)

  if (confirmResult !== 'confirm') {
    this.$msg.info(this.antsT('已取消操作'))
    return false
  }
  return true
}

/**
 * @description: 全局时间格式化过滤器
 */
export function dateFormatFun(originVal = 0, format = 'YYYY-MM-DD HH:mm:ss') {
  return dayjs(originVal).format(format)
}

/**
 * @description: 全局 金额 格式化过滤器, 保留两位小数, 三位一逗号，
 *  @price 金额 ，分为单位
 */
// 价格单位
const priceUnit = (window.config || {}).priceUnit || '￥'
export function priceFormatFun(price = 0, unit = '') {
  if (typeof price !== 'number') {
    price = Number(price)
  }
  // 如果为非数字
  if (isNaN(price)) price = 0

  const priceVal = _.round(price / 100, 2)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  return !unit ? `${priceUnit}${priceVal}` : `${priceVal}${unit}`
}

/**
 * @description: 流量动态设置单位，B
 */

export function flowUnit(val = 0) {
  let obj = {
    value: '0.00',
    unit: 'KB',
    pow: 0
  }
  if (val == 0) return obj
  // 用于计算 IDX，避免出现 NaN
  let computedIdxVal = val
  if (computedIdxVal < 1) {
    computedIdxVal = 1
  }

  const UNIT = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const IDX = Math.floor(Math.log(computedIdxVal) / Math.log(STEP))

  // 如果单位为 B ，则返回 KB
  if (IDX == 0) {
    obj = {
      value: Math.ceil((val / STEP / Math.pow(STEP, IDX)) * 100) / 100,
      unit: 'KB',
      pow: 1
    }
  } else {
    obj = {
      // 向上取整，保留两位小数
      value: Math.ceil((val / Math.pow(STEP, IDX)) * 100) / 100 + '',
      unit: UNIT[IDX],
      // 几次幂
      pow: IDX
    }
  }
  return obj
}

/**
 * @description: 带宽动态设置单位
 * step 粒度，以秒为单位
 * val 传递过来的是流量，要先转换为带宽
 */

export function bpsUnit(val = 0, step = 1) {
  let obj = {
    value: 0,
    unit: 'Kbps',
    pow: 0
  }
  if (val == 0) return obj

  const UNIT = [
    'Bbps',
    'Kbps',
    'Mbps',
    'Gbps',
    'Tbps',
    'Pbps',
    'Ebps',
    'Zbps',
    'Ybps'
  ]

  // 根据流量计算带宽，带宽 = 流量 * 8 / 粒度，
  const BANDWIDTH = (val * 8) / step

  // 用于计算 IDX，避免出现 NaN
  let computedIdxVal = BANDWIDTH
  if (computedIdxVal < 1) {
    computedIdxVal = 1
  }

  const IDX = Math.floor(Math.log(computedIdxVal) / Math.log(STEP))

  // 如果单位为 Bbps ，则返回 Kbps
  if (IDX == 0) {
    obj = {
      // 向上取整，保留两位小数
      value: Math.ceil((BANDWIDTH / STEP / Math.pow(STEP, IDX)) * 100) / 100,
      unit: 'Kbps',
      // 几次幂
      pow: 1
    }
  } else {
    obj = {
      // 向上取整，保留两位小数
      value: Math.ceil((BANDWIDTH / Math.pow(STEP, IDX)) * 100) / 100,
      unit: UNIT[IDX],
      // 几次幂
      pow: IDX
    }
  }

  return obj
}

Vue.filter('dateFormat', dateFormatFun)
Vue.filter('priceFormat', priceFormatFun)

Vue.prototype.$_ = _
Vue.prototype.$dayjs = dayjs

Vue.prototype.$batchDelete = batchDelete
Vue.prototype.$doDelete = doDelete
