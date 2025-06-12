<template>
  <div>
    <ConfForm
      ref="ConfFormRef"
      title="Worker"
      :group-str="groupStr"
      :base-data="baseData"
    />
  </div>
</template>

<script>
import ConfForm from '../components/ConfForm'

const defaultForm = {
  // [text] CPU绑定 - 线程与CPU绑定（默认auto）
  worker_cpu_affinity: 'auto',
  // [text] 线程数 - worker线程数量（默认auto）
  worker_processes: 'auto',
  // [int] 打开文件数 - worker进程最大打开文件数(默认65000)
  worker_rlimit_nofile: 65000,
  // [text] 当时间到了，nginx 会在时间内尝试关闭所有当前打开的连接，以方便关机（默认60s）
  worker_shutdown_timeout: '60s',
  // [text] 错误日志级
  error_log_level: 'error',
  // [int] 设置单个工作进程（worker process）的最大未完成异步 I/O 操作数（默认32）
  event_worker_aio_requests: 32,
  // [int] 单个进程能并发处理的最大连接数(默认65000)
  event_worker_connections: 65000

  // worker_shutdown_timeout: 60,
  // worker_rlimit_nofile: '51200',
  // worker_connections: '51200',
  // worker_processes: 'auto',
  // resolver_timeout: 5,
  // resolver: '223.5.5.5 8.8.8.83',
  // log_directory: '/usr/local/openresty/nginx/logs/'
}

const baseData = {
  // [text] CPU绑定 - 线程与CPU绑定（默认auto）
  worker_cpu_affinity: {
    type: 'text',
    default: 'auto',
    name: 'CPU绑定',
    tips: '线程与CPU绑定（默认auto）'
  },
  // [text] 线程数 - worker线程数量（默认auto）
  worker_processes: {
    type: 'text',
    default: 'auto',
    name: '线程数',
    tips: 'worker线程数量（默认auto）'
  },
  // [int] 打开文件数 - worker进程最大打开文件数(默认65000)
  worker_rlimit_nofile: {
    type: 'int',
    default: 65000,
    name: '打开文件数',
    tips: 'worker进程最大打开文件数(默认65000)'
  },
  // [text] 当时间到了，nginx 会在时间内尝试关闭所有当前打开的连接，以方便关机（默认60s）
  worker_shutdown_timeout: {
    type: 'text',
    default: '60s',
    name: '',
    tips: '当时间到了，nginx 会在时间内尝试关闭所有当前打开的连接，以方便关机（默认60s）'
  },
  // [text] 错误日志级
  error_log_level: {
    type: 'text',
    default: 'error',
    name: '',
    tips: '错误日志级，可选值：info, notice, warn, error, crit'
  },
  // [int] 设置单个工作进程（worker process）的最大未完成异步 I/O 操作数（默认32）
  event_worker_aio_requests: {
    type: 'int',
    default: 32,
    name: '',
    tips: '设置单个工作进程（worker process）的最大未完成异步 I/O 操作数（默认32）'
  },
  // [int] 单个进程能并发处理的最大连接数(默认65000)
  event_worker_connections: {
    type: 'int',
    default: 65000,
    name: '',
    tips: '单个进程能并发处理的最大连接数(默认65000)'
  }
}

export default {
  components: {
    ConfForm
  },
  data() {
    return {
      // 分组标识
      groupStr: 'nginx_conf',
      // 基础表单数据
      baseData
    }
  },
  created() {},
  methods: {}
}
</script>
