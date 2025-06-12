<template>
  <horizontal-menu
    :parent-path="`/dns/domain/list/admin/${domain}/${id}/${userId}/`"
    :menu-list="menuList"
    :title="`${domain}${isShare === 1 ? '（共享）' : ''}`"
    backPath="/dns/domain/list"
    :domain-info="domainInfo"
    @getDomainInfo="getDomainInfo"
  >
    <!-- 这里不能用 v-if 不然子页面会加载两次 -->
    <!-- <template slot="header">
      <div
        class="content-box whois-info-alart"
        v-show="domainInfo.whoisStatus == 0"
      >
        <el-alert
          type="error"
          :closable="false"
        >
          <div
            slot="title"
            class="flex justify-between items-center"
          >
            <div>
              <span
                class="aicon icon-DNSProtection margin-right-xs"
                style="vertical-align: bottom; font-size:20px"
              ></span>
              当前域名未设置正确的 DNS 服务器，DNS 解析服务未生效，如超过 30
              天未设置将被系统自动清除！
            </div>
            <div>
              <el-button
                @click="showWhoisInfoDialog"
                type="danger"
                plain
                size="mini"
              >查看详情</el-button>
            </div>
          </div>
        </el-alert>

        <WhoisInfoDialog
          ref="WhoisInfoDialogRef"
          @refresh="getDomainInfo"
        />
      </div>
    </template> -->
  </horizontal-menu>
</template>

<script>
// import WhoisInfoDialog from '@/v2/dns_common/views/domain/WhoisInfoDialog'

const PROCESS_NAME = process.env.VUE_APP_NAME
const { getDomainInfo } = require(`@/v2/${PROCESS_NAME}/api/dns/domain`)

// const menuList = [
//   {
//     title: '记录管理',
//     path: 'record'
//   },
//   {
//     title: '域名设置',
//     path: 'setting'
//   },
//   {
//     title: '套餐服务',
//     path: 'plan'
//   },
//   {
//     title: '自定义线路',
//     path: 'line'
//   },
//   {
//     title: '解析量统计',
//     path: 'qps'
//   },
//   {
//     title: '来源地域',
//     path: 'orign'
//   },
//   {
//     title: '请求日志',
//     path: 'log-request'
//   },
//   {
//     title: '异常日志',
//     path: 'log-error'
//   }
// ]

export default {
  components: {
    // WhoisInfoDialog
  },
  data() {
    return {
      id: this.$route.params.id,
      domain: this.$route.params.domain,
      userId: this.$route.params.userId,
      isShare: this.$route.params.isShare,
      menuList:
        this.isShare === 0
          ? [
              {
                title: '记录管理',
                path: 'record'
              },
              {
                title: '域名设置',
                path: 'setting'
              },
              {
                title: '套餐服务',
                path: 'plan'
              },
              {
                title: '自定义线路',
                path: 'line'
              },
              {
                title: '解析量统计',
                path: 'qps'
              },
              {
                title: '来源地域',
                path: 'orign'
              },
              {
                title: '请求日志',
                path: 'log-request'
              },
              {
                title: '异常日志',
                path: 'log-error'
              }
            ]
          : [
              {
                title: '记录管理',
                path: 'record'
              },
              {
                title: '解析量统计',
                path: 'qps'
              },
              {
                title: '来源地域',
                path: 'orign'
              },
              {
                title: '请求日志',
                path: 'log-request'
              },
              {
                title: '异常日志',
                path: 'log-error'
              }
            ],

      domainInfo: {
        // 套餐信息
        product: {},
        // 增值业务
        increment: [],
        // 服务器状态
        whoisStatus: 1,
        // 域名ID
        id: ''
      }
    }
  },
  created() {
    console.log('获取信息', this.$route.params)
  },
  methods: {
    /**
     * @description: 获取域名信息
     */

    async getDomainInfo(callback) {
      this.$root.loading = true
      try {
        const { data: res } = await getDomainInfo({
          id: this.id
        })
        if (res.code !== 1) return
        const obj = res.info || {}
        this.domainInfo = {
          ...this.domainInfo,
          ...obj
        }
        callback && callback()
      } finally {
        this.$root.loading = false
      }
    },

    /**
     * @description: 点击查看详情
     */

    showWhoisInfoDialog() {
      this.$refs.WhoisInfoDialogRef.getWhoisInfo({ domain: this.domain })
    }
  }
}
</script>

<style lang="scss">
.whois-info-alart {
  .el-alert__content {
    width: 100%;
    padding: 0;
  }
}
</style>
