// 进制 1000 | 1024
export const STEP = 1000

// 带宽单位换算 bps(比特每秒)  带宽 = 流量 * 8 / 秒数
// 流量 * 8；字节(B) 转换为比特(bits), 如 10B * 8 = 80 bits
export const bpsUnit = (value = 0) => {
  return computedUnit(value, [
    'Bbps',
    'Kbps',
    'Mbps',
    'Gbps',
    'Tbps',
    'Pbps',
    'Ebps',
    'Zbps',
    'Ybps'
  ])
}

// 网络IO单位换算
export const networkUnit = (value = 0) => {
  return computedUnit(value, [
    'bit',
    'kbit',
    'Mbit',
    'Gbit',
    'Tbit',
    'Pbit',
    'Ebit',
    'Zbit',
    'Ybit'
  ])
}

// 磁盘IO单位换算
export const diskUnit = (value = 0, precision = 2) => {
  return computedUnit(
    value,
    ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    STEP,
    precision
  )
}

// 计算套餐流量单位：
// 默认为 GB，1000 = TB, 1000 * 1000 = PB
export const flowUnit = (flow = 0) => {
  // 需要将 GB 转换为 B 进行计算
  const { label } = diskUnit(flow * Math.pow(STEP, 3), 0)
  return label
}

// 动态计算数值单位 万，十万，百万，千万，亿
export const numUnit = (value = 0) => {
  return computedUnit(
    value,
    ['', '万', '十万', '百万', '千万', '亿', '十亿', '百亿', '千亿', '万亿'],
    10000,
    0
  )
}

/**
 *  动态计算单位
 * @param {*} value 数值
 * @param {*} unitArr 单位数组
 * @param {*} step 步长
 * @param {*} precision 精度，保留小数位数
 * @returns
 */
export function computedUnit(
  value = 0,
  unitArr = [],
  step = STEP,
  precision = 2
) {
  let val = value
  if (val == 0) {
    return {
      val: 0,
      unit: unitArr[0],
      label: `0${unitArr[0]}`
    }
  }
  // 避免出现NAN
  if (val < 1) val = 1

  // 索引
  const idx = Math.floor(Math.log(val) / Math.log(step))
  // 计算值，并取整
  const labelValue = (val / Math.pow(step, idx)).toFixed(precision)
  return {
    val: labelValue,
    unit: unitArr[idx] || '',
    label: `${labelValue}${unitArr[idx] || ''}`
  }
}
