<template>
  <div>
    <ConfForm
      ref="ConfFormRef"
      title="HTTP"
      :group-str="groupStr"
      :base-data="baseData"
    />
  </div>
</template>

<script>
import ConfForm from '../components/ConfForm'

const baseData = {
  custom_server_head: {
    type: 'text',
    default: '',
    name: '',
    tips: '自定义server头'
  },
  ants_waf_export_memory_buffer: {
    type: 'text',
    default: '2m',
    name: '',
    tips: '导出数据缓存区(默认2m)'
  },
  client_max_body_size: {
    type: 'text',
    default: '5m',
    name: '',
    tips: '客户端请求服务器最大允许大小（默认5M）'
  },
  keepalive_requests: {
    type: 'int',
    default: 10000,
    name: '',
    tips: '最大连接数（默认10000）'
  },
  keepalive_timeout: {
    type: 'int',
    default: 60,
    name: '',
    tips: '空闲最大超时时间（默认60'
  },
  large_client_header_buffers: {
    type: 'text',
    default: '4 32k',
    name: '',
    tips: '请求行+请求头 缓冲大小（默认4 32k）'
  },
  resolver: {
    type: 'text',
    default: '223.5.5.5 8.8.8.8 valid=600 ipv6=off',
    name: '',
    tips: '域名解析地址（默认 223.5.5.5 8.8.8.8 valid=600 ipv6=off;）'
  },
  resolver_timeout: {
    type: 'text',
    default: '5s',
    name: '',
    tips: '解析超时时间（默认5s）'
  },
  server_names_hash_bucket_size: {
    type: 'int',
    default: 512,
    name: '',
    tips: '存储server bucket缓存区（默认512）'
  },
  server_names_hash_max_size: {
    type: 'int',
    default: 512,
    name: '',
    tips: '存储server缓存区（默认512）'
  },
  // 默认为空
  default_forbid_rule: {
    type: 'text',
    default: '',
    name: '拦截规则',
    tips: '默认站80拦截规则',
    required: true // 非必填
  },
  // 默认为空
  default_pass_rule: {
    type: 'text',
    default: '',
    name: '放行规则',
    tips: '默认站80放行规则',
    required: true // 非必填
  }
}

export default {
  components: {
    ConfForm
  },
  data() {
    return {
      // 分组标识
      groupStr: 'http_conf',
      // 基础表单数据
      baseData
    }
  },
  created() {},
  methods: {}
}
</script>
