<template>
  <div>
    <ConfForm
      ref="ConfFormRef"
      title="Cache"
      :group-str="groupStr"
      :base-data="baseData"
    />
  </div>
</template>

<script>
import ConfForm from '../components/ConfForm'

const baseData = {
  // proxy_buffer_size: {
  //   type: 'text',
  //   default: '64k',
  //   name: '',
  //   tips: '代理请求缓存大小（默认64k）'
  // },
  // proxy_buffers: {
  //   type: 'text',
  //   default: '32 32k',
  //   name: '',
  //   tips: '代理的响应内容缓冲（默认32 32k）'
  // },
  // proxy_busy_buffers_size: {
  //   type: 'text',
  //   default: '128k',
  //   name: '',
  //   tips: 'busy状态的缓冲（默认128k）'
  // },
  // proxy_cache_path_dir: {
  //   type: 'text',
  //   default: '/data/cache',
  //   name: '',
  //   tips: '临时文件存在目录(默认/data/cache)'
  // },
  // proxy_http_version: {
  //   type: 'text',
  //   default: '1.0',
  //   name: '',
  //   tips: '代理http版本（默认1.0）'
  // },
  // proxy_max_temp_file_size: {
  //   type: 'text',
  //   default: '1024m',
  //   name: '',
  //   tips: '临时文件的总大小（默认1024m）'
  // },
  // proxy_cache_dir_levels: {
  //   type: 'text',
  //   default: '1:2',
  //   name: '',
  //   tips: '目录层级，每级n个16进制'
  // },
  // proxy_cache_dir_max_size: {
  //   type: 'text',
  //   default: '100G',
  //   name: '',
  //   tips: '缓存容量最大值'
  // }
}

export default {
  components: {
    ConfForm
  },
  data() {
    return {
      // 分组标识
      groupStr: 'cache_conf',
      // 基础表单数据
      baseData
    }
  },
  created() {},
  methods: {
    async getFormObjData() {

    }
  }
}
</script>
