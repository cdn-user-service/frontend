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
    ige: '>'
}

export const typeObj = {
  /** =============================
   *     [text]
   * =============================
   */
  url: {
    name: 'URL',
    handle: ['i', 'ui', 'e', 'ue'],
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
    handle: ['i', 'ui', 'e', 'ue', 'null', 'lge', 'le', 'lle'],
    type: 'text',
    tips: '不填写指 Referer 为空（多个之间以 “ | ” 隔开）'
  },
  area: {
    name: '访客区域',
    handle: ['e', 'ue'],
    type: 'text',
    tips: '输入区域代码（多个之间以 “ | ” 隔开）'
  },
  time: {
    name: '请求时间',
    handle: ['i', 'ui'],
    type: 'text',
    tips: 'select'
  },
  week: {
    name: '请求星期',
    handle: ['e', 'ue'],
    type: 'text',
    tips: 'select'
  },
  suffix: {
    name: '后缀',
    handle: ['e', 'ue'],
    type: 'text',
    tips: 'input'
  },
  // 大写 GET、POST、HEAD、PUT、DELETE、CONNECT、OPTION、TRACE
  method: {
    name: '请求方法',
    handle: ['e', 'ue'],
    type: 'text',
    tips: 'select'
  },
  user_agent: {
    name: 'user-agent',
    handle: ['e', 'ue'],
    type: 'text',
    tips: 'input'
  },
  // code: {
  //     name: '返回状态码',
  //     handle: ['e', 'ue'],
  //     type: 'text',
  //     tips: 'select'
  // },

  args: {
    name: '参数',
    handle: ['e', 'ue'],
    type: 'text',
    tips: 'input'
  },
  args_sum: {
    name: '参数数量',
    handle: ['ie', 'ile', 'ige'],
    type: 'int',
    tips: 'number'
  },
  cookies: {
    name: 'cookies',
    handle: ['e', 'ue'],
    type: 'text',
    tips: 'input'
  },
  cookies_sum: {
    name: 'cookies个数',
    handle: ['ie', 'ile', 'ige'],
    type: 'int',
    tips: 'number'
  },

  /** =============================
   *     [int]
   * =============================
   */
  header_size: {
    name: '请求头大小',
    handle: ['ie', 'ile', 'ige'],
    type: 'int',
    tips: 'number'
  },
  header_list_size: {
    name: '请求头列数',
    handle: ['ie', 'ile', 'ige'],
    type: 'int',
    tips: 'number'
  },
  request_length: {
    name: '请求长度',
    handle: ['ie', 'ile', 'ige'],
    type: 'int',
    tips: 'number'
  },
  k_body_length: {
    name: '内容长度',
    handle: ['ie', 'ile', 'ige'],
    type: 'int',
    tips: 'number'
  },
  k_cname_type_info: {
    name: '别名数',
    handle: ['ie', 'ile', 'ige'],
    type: 'int',
    tips: 'number'
  },
  all_record_request_use_times: {
    name: '近x次请求用时总计',
    handle: ['ie', 'ile', 'ige'],
    type: 'int',
    tips: 'number'
  },

  ip_request_1d_sum: {
    name: 'IP近1天请求总数',
    handle: ['ie', 'ile', 'ige'],
    type: 'int',
    tips: 'number'
  },
  ip_request_1h_sum: {
    name: 'IP近1小时请求总数',
    handle: ['ie', 'ile', 'ige'],
    type: 'int',
    tips: 'number'
  },
  ip_request_1m_sum: {
    name: 'IP近1分钟请求总数',
    handle: ['ie', 'ile', 'ige'],
    type: 'int',
    tips: 'number'
  },
  ip_request_power: {
    name: 'IP在近x次请求占比',
    handle: ['ie', 'ile', 'ige'],
    type: 'int',
    tips: 'number'
  },
  ip_request_total: {
    name: 'IP请求总数',
    handle: ['ie', 'ile', 'ige'],
    type: 'int',
    tips: 'number'
  },
  ip_uri_sum: {
    name: 'IP在近x次请求中的uri数量',
    handle: ['ie', 'ile', 'ige'],
    type: 'int',
    tips: 'number'
  },

  server_request_1d_sum: {
    name: '站点近1天请求总数',
    handle: ['ie', 'ile', 'ige'],
    type: 'int',
    tips: 'number'
  },
  server_request_1h_sum: {
    name: '站点近1小时请求总数',
    handle: ['ie', 'ile', 'ige'],
    type: 'int',
    tips: 'number'
  },
  server_request_1m_sum: {
    name: '站点近1分钟请求总数',
    handle: ['ie', 'ile', 'ige'],
    type: 'int',
    tips: 'number'
  },
  server_request_total: {
    name: '站点请求总数',
    handle: ['ie', 'ile', 'ige'],
    type: 'int',
    tips: 'number'
  },

  uri_ip_sum: {
    name: 'url在近x次请求中的ip的数量',
    handle: ['ie', 'ile', 'ige'],
    type: 'int',
    tips: 'number'
  },
  uri_request_1d_sum: {
    name: 'url近1天请求总数',
    handle: ['ie', 'ile', 'ige'],
    type: 'int',
    tips: 'number'
  },
  uri_request_1h_sum: {
    name: 'url近1小时请求总数',
    handle: ['ie', 'ile', 'ige'],
    type: 'int',
    tips: 'number'
  },
  uri_request_1m_sum: {
    name: 'url近1分钟请求总数',
    handle: ['ie', 'ile', 'ige'],
    type: 'int',
    tips: 'number'
  },
  uri_request_power: {
    name: 'url在近x次请求占比',
    handle: ['ie', 'ile', 'ige'],
    type: 'int',
    tips: 'number'
  },
  uri_request_total: {
    name: 'url请求总数',
    handle: ['ie', 'ile', 'ige'],
    type: 'int',
    tips: 'number'
  }

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
