export const STEP = 1000

export const STEP_MAP: Record<string, number> = {
    '5s': 5,
    '30s': 30,
    '1m': 60,
    '5m': 300,
    '1h': 3600,
    '6h': 21600,
    '12h': 43200,
    '1d': 86400,
  };

interface UnitResult {
  val: string
  unit: string
  label: string
}

// 计算动态单位通用函数
export const computedUnit = (
  value: number = 0,
  unitArr: string[] = [],
  step: number = STEP,
  precision: number = 2
): UnitResult => {
  let val = value
  if (val === 0) {
    return {
      val: '0',
      unit: unitArr[0] || '',
      label: `0${unitArr[0] || ''}`
    }
  }

  if (val < 1) val = 1

  const idx = Math.floor(Math.log(val) / Math.log(step))
  const labelValue = (val / Math.pow(step, idx)).toFixed(precision)

  return {
    val: labelValue,
    unit: unitArr[idx] || '',
    label: `${labelValue}${unitArr[idx] || ''}`
  }
}

// 带宽单位换算（bps）
export const bpsUnit = (value: number = 0): UnitResult => {
  return computedUnit(value, [
    'Bbps', 'Kbps', 'Mbps', 'Gbps', 'Tbps', 'Pbps', 'Ebps', 'Zbps', 'Ybps'
  ])
}

// 网络IO单位换算
export const networkUnit = (value: number = 0): UnitResult => {
  return computedUnit(value, [
    'bit', 'kbit', 'Mbit', 'Gbit', 'Tbit', 'Pbit', 'Ebit', 'Zbit', 'Ybit'
  ])
}

// 磁盘IO单位换算
export const diskUnit = (value: number = 0, precision: number = 2): UnitResult => {
  return computedUnit(value, [
    'B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'
  ], STEP, precision)
}

// 套餐流量单位（默认以 GB 输入，转换到合适单位显示）
export const flowUnit = (flow: number = 0): string => {
  const { label } = diskUnit(flow * Math.pow(STEP, 3), 0)
  return label
}

// 数值单位（万、十万、百万、千万、亿等）
export const numUnit = (value: number = 0): UnitResult => {
  return computedUnit(value, [
    '', '万', '十万', '百万', '千万', '亿', '十亿', '百亿', '千亿', '万亿'
  ], 10000, 0)
}