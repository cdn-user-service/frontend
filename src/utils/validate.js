import Vue from 'vue'
import { windowTranslateTitle } from './i18n'

/**
 * @description 判断是否为对象
 */
export function isObject(val) {
  return (
    Object.prototype.toString.call(val) === '[object Object]' && val !== null
  )
}

/**
 * @description 判断是否是数组
 */
export function isArray(val) {
  if (typeof Array.isArray === 'undefined') {
    return Object.prototype.toString.call(val) === '[object Array]'
  }
  return Array.isArray(val)
}

/**
 * @description 判断是否为json
 */
export function isJson(val) {
  if (typeof val === 'string') {
    const obj = JSON.parse(val)
    return !!(typeof obj === 'object' && obj)
  }
  return false
}

/**
 * @description 判断是否为空
 * @param value
 * @returns {boolean}
 */
export function isBlank(value) {
  return (
    value === null ||
    false ||
    value === '' ||
    value.trim() === '' ||
    value.toLocaleLowerCase().trim() === 'null'
  )
}

/**
 * @description: 验证普通域名
 */
export function isDomain(val) {
  const reg = /^(?=^.{3,255}$)(\*|[a-zA-Z0-9][-a-zA-Z0-9]{0,62})(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/
  return reg.test(val)
}

/**
 * @description: 验证 ipv4
 */
export function isIpv4(val) {
  const reg = /^((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/
  return reg.test(val)
}

/**
 * @description: 验证 ipv6
 */
export function isIpv6(val) {
  const reg = /^([\da-fA-F]{1,4}:){6}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^::([\da-fA-F]{1,4}:){0,4}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:):([\da-fA-F]{1,4}:){0,3}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){2}:([\da-fA-F]{1,4}:){0,2}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){3}:([\da-fA-F]{1,4}:){0,1}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){4}:((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){7}[\da-fA-F]{1,4}$|^:((:[\da-fA-F]{1,4}){1,6}|:)$|^[\da-fA-F]{1,4}:((:[\da-fA-F]{1,4}){1,5}|:)$|^([\da-fA-F]{1,4}:){2}((:[\da-fA-F]{1,4}){1,4}|:)$|^([\da-fA-F]{1,4}:){3}((:[\da-fA-F]{1,4}){1,3}|:)$|^([\da-fA-F]{1,4}:){4}((:[\da-fA-F]{1,4}){1,2}|:)$|^([\da-fA-F]{1,4}:){5}:([\da-fA-F]{1,4})?$|^([\da-fA-F]{1,4}:){6}:$/
  return reg.test(val)
}

/**
 * @description: 验证 ip CIDR
 */
export function isIpCIDR(val) {
  const reg = /^(?:(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\/([1-9]|[1-2]\d|3[0-2])$/
  return reg.test(val)
}

/**
 * @description: 验证 ip，包含 IPv4 和 IPv6、子网掩码
 */
export function isIp(val) {
  return isIpv4(val) || isIpv6(val) || isIpCIDR(val)
}

/**
 * @description: 验证 端口号
 */
export function isPort(val) {
  // const reg = /^([1-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-5]{2}[0-3][0-5])$/
  // return reg.test(val)
  return Number.isInteger(+val) && val > 0 && val < 65535
}

/**
 * @description: 验证 URL 地址
 */
export function isUrl(val) {
  const reg = /^((http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-.,@?^=%&amp;:/~+#]*[\w\-@?^=%&amp;/~+#])?)|\/$/
  return reg.test(val)
}

/**
 * @description: 验证 手机号，放得比较宽，有些境外的号码格式。。。
 */
export function isTel(val) {
  // const reg = /^(0|86|175951)?(13[0-9]|15[0-9]|17[0-9]|18[0-9]|14[57]|19[0123456789]|16[0123456789])[0-9]{8}$/
  // const reg = /^(0|86|175951)?(1[3456789][0-9])[0-9]{8}$/
  const reg = /^1[0-9]{4,20}$/
  return reg.test(val)
}

/**
 * @description: 验证 电子邮箱
 */
export function isEmail(val) {
  // const reg = /^([a-zA-Z0-9._-+])+@([a-zA-Z0-9_-].)+(\.[a-zA-Z0-9_-.])+/
  const reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
  return reg.test(val)
}

/**
 * @description: 验证 密码，非中文，特殊符号没有判断
 */
export function isPassword(val) {
  const reg = /^[^\u4e00-\u9fa5]{4,32}$/
  return reg.test(val)
}

/**
 * @description: 验证 用户名称，
 */
export function isName(val) {
  const reg = /^[a-zA-Z0-9@._-]{4,32}$/
  return reg.test(val)
}

/**
 * @description 验证 身份证号(第二代)
 */
export function isIdCard(val) {
  const reg = /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
  return reg.test(val)
}

/** =============================
 *  @description: 统一快捷验证
 *  =============================
 */
const validator = {
  // 验证普通域名
  isDomain: text => {
    return (rule, value, callback) => {
      if (isDomain(value)) return callback()
      callback(new Error(text || '域名格式错误'))
    }
  },
  // 验证 ip，包含 IPv4 和 IPv6
  isIp: text => {
    return (rule, value, callback) => {
      if (value === undefined || value === '') return callback()
      if (isIp(value)) return callback()
      callback(new Error(text || 'IP格式错误'))
    }
  },
  // 验证 ipv4
  isIpv4: text => {
    return (rule, value, callback) => {
      if (isIpv4(value)) return callback()
      callback(new Error(text || 'IPv4格式错误'))
    }
  },
  // 验证 ipv6
  isIpv6: text => {
    return (rule, value, callback) => {
      if (isIpv6(value)) return callback()
      callback(new Error(text || 'IPv6格式错误'))
    }
  },
  // 验证 端口号
  isPort: text => {
    return (rule, value, callback) => {
      if (value === undefined || value === '') return callback()
      if (isPort(value)) return callback()
      callback(new Error(text || '端口号格式错误（1~65535）'))
    }
  },
  // 验证 URL 地址
  isUrl: text => {
    return (rule, value, callback) => {
      if (isUrl(value)) return callback()
      callback(new Error(text || 'URL地址格式错误'))
    }
  },
  // 验证 手机号
  isTel: text => {
    return (rule, value, callback) => {
      if (isTel(value)) return callback()
      callback(new Error(text || '手机号格式错误'))
    }
  },
  // 验证 电子邮箱
  isEmail: text => {
    return (rule, value, callback) => {
      if (isEmail(value)) return callback()
      callback(new Error(text || '邮箱地址格式错误'))
    }
  },
  // 验证 密码
  isPassword: text => {
    return (rule, value, callback) => {
      if (isPassword(value)) return callback()
      callback(
        new Error(
          text ||
            `${windowTranslateTitle('密码格式错误，不能包含中文')}（4~32）`
        )
      )
    }
  },
  // 验证 用户名称
  isName: text => {
    return (rule, value, callback) => {
      if (isName(value)) return callback()
      callback(new Error(text || '名称格式错误，不能包含中文（4~32）'))
    }
  },
  // 验证 身份证号(第二代)
  isIdCard: text => {
    return (rule, value, callback) => {
      if (isIdCard(value)) return callback()
      callback(new Error(text || '二代身份证格式错误'))
    }
  },
  // 验证 textarea一行一个域名格式，且不能重复
  isDomains: (text = '域名') => {
    return (rule, value, callback) => {
      if (value === undefined || value === '') return callback()

      // 将数据拆分成一行一个
      const newArr = (value || '').trim().split(/[\r\n]+/)

      // 是否正确的格式
      let isOk = false
      // 临时数组，用于判读域名是否重复
      const nowArr = []

      // 遍历域名数组
      newArr.every((item, idx) => {
        const itemTrim = item.trim()
        isOk = isDomain(itemTrim)
        if (!isOk) {
          callback(new Error(text + '格式不正确：' + itemTrim))
          return isOk
        }

        // 判断域名是否重复，如果当前域名在数组中第一次出现的位置不是 i，则认为该域名重复
        nowArr[idx] = itemTrim // 将数据存入临时数组
        if (nowArr.indexOf(itemTrim) != idx) {
          isOk = false
          callback(new Error(text + '不能重复：' + itemTrim))
        }
        return isOk
      })

      if (isOk) callback()
    }
  },
  // 验证 textarea一行一个IP格式，且不能重复
  isIps: (onlyIpv4 = false) => {
    return (rule, value, callback) => {
      if (value === undefined || value === '') return callback()

      // 将数据拆分成一行一个
      const newArr = (value || '').trim().split(/[\r\n]+/)

      // 是否正确的格式
      let isOk = false
      // 临时数组，用于判读IP是否重复
      const nowArr = []

      // 遍历IP数组
      newArr.every((item, idx) => {
        const itemTrim = item.trim()
        if (onlyIpv4) {
          isOk = isIpv4(itemTrim)
        } else {
          isOk = isIp(itemTrim)
        }
        if (!isOk) {
          callback(new Error('IP格式不正确：' + itemTrim))
          return isOk
        }

        // 判断IP是否重复，如果当前IP在数组中第一次出现的位置不是 i，则认为该IP重复
        nowArr[idx] = itemTrim // 将数据存入临时数组
        if (nowArr.indexOf(itemTrim) != idx) {
          isOk = false
          callback(new Error('IP不能重复：' + itemTrim))
        }
        return isOk
      })

      if (isOk) callback()
    }
  }
}

Vue.prototype.$validator = validator

Vue.prototype.$valid = {
  isObject,
  isArray,
  isJson
}
