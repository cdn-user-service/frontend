<template>
  <el-dialog
    title="未正确设置 DNS 服务器"
    :visible.sync="statusDialogVisible"
    width="500px"
    @close="resetForm"
    class="ants_dialog"
    append-to-body
    center
  >
    <div v-loading="btnLoading" class="p-lg">
      <ul class="space-y-8">
        <li>
          <span class="text-primary">{{ whoisInfo.domain }}</span>
          域名未正确设置 DNS 服务器，如需正常使用
        </li>
        <li>
          {{ $root.webName }} 提供的 DNS 解析服务，请及时前往域名注册商处修改为
        </li>
        <li>{{ $root.webName }} 所属服务器。</li>
        <li>
          如超过 30 天未正确设置，解析域名将被系统自动清除。
        </li>
      </ul>
      <el-divider></el-divider>

      <div class="flex justify-between">
        <div style="width:50%;" class="pr-sm">
          <div class="font-bold">当前域名的设置</div>
          <ul
            class="space-y-4 text-sm mt-sm text-error bg-ants-bg-3 rounded-lg"
            style="padding:1px 15px;min-height:58px;"
          >
            <li v-if="!whoisInfo.nameServer.length" class="mt-lg">
              未查询到数据！
            </li>
            <li v-else v-for="item in whoisInfo.nameServer" :key="item">
              {{ item }}
            </li>
          </ul>
        </div>

        <div style="width:50%;" class="pl-xs">
          <div class="font-bold">{{ $root.webName }} 所属服务器</div>
          <ul
            class="text-sm mt-sm text-success bg-ants-bg-3 rounded-lg"
            style="padding:1px 15px;min-height:58px;"
          >
            <li
              class="my-xs"
              v-for="(item, key) in whoisInfo.nsRecords"
              :key="key"
            >
              <ants-copy :text="item" />
            </li>
          </ul>
        </div>
      </div>

      <el-button type="primary" style="width:100%;" class="mt-lg"
        >如何配置 DNS 服务器</el-button
      >

      <div class="text-right mt-lg">
        <span class="ants-font-4" v-if="refreshTime != 0"
          >{{ refreshTime }}秒后可重试</span
        >

        <span v-else>
          <span class="text-ants-text-4">已经修改？</span>
          <span
            class="cursor-color text-primary"
            @click="refreshStatus(whoisInfo.domain)"
            >重新验证</span
          >
        </span>
      </div>
    </div>
  </el-dialog>
</template>

<script>
// api
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getJwhois } = require(`@/v2/${PROCESS_NAME}/api/dns/domain`)

export default {
  data() {
    return {
      statusDialogVisible: false,
      whoisInfo: {
        nsRecords: [],
        nameServer: []
      },
      refreshTime: 0,
      timer: null,
      btnLoading: false
    }
  },
  created() {},
  methods: {
    // 查看解析状态详情，值允许 3 秒钟请求一次
    async getWhoisInfo(row) {
      this.statusDialogVisible = true
      this.btnLoading = true
      try {
        const { data: res } = await getJwhois({
          domain: row.domain
        })
        if (res.code !== 1) return
        // 解析 whoisInfo 数据
        this.whoisInfo = this.resolveWhoisInfo(res.data)
      } finally {
        this.btnLoading = false
      }
    },

    // 解析 whoisInfo 数据
    resolveWhoisInfo(data) {
      const whois = data || {}
      const nameServer = []

      whois.whoisInfo = whois.whoisInfo.split(',')
      whois.whoisInfo.map(item => {
        if (item.toLowerCase().indexOf('name server') != -1) {
          nameServer.push(item.split(':')[1])
        }
      })
      whois.nameServer = nameServer
      whois.nsRecords = JSON.parse(whois.nsRecords || '{}')

      // 如果解析正确，则重新刷新页面
      if (whois.whoisStatus === 1) {
        this.$emit('refresh')
        this.$msg.success('设置成功')
        this.statusDialogVisible = false
      }
      return whois
    },

    resetForm() {
      this.btnLoading = false
      // this.whoisInfo = {
      //   nameServer: []
      // }
    },

    // 点击重新验证
    async refreshStatus(domain) {
      this.$msg.info('正在刷新验证')
      if (this.btnLoading) return

      this.btnLoading = true
      clearInterval(this.timer)
      // 设置10秒定时器
      this.refreshTime = 10
      this.timer = setInterval(() => {
        this.refreshTime--
        if (this.refreshTime === 0) {
          clearInterval(this.timer)
        }
      }, 1000)

      // 清除定时器
      this.$once('hook:beforeDestroy', () => {
        clearInterval(this.timer)
      })

      try {
        const { data: res } = await getJwhois({
          domain
        })
        if (res.code !== 1) return
        this.whoisInfo = this.resolveWhoisInfo(res.data)
        this.$msg.success('操作成功')
      } finally {
        this.btnLoading = false
      }
    }
  }
}
</script>
