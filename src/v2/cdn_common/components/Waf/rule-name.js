// 表格操作逻辑
export const handleObj = {
  i: '包含',
  ui: '不包含',
  e: '等于',
  ue: '不等于',
  lge: '长度大于',
  le: '长度等于',
  lle: '长度小于',
  null: '不存在',
  ie: '=',
  ile: '<',
  ige: '>',
  ble: '<',
  beq: '=',
  bge: '>'
}

// 表格处置方式显示
export const wafOpObj = {
  forbid_return_code: {
    title: '拦截',
    name: '自定义错误码',
    type: 'auto',
    tag: 'danger'
  },
  forbid_forbid_request: {
    title: '拦截',
    name: '禁封时长',
    type: 'auto',
    unit: '分钟',
    tag: 'danger'
  },
  forbid_nfx_block_one: {
    title: '拦截',
    name: '单节点拉黑',
    type: 'auto',
    unit: '分钟',
    tag: 'danger'
  },
  forbid_nfx_block_all: {
    title: '拦截',
    name: '全节点拉黑',
    tag: 'danger'
  },
  rewrite_url: {
    title: '拦截',
    name: '302重定向',
    tag: 'danger'
  },
  forbid_pass_log: {
    title: '拦截',
    name: '记录日志后放行',
    tag: 'danger'
  },
  k_server_5s_sum: {
    title: '拦截',
    name: '5秒内请求数',
    type: 'auto',
    unit: '次',
    tag: 'danger'
  },
  verify_auto_reload: {
    title: '可疑',
    name: '无感验证',
    tag: 'warning'
  },
  verify_auto_reload_v2: {
    title: '可疑',
    name: '无感验证',
    tag: 'warning'
  },
  verify_click: {
    title: '可疑',
    name: '点击验证',
    tag: 'warning'
  },
  verify_click_v2: {
    title: '可疑',
    name: '点击验证',
    tag: 'warning'
  },
  verify_click_v2_style2: {
    title: '可疑',
    name: '点击验证V2',
    tag: 'warning'
  },
  verify_slide: {
    title: '可疑',
    name: '滑动验证',
    tag: 'warning'
  },
  verify_click_num: {
    title: '可疑',
    name: '数字验证',
    tag: 'warning'
  },
  verify_9grid: {
    title: '可疑',
    name: '字母验证',
    tag: 'warning'
  },
  verify_wait5s: {
    title: '可疑',
    name: '5秒验证',
    tag: 'warning'
  },
  verify_code: {
    title: '可疑',
    name: '验证码验证',
    tag: 'warning'
  },
  suspicious_pass_log: {
    title: '可疑',
    name: '记录日志后放行',
    tag: 'warning'
  },
  verify_check_token: {
    title: '可疑',
    name: 'API鉴权',
    tag: 'warning'
  },
  direct: {
    title: '可疑',
    name: '重试',
    tag: 'warning'
  },
  ignore: {
    title: '忽略',
    name: '指向下一个规则',
    tag: 'info'
  },
  pass: {
    title: '放行',
    name: '直接放行',
    tag: 'success'
  }
}

export const typeObj = {
  /** =============================
   *     [text]
   * =============================
   */
  ip: {
    name: 'IP',
    handle: ['e', 'ue', 'i', 'ui'],
    type: 'text',
    tips: '请输入IP，支持IPv4、IPv6格式，多个之间以 “ | ” 隔开'
  },
  s_port: {
    name: '请求端口',
    handle: ['e', 'ue'],
    type: 'text',
    tips: '请输入请求端口，多个之间以 “ | ” 隔开',
    default: ''
  },
  host: {
    name: '域名',
    handle: ['e', 'ue', 'i', 'ui'],
    type: 'text',
    tips: '请输入域名，多个之间以 “ | ” 隔开'
  },
  k_cname_type_info: {
    name: '别名数',
    handle: ['beq', 'ble', 'bge'],
    type: 'int',
    tips: 'number',
    max: 32,
    min: 1
  },
  uri: {
    name: 'URL',
    handle: ['e', 'ue', 'i', 'ui'],
    type: 'text',
    tips: '不需要带域名，以 “ / ” 开始'
  },
  exten: {
    name: '后缀',
    handle: ['e', 'ue', 'i', 'ui', 'null'],
    type: 'text',
    tips: 'input'
  },
  arg: {
    name: '请求参数',
    handle: ['e', 'ue', 'i', 'ui', 'null'],
    type: 'text',
    tips: '请输入请求参数，多个之间以 “ | ” 隔开'
  },
  ip_cookie_names: {
    name: 'FP',
    handle: ['e', 'ue', 'i', 'ui', 'null'],
    type: 'text',
    tips: '请输入FP'
  },
  user_agent: {
    name: 'User-Agent',
    handle: ['e', 'ue', 'i', 'ui', 'null'],
    type: 'text',
    tips: 'User-Agent，多个之间以 “ | ” 隔开'
  },
  geoip: {
    name: '访客区域',
    handle: ['e', 'ue', 'i', 'ui'],
    type: 'text',
    tips: '输入区域代码（多个之间以 “ | ” 隔开）'
  },
  referer: {
    name: 'Referer',
    handle: ['e', 'ue', 'i', 'ui', 'null'],
    type: 'text',
    tips: '多个之间以 “ | ” 隔开'
  },
  //  scheme: {
  //    name: '请求协议',
  //    handle: ['e', 'ue', 'i', 'ui'],
  //    type: 'text',
  //    tips: '请输入请求协议，如：http、https、ws、wss'
  //  },
  // 大写 GET、POST、HEAD、PUT、DELETE、CONNECT、OPTION、TRACE、PATCH
  method: {
    name: '请求类型',
    handle: ['e', 'ue', 'i', 'ui'],
    type: 'text',
    tips: 'select'
  },

  /** =============================
   *     [int]
   * =============================
   */
  request_length: {
    name: '请求长度',
    handle: ['ie', 'ige', 'ile'],
    type: 'int',
    tips: 'number'
  },
  k_body_length: {
    name: '内容长度',
    handle: ['ie', 'ige', 'ile'],
    type: 'int',
    tips: 'number'
  },
  head_cookies_success_sum: {
    name: '随机COOKIES验证成功数',
    handle: ['ie', 'ige', 'ile'],
    type: 'int',
    tips: 'number',
    unit: '次'
  },
  verify_fail_sum: {
    name: '人机验证失败数',
    handle: ['ie', 'ige', 'ile'],
    type: 'int',
    tips: 'number'
  },
  ip_join_time: {
    name: 'IP首次请求距今时间',
    handle: ['ie', 'ige', 'ile'],
    type: 'int',
    tips: 'number',
    unit: '秒'
  },
  ip_total: {
    name: 'IP总请求',
    handle: ['ie', 'ige', 'ile'],
    type: 'int',
    tips: 'number'
  },
  ip_1_sum: {
    name: 'IP近1分钟总请求',
    handle: ['ie', 'ige', 'ile'],
    type: 'int',
    tips: 'number'
  },
  ip_5_sum: {
    name: 'IP近1分钟回源热U',
    handle: ['ie', 'ige', 'ile'],
    type: 'int',
    tips: 'number'
  },
  server_5_sum: {
    name: 'IP近1分钟请求热U',
    handle: ['ie', 'ige', 'ile'],
    type: 'int',
    tips: 'number'
  },
  ip_404_sum: {
    name: 'IP近5分钟404数量',
    handle: ['ie', 'ige', 'ile'],
    type: 'int',
    tips: 'number'
  },
  ip_400_sum: {
    name: 'IP近5分钟400数量',
    handle: ['ie', 'ige', 'ile'],
    type: 'int',
    tips: 'number'
  },
  ip_cache_hit_sum: {
    name: 'IP缓存命中数量',
    handle: ['ie', 'ige', 'ile'],
    type: 'int',
    tips: 'number'
  },
  server_1_sum: {
    name: '站点近1分钟请求总数',
    handle: ['ie', 'ige', 'ile'],
    type: 'int',
    tips: 'number'
  },

  out_size: {
    name: '返回字节数',
    handle: ['ie', 'ige', 'ile'],
    type: 'int',
    tips: 'number'
  },

  // bin
  ip_content_type_info: {
    name: '文件类型数',
    handle: ['beq', 'ble', 'bge'],
    type: 'int',
    tips: 'number',
    max: 32,
    min: 1
  },
  ip_method_type_info: {
    name: '请求类型数',
    handle: ['beq', 'ble', 'bge'],
    type: 'int',
    tips: 'number',
    max: 32,
    min: 1
  },
  ip_url_hash_info: {
    name: 'URL类型数',
    handle: ['beq', 'ble', 'bge'],
    type: 'int',
    tips: 'number',
    max: 32,
    min: 1
  },

  // int
  ip_uri_n_sum: {
    name: 'URI频率数',
    handle: ['ie', 'ige', 'ile'],
    type: 'int',
    tips: 'number',
    default: 3,
    min: 1
  },

  ip_referer_verify: {
    name: '来源地址验证',
    handle: ['ie'],
    type: 'bool',
    tips: 'bool',
    default: 0
  }
  //  =====
  // c: {
  //   name: 'IP段',
  //   handle: ['e', 'ue', 'i', 'ui'],
  //   type: 'text',
  //   tips: '请输入IP，支持IPv4、IPv6格式，多个之间以 “ | ” 隔开'
  // },
  // g: {
  //   name: '服务端口',
  //   handle: ['e', 'ue', 'i', 'ui'],
  //   type: 'text',
  //   tips: '请输入IP，支持IPv4、IPv6格式，多个之间以 “ | ” 隔开'
  // },
  // j: {
  //   name: '请求协议',
  //   handle: ['e', 'ue', 'i', 'ui'],
  //   type: 'text',
  //   tips: '请输入IP，支持IPv4、IPv6格式，多个之间以 “ | ” 隔开'
  // }
}

// 表格匹配类型
export const _typeObj = {
  /** =============================
   *     [text]
   * =============================
   */
  url: {
    name: 'URL',
    //    handle: ['i', 'ui', 'e', 'ue'],
    handle: ['i', 'e', 'ue'],
    type: 'text',
    tips: '不需要带域名，以 “ / ” 开始'
  },
  ip: {
    name: 'IP',
    handle: ['e', 'ue'],
    type: 'text',
    tips: '请输入IP，支持IPv4、IPv6、CIDR（如 1.1.1.1/24）格式'
  },
  referer: {
    name: 'Referer',
    //    handle: ['i', 'ui', 'e', 'ue', 'null', 'lge', 'le', 'lle'],
    handle: ['i', 'e', 'ue', 'null', 'lge', 'le', 'lle'],
    type: 'text',
    tips: '多个之间以 “ | ” 隔开'
  },
  user_agent: {
    name: 'User-Agent',
    //    handle: ['e', 'ue', 'i', 'ui'],
    handle: ['e', 'ue', 'i'],
    type: 'text',
    tips: 'User-Agent'
  },
  area: {
    name: '访客区域',
    handle: ['e', 'ue'],
    type: 'text',
    tips: '输入区域代码（多个之间以 “ | ” 隔开）'
  },
  suffix: {
    name: '后缀',
    handle: ['e', 'ue'],
    type: 'text',
    tips: 'input'
  },
  return_code: {
    name: '返回状态码',
    handle: ['i'],
    type: 'object',
    tips: '选择返回状态码'
  },
  // 大写 GET、POST、HEAD、PUT、DELETE、CONNECT、OPTION、TRACE
  method: {
    name: '请求类型',
    handle: ['e', 'ue'],
    type: 'text',
    tips: 'select'
  },
  method_weight: {
    name: '请求类型比',
    handle: ['i'],
    type: 'object',
    tips: '选择请求类型比'
  },
  last_request_to_current_time: {
    name: '请求间隔时间',
    handle: ['ige', 'ile'],
    type: 'int',
    tips: 'number',
    unit: '秒'
  },
  ip_verification_fail_sum: {
    name: '人机验证失败数',
    handle: ['ige'],
    type: 'int',
    tips: 'number'
  },
  ip_suspicious_pass_time_long: {
    name: '验证通过距今时间',
    handle: ['ige', 'ile'],
    type: 'int',
    tips: 'number',
    unit: '秒'
  },
  // x_forwarded_for: {
  //     name: '检测代理',
  //     handle: ['e', 'ue', 'i', 'ui'],
  //     type: 'text',
  //     tips: '检测代理'
  // },
  ants_weight: {
    name: 'AS权重',
    handle: ['i'],
    type: 'object',
    tips: '选择AS权重'
  },
  ip_request_total: {
    name: '单IP请求总数',
    handle: ['ie', 'ile', 'ige'],
    type: 'int',
    tips: 'number'
  },
  ip_request_1m_sum: {
    name: '单IP近1分钟请求数',
    handle: ['ie', 'ile', 'ige'],
    type: 'int',
    tips: 'number'
  },
  server_request_1m_sum: {
    name: '站点近1分钟请求数',
    handle: ['ie', 'ile', 'ige'],
    type: 'int',
    tips: 'number'
  },
  ip_history_long: {
    name: '首次访问距今时间',
    handle: ['ie', 'ile', 'ige'],
    type: 'int',
    tips: 'number',
    unit: '秒'
  }

  // time: {
  //     name: '请求时间',
  //     handle: ['i', 'ui'],
  //     type: 'text',
  //     tips: 'select'
  // },
  // week: {
  //     name: '请求星期',
  //     handle: ['e', 'ue'],
  //     type: 'text',
  //     tips: 'select'
  // },

  // request_length: {
  //     name: '请求长度',
  //     handle: ['ie', 'ile', 'ige'],
  //     type: 'int',
  //     tips: 'number'
  // },

  // ip_uri_sum: {
  //     name: '单IP请求的文件数',
  //     handle: ['ie', 'ile', 'ige'],
  //     type: 'int',
  //     tips: 'number'
  // },

  // args: {
  //     name: '参数',
  //     handle: ['e', 'ue'],
  //     type: 'text',
  //     tips: 'input'
  // },
  // args_sum: {
  //     name: '参数数量',
  //     handle: ['ie', 'ile', 'ige'],
  //     type: 'int',
  //     tips: 'number'
  // },
  // cookies: {
  //     name: 'cookies',
  //     handle: ['e', 'ue'],
  //     type: 'text',
  //     tips: 'input'
  // },
  // cookies_sum: {
  //     name: 'cookies个数',
  //     handle: ['ie', 'ile', 'ige'],
  //     type: 'int',
  //     tips: 'number'
  // },

  /** =============================
   *     [int]
   * =============================
   */
  // header_size: {
  //     name: '请求头大小',
  //     handle: ['ie', 'ile', 'ige'],
  //     type: 'int',
  //     tips: 'number'
  // },
  // header_list_size: {
  //     name: '请求头列数',
  //     handle: ['ie', 'ile', 'ige'],
  //     type: 'int',
  //     tips: 'number'
  // },

  // all_record_request_use_times: {
  //     name: '近x次请求用时总计',
  //     handle: ['ie', 'ile', 'ige'],
  //     type: 'int',
  //     tips: 'number'
  // },

  // ip_request_1d_sum: {
  //     name: 'IP近1天请求总数',
  //     handle: ['ie', 'ile', 'ige'],
  //     type: 'int',
  //     tips: 'number'
  // },
  // ip_request_1h_sum: {
  //     name: 'IP近1小时请求总数',
  //     handle: ['ie', 'ile', 'ige'],
  //     type: 'int',
  //     tips: 'number'
  // },

  // ip_request_power: {
  //     name: 'IP在近x次请求占比',
  //     handle: ['ie', 'ile', 'ige'],
  //     type: 'int',
  //     tips: 'number'
  // },

  // server_request_1d_sum: {
  //     name: '站点近1天请求总数',
  //     handle: ['ie', 'ile', 'ige'],
  //     type: 'int',
  //     tips: 'number'
  // },
  // server_request_1h_sum: {
  //     name: '站点近1小时请求总数',
  //     handle: ['ie', 'ile', 'ige'],
  //     type: 'int',
  //     tips: 'number'
  // },
  // server_request_1m_sum: {
  //     name: '站点近1分钟请求总数',
  //     handle: ['ie', 'ile', 'ige'],
  //     type: 'int',
  //     tips: 'number'
  // },
  // server_request_total: {
  //     name: '站点请求总数',
  //     handle: ['ie', 'ile', 'ige'],
  //     type: 'int',
  //     tips: 'number'
  // },

  // uri_ip_sum: {
  //     name: 'url在近x次请求中的ip的数量',
  //     handle: ['ie', 'ile', 'ige'],
  //     type: 'int',
  //     tips: 'number'
  // },
  // uri_request_1d_sum: {
  //     name: 'url近1天请求总数',
  //     handle: ['ie', 'ile', 'ige'],
  //     type: 'int',
  //     tips: 'number'
  // },
  // uri_request_1h_sum: {
  //     name: 'url近1小时请求总数',
  //     handle: ['ie', 'ile', 'ige'],
  //     type: 'int',
  //     tips: 'number'
  // },
  // uri_request_1m_sum: {
  //     name: 'url近1分钟请求总数',
  //     handle: ['ie', 'ile', 'ige'],
  //     type: 'int',
  //     tips: 'number'
  // },
  // uri_request_power: {
  //     name: 'url在近x次请求占比',
  //     handle: ['ie', 'ile', 'ige'],
  //     type: 'int',
  //     tips: 'number'
  // },
  // uri_request_total: {
  //     name: 'url请求总数',
  //     handle: ['ie', 'ile', 'ige'],
  //     type: 'int',
  //     tips: 'number'
  // }

  /** =============================
   *     [bool] 返回 0|1
   * =============================
   */
  // history_return_2xx_code: {
  //     name: '状态码2xx',
  //     handle: ['ie'],
  //     type: 'bool',
  //     tips: '当前url 2xx返回0|1'
  // },
  // history_return_3xx_code: {
  //     name: '状态码3xx',
  //     handle: ['ie'],
  //     type: 'bool',
  //     tips: '当前url 3xx返回0|1'
  // },
  // history_return_4xx_code: {
  //     name: '状态码4xx',
  //     handle: ['ie'],
  //     type: 'bool',
  //     tips: '当前url 4xx返回0|1'
  // },
  // history_return_5xx_code: {
  //     name: '状态码5xx',
  //     handle: ['ie'],
  //     type: 'bool',
  //     tips: '当前url 5xx返回0|1'
  // }
}
