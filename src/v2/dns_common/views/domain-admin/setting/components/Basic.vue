<template>
  <div>
    <el-card class="mb-lg">
      <div slot="header">
        <TitleBorder :title="title" />
      </div>

      <ul
        class="
        space-y-12
        bg-ants-bg-3 px-lg rounded-2xl py-xl domain-basic-ul"
      >
        <li class="flex">
          <div class="text-ants-text-4 left-name">域名</div>
          <div class="flex-1">
            {{ domainInfo.domain }}
          </div>
        </li>
        <li class="flex">
          <div class="text-ants-text-4 left-name">Domain ID</div>
          <div class="flex-1">
            {{ domainInfo.id }}
          </div>
        </li>
        <li class="flex">
          <div class="text-ants-text-4 left-name">DNS 状态</div>
          <div class="flex-1">
            <div
              class="text-success el-icon-success"
              v-if="domainInfo.whoisStatus === 1 && domainInfo.status === 1"
            >
              正常解析
            </div>
            <div
              class="text-warning el-icon-remove"
              v-else-if="domainInfo.status == 0"
            >
              已暂停解析
            </div>
            <div
              class="text-error el-icon-remove"
              v-else-if="domainInfo.whoisStatus == 0"
            >
              DNS错误
            </div>
          </div>
        </li>

        <li class="flex whois-box">
          <div class="text-ants-text-4 left-name">DNS 服务器</div>
          <div
            style="max-width:700px;"
            class="flex-1"
            v-loading="loading"
            element-loading-spinner="el-icon-loading"
          >
            <span class="text-success" v-if="domainInfo.whoisStatus === 1"
              >DNS服务器正在运行中</span
            >

            <div v-else>
              <div class="text-error">未正确设置 DNS 服务器</div>
              <div class="p-lg mt-lg bg-ants-bg-1 rounded-2xl">
                <div class="">
                  <span class="el-icon-warning"> </span>
                  为了 DNS 解析服务正常生效，请设置正确的 DNS 服务器为
                  <span
                    class="ml-xs cursor-color text-primary"
                    @click="showWhoisInfoDialog"
                    >查看详情</span
                  >
                </div>

                <el-divider></el-divider>

                <div class="flex justify-between">
                  <div style="width:50%;" class="pr-xs">
                    <div class="font-semibold">当前域名在的设置</div>
                    <ul
                      class="text-sm mt-sm text-error space-y-5
                          bg-ants-bg-3 rounded-xl"
                      style="padding:10px 15px;min-height:66px;"
                    >
                      <li v-if="!whoisInfo.nameServer.length">
                        未查询到数据！
                      </li>
                      <li
                        v-else
                        v-for="item in whoisInfo.nameServer"
                        :key="item"
                      >
                        {{ item }}
                      </li>
                    </ul>
                  </div>

                  <div style="width:50%;" class="pl-xs">
                    <div class="font-semibold">所属服务器</div>
                    <ul
                      class="text-sm mt-sm text-success space-y-5
                          bg-ants-bg-3 rounded-xl"
                      style="padding:10px 15px;min-height:66px;"
                    >
                      <li v-for="(item, key) in whoisInfo.nsRecords" :key="key">
                        <ants-copy :text="item" />
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </li>

        <li class="flex">
          <div class="text-ants-text-4 left-name">域名备注</div>
          <div class="flex-1">
            <span>{{ domainInfo.remarks || '-' }}</span>
            <span
              class="ml-sm el-icon-edit cursor-color"
              @click="toUpdateRemark()"
            ></span>
          </div>
        </li>
      </ul>
    </el-card>

    <!-- 查看域名解析状态对话框 -->
    <WhoisInfoDialog ref="WhoisInfoDialogRef" @refresh="refresh" />

    <UpdateRemark ref="UpdateRemarkRef" @refresh="refresh" />
  </div>
</template>

<script>
import WhoisInfoDialog from '@/v2/dns_common/views/domain/WhoisInfoDialog'
import UpdateRemark from './UpdateRemark'

const PROCESS_NAME = process.env.VUE_APP_NAME
const { getJwhois } = require(`@/v2/${PROCESS_NAME}/api/dns/domain`)

export default {
  name: 'Basic',
  components: {
    WhoisInfoDialog,
    UpdateRemark
  },
  props: {
    title: {
      type: String,
      default: '设置'
    },
    domainInfo: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      domain: this.$route.params.domain,
      loading: false,
      whoisInfo: {
        nsRecords: [],
        nameServer: []
      }
    }
  },

  created() {},
  mounted() {
    this.getWhoisInfo()
  },
  methods: {
    /**
     * @description: 查看解析状态详情，值允许 3 秒钟请求一次
     */
    async getWhoisInfo() {
      this.loading = true
      try {
        const { data: res } = await getJwhois({
          domain: this.domain
        })
        if (res.code !== 1) return
        // 解析 whoisInfo 数据
        this.whoisInfo = this.resolveWhoisInfo(res.data)
        console.log(this.whoisInfo)
      } finally {
        this.loading = false
      }
    },

    /**
     * @description: 查看解析状态详情，值允许 3 秒钟请求一次
     */

    async showWhoisInfoDialog() {
      this.$refs.WhoisInfoDialogRef.getWhoisInfo({ domain: this.domain })
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
      return whois
    },

    // 点击修改备注
    toUpdateRemark() {
      this.$refs.UpdateRemarkRef.show(this.domainInfo)
    },
    // 刷新数据
    refresh() {
      this.$emit('refresh')
    }
  }
}
</script>

<style lang="scss" scoped>
.domain-basic-ul {
  font-size: 13px;
  .whois-box {
    @media screen and (max-width: 767px) {
      flex-direction: column;
    }
  }
}
.left-name {
  width: 120px;
  margin-right: 20px;
}
</style>
