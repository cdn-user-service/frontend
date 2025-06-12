let vm = {}

// 验证主机记录
const checkTop = (rule, value, callback) => {
  const regTop = /^[^\u4e00-\u9fa5]+$/
  if (!regTop.test(value)) {
    return callback(new Error('主机记录格式错误，不能包含中文字符'))
  }
  callback()
}

// 验证权重
const checkWeight = (rule, value, callback) => {
  if (value < 1 || value > 10) {
    return callback(new Error('权重值应为 1~10 的整数'))
  }
  callback()
}

// 验证mx
const checkMx = (rule, value, callback) => {
  if (value < 1 || value > 10) {
    return callback(new Error('mx值应为 1~10 的整数'))
  }
  callback()
}

// 验证 TTL为 正整数
const checkTTL = (rule, value, callback) => {
  if (value < 1 || value > 604800) {
    return callback(new Error('TTL值范围应在 1 ~ 604800'))
  }
  callback()
}

// 根据所选记录类型验证记录值
const checkRecordValue = (rule, value, callback) => {
  // 1、当记录类型为 A记录，记录值为 IP地址
  const checkA =
    /^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/
  // 2、当记录类型为 CNAME记录，记录值为 域名
  const checkCNAME =
    /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})*(\.[a-zA-Z0-9]{2,20})$/
  // 3、当记录类型为 MX记录，记录值为 域名 或者 IP地址
  // const checkMX =
  // 4、当记录类型为 TXT记录，记录值暂不验证
  // const checkTXT =
  // 5、当记录类型为 NS记录，记录值为 DNS域名
  // const checkNS = /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/
  // 6、当记录类型为 AAAA记录，记录值为 ipv6地址
  const checkAAAA =
    /^([\da-fA-F]{1,4}:){6}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^::([\da-fA-F]{1,4}:){0,4}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:):([\da-fA-F]{1,4}:){0,3}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){2}:([\da-fA-F]{1,4}:){0,2}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){3}:([\da-fA-F]{1,4}:){0,1}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){4}:((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){7}[\da-fA-F]{1,4}$|^:((:[\da-fA-F]{1,4}){1,6}|:)$|^[\da-fA-F]{1,4}:((:[\da-fA-F]{1,4}){1,5}|:)$|^([\da-fA-F]{1,4}:){2}((:[\da-fA-F]{1,4}){1,4}|:)$|^([\da-fA-F]{1,4}:){3}((:[\da-fA-F]{1,4}){1,3}|:)$|^([\da-fA-F]{1,4}:){4}((:[\da-fA-F]{1,4}){1,2}|:)$|^([\da-fA-F]{1,4}:){5}:([\da-fA-F]{1,4})?$|^([\da-fA-F]{1,4}:){6}:$/
  // 7、当记录类型为 SRV记录，记录值格式：优先级、空格、权重、空格、端口、空格、主机名，例如： 1 1 8080 ns1.antscdn.com
  const checkSRV =
    /^([1-9]|10)\s([1-9]|10)\s([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-5]{2}[0-3][0-5])\s([a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})*(\.[a-zA-Z0-9]{2,20}))$/
  // 8、当记录类型为 CAA记录，记录值格式：flag tag value。 其中flag目前取值为0-128；tag取值为issue、issuewild、iodef；value为CA的域名或用于违规通知的电子邮箱。例如：12 iodef www.antscdn.com
  const checkCAA =
    /^([0-9]|[1-9][0-9]|1[0-2][0-8]|109|119)\s(issue|issuewild|iodef)\s([^\u4e00-\u9fa5|"<>\\\s]+)$/

  if (vm.tableForm.record_type === 'A' && !checkA.test(value)) {
    return callback(new Error('请填写您服务器 IPv4地址'))
  }

  if (vm.tableForm.record_type === 'CNAME' && !checkCNAME.test(value)) {
    return callback(new Error('请填写一个域名，如：www.' + vm.domain))
  }

  if (
    vm.tableForm.record_type === 'MX' &&
    !checkA.test(value) &&
    !checkCNAME.test(value)
  ) {
    return callback(
      new Error(
        '填写企业邮局给您提供的域名或者服务器IP，如果您不知道，请咨询您的邮件服务提供商'
      )
    )
  }

  if (vm.tableForm.record_type === 'NS' && !checkCNAME.test(value)) {
    return callback(new Error('请填写DNS域名，如：ns1.' + vm.domain))
  }

  if (vm.tableForm.record_type === 'AAAA' && !checkAAAA.test(value)) {
    return callback(new Error('请填写您服务器 IPv6地址'))
  }

  if (vm.tableForm.record_type === 'SRV' && !checkSRV.test(value)) {
    return callback(new Error('请填写正确的 SRV 记录值，格式请参考提示信息'))
  }

  if (vm.tableForm.record_type === 'CAA' && !checkCAA.test(value)) {
    return callback(
      new Error(
        '请填写正确的 CAA 记录值，不能包含中文字符、""、<>、|，格式请参考提示信息'
      )
    )
  }

  callback()
}

// 用于获取 this实例
const senThis = (_this) => {
  vm = _this
}

export default {
  top: [
    {
      required: true,
      message: '请输入主机记录',
      trigger: ['blur', 'change']
    }
    //   {
    //     validator: checkTop,
    //     trigger: 'blur'
    //   }
  ],
  record_type: [
    {
      required: true,
      message: '请选择记录类型',
      trigger: ['blur', 'change']
    }
  ],
  line: [
    {
      required: true,
      message: '请选择线路类型',
      trigger: ['blur', 'change']
    }
  ],
  value: [
    {
      required: true,
      message: '请输入记录值',
      trigger: ['blur', 'change']
    }
    // {
    //   validator: checkRecordValue,
    //   trigger: 'blur'
    // }
  ],
  weight: [
    {
      required: true,
      message: '请输入权重',
      trigger: ['blur', 'change']
    }
    // {
    //   validator: checkWeight,
    //   trigger: 'blur'
    // }
  ],
  mx: [
    {
      required: true,
      message: '请输入MX',
      trigger: ['blur', 'change']
    }
    // {
    //   validator: checkMx,
    //   trigger: 'blur'
    // }
  ],
  ttl: [
    {
      required: true,
      message: '请输入TTL',
      trigger: ['blur', 'change']
    }
    // {
    //   validator: checkTTL,
    //   trigger: 'blur'
    // }
  ]
}
