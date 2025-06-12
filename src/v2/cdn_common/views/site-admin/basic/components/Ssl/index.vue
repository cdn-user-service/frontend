<template>
  <div>
    <ants-form-card>
      <template slot="content">
        <TitleBorder class="mb-lg">
          <strong style="color: #303133">{{
            antsT('源服务器证书申请')
          }}</strong>
          <span class="ml-xs mr-xl text-sm text-ants-text-4">
            {{ antsT('开启后源服务器宝塔可申请证书。') }}
          </span>
        </TitleBorder>
        <ants-switch
          :disabled="$root.disabledCrud"
          v-model="form.ssl_cdn_apply_cert"
          active-text="ON"
          inactive-text="OFF"
          active-value="1"
          inactive-value="0"
          v-loading="$attrs.btnLoading"
          @change="doSave('ssl_cdn_apply_cert')"
        />
      </template>
    </ants-form-card>
    <ants-form-card>
      <template slot="title">{{ antsT('证书管理') }}</template>
      <template slot="info">
        <div>
          {{
            antsT(
              'HTTPS提供对网络服务器的身份认证，保护交换数据的隐私和完整性。'
            )
          }}
        </div>
      </template>

      <template slot="content">
        <el-table
          :data="tableData"
          v-loading="$root.loading"
          border
          style="margin: 0"
        >
          <ants-table-column
            min-width="140"
            prop="domain"
            label="域名"
            align="center"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <template v-if="row.status === 1">
                <div
                  class="leading-normal"
                  v-for="(item, idx) in row.sslDomains"
                  :key="idx"
                >
                  {{ item }}
                </div>
              </template>

              <div v-else>-</div>
            </template>
          </ants-table-column>

          <!-- <ants-table-column min-width="140" label="证书类型" align="center">
            <template #default="{ row }">
                {{row.type || '-'}}
            </template>
          </ants-table-column> -->

          <ants-table-column min-width="200" label="有效期" align="center">
            <template #default="{ row }">
              {{ row.NotAfter ? row.NotBefore + ' ~ ' + row.NotAfter : '-' }}
            </template>
          </ants-table-column>

          <ants-table-column min-width="140" label="证书备注" align="center">
            <template #default="{ row }">
              {{ row.info || '-' }}
            </template>
          </ants-table-column>

          <ants-table-column min-width="140" label="证书状态" align="center">
            <template #default="{ row }">
              <span class="text-success" v-if="row.status === 1">{{
                antsT('配置成功')
              }}</span>
              <span class="text-error" v-else>{{ antsT('未配置') }}</span>
            </template>
          </ants-table-column>

          <ants-table-column
            label="操作"
            width="250"
            align="center"
            v-if="!$root.disabledCrud"
          >
            <template #default="{ row }">
              <ants-button
                size="mini"
                type="success"
                @click="toReSign(row)"
                :loading="btnLoading"
                :disabled="sysCertifyData.obj.status === 0"
                :text="
                  sysCertifyData.obj.status === 0
                    ? '申请中'
                    : row.status === 1
                    ? '重签'
                    : '申请证书'
                "
              />
              <!-- <ants-button
                v-if="(sysCertifyData.obj || {}).canReApplyMode != -1"
                size="mini"
                type="success"
                :text="
                  btnLoading ? '处理中' : row.status === 1 ? '重签' : '申请证书'
                "
                :loading="btnLoading"
                @click="apliyCert(row.status === 1 ? 1 : 0)"
              /> -->
              <ants-button
                size="mini"
                type="primary"
                :disabled="btnLoading"
                @click="showCreateUpdateDialog(row)"
                text="配置"
              />
              <ants-button
                size="mini"
                type="info"
                @click="deleteSingle(row)"
                v-if="row.status === 1"
                text="清除"
              />
            </template>
          </ants-table-column>
        </el-table>

        <ul class="space-y-12 mt-xl">
          <li v-for="(value, key) in switchObj" :key="key">
            <TitleBorder class="mb-lg">
              <strong>{{ antsT(value.title) }}</strong>
              <span class="ml-xs mr-xl text-sm text-ants-text-4">
                {{ antsT(value.info) }}
              </span>
            </TitleBorder>
            <ants-radio-group
              v-model="form[key]"
              v-loading="$attrs.btnLoading"
              element-loading-spinner="el-icon-loading"
              @change="doSave(key)"
              v-if="key == 'forced_ssl'"
              :disabled="$root.disabledCrud"
            >
              <template v-if="$mode[179]">
                <ants-radio label="0" text="关闭" />
                <ants-radio label="1" text="强制HTTPS" />
                <ants-radio label="2" text="加速跳转" />
                <ants-radio label="3" text="加密跳转" />
              </template>

              <template v-else>
                <ants-radio label="0" text="关闭" />
                <ants-radio label="1" text="301跳转" />
                <ants-radio label="3" text="加密跳转" />
              </template>
            </ants-radio-group>

            <ants-switch
              v-else
              :disabled="$root.disabledCrud"
              v-model="form[key]"
              active-text="ON"
              inactive-text="OFF"
              active-value="1"
              inactive-value="0"
              v-loading="$attrs.btnLoading"
              @change="doSave(key)"
            />
          </li>

          <li>
            <TitleBorder class="mb-lg">
              <strong>{{ antsT('TLS版本控制') }}</strong>
              <span class="ml-xs mr-xl text-sm text-ants-text-4">
                {{
                  antsT(
                    '提供安全保密和数据完整性保障。TLS协议版本开启或关闭后，您的加速域名也将开启或关闭TLS握手。'
                  )
                }}
              </span>
            </TitleBorder>
            <div class="mt-xl flex items-center">
              <el-radio-group
                :disabled="$root.disabledCrud"
                v-model="form.ssl_protocols"
                @change="changeTls"
                v-loading="$attrs.btnLoading"
                element-loading-spinner="el-icon-loading"
              >
                <el-radio label="TLSv1 TLSv1.1 TLSv1.2" />
                <el-radio label="TLSv1.1 TLSv1.2 TLSv1.3" />
              </el-radio-group>
            </div>
            <!-- <div
              v-for="(item, key) in tls"
              :key="key"
              class="mt-xl flex items-center"
            >
              <span class="mr-xl text-ants-text-4">{{ key }}</span>
              <ants-switch
                :disabled="$root.disabledCrud"
                v-model="tls[key]"
                active-text="ON"
                inactive-text="OFF"
                active-value="1"
                inactive-value="0"
                v-loading="$attrs.btnLoading"
                @change="changeTls"
              />
            </div> -->
          </li>
        </ul>
      </template>
    </ants-form-card>

    <CreateUpdateDialog
      ref="CreateUpdateDialogRef"
      v-on="$listeners"
      @getSslData="getSiteDetail"
      v-bind="$attrs"
    />

    <!-- 证书重签对话框 -->
    <ReSignDialog ref="ReSignDialogRef" @refresh="refresh" />
  </div>
</template>

<script>
import CreateUpdateDialog from './createUpdate'
import ReSignDialog from './ReSignDialog'

const PROCESS_NAME = process.env.VUE_APP_NAME

// API
const {
  doDeleteSiteAttr,
  getCertifyByHost,
  doReauthCertify,
  doApplyCert
} = require(`@/v2/${PROCESS_NAME}/api/cdn/site`)
// 后台重签证书用这个接口。前台用 doReauthCertify
const { pushByInputInfo } = require(`@/v2/${PROCESS_NAME}/api/cdn/push`)

const tableObj = {
  domain: '',
  // 开始时间
  NotBefore: '',
  // 到期时间
  NotAfter: '',
  info: '',
  status: 0,
  other_ssl_key: '',
  other_ssl_pem: '',
  // 域名
  subjectAlternativeNames: ''
}

const switchObj = {
  forced_ssl: {
    title: '强制HTTPS',
    info: '强制 HTTP 跳转 HTTPS，启用之前请先配置 HTTPS 证书。'
  },
  forced_hsts: {
    title: 'HSTS',
    info: 'HSTS 为强制客户端（如浏览器）使用 HTTPS 与服务器创建连接，启用 HSTS 前请先启用 HTTPS 协议。'
  },
  // TODO：后面需要，现在暂时屏蔽
  ssl_http2: {
    title: '开启HTTP2',
    info: '开启之前请先配置 HTTPS 证书。'
  }
}
export default {
  components: {
    CreateUpdateDialog,
    ReSignDialog
  },
  data() {
    return {
      // 是否为管理平台
      isAdmin: PROCESS_NAME === 'cdn_admin',

      form: {
        // 强制HTTPS开关 [bool]
        forced_ssl: '0',
        // HSTS开关 [bool]
        forced_hsts: '0',
        // HTTP2开关 [bool]
        ssl_http2: '0',
        // [text] TLS
        ssl_protocols: 'TLSv1 TLSv1.1 TLSv1.2',
        // 源证书申请
        ssl_cdn_apply_cert: '0'
      },

      tls: {
        // 'TLSv1.0': '0',
        'TLSv1.1': '0',
        'TLSv1.2': '0',
        'TLSv1.3': '0'
      },

      switchObj,

      tableData: [
        {
          ...tableObj
        }
      ],

      // 用于删除
      other_ssl_key_id: null,
      other_ssl_pem_id: null,

      btnLoading: false,
      // 是否可申请证书
      sysCertifyData: {
        obj: {},
        arr: []
      }
    }
  },
  created() {
    this.getSiteDetail()
    this.doGetCertByHost()
  },
  methods: {
    // 刷新
    refresh() {
      this.getSiteDetail()
      this.doGetCertByHost()
      // this.btnLoading = true
    },

    // 重新签发证书
    toReSign(row, idx) {
      // this.btnLoading = true
      this.$refs.ReSignDialogRef.show(row)
    },
    /**
     * @description: 获取站点证书数据
     */

    async getSiteDetail() {
      const { data: res } = await this.$listeners.getSiteDetail('ssl')
      const { attr = [] } = res || {}
      attr.forEach((item) => {
        // TSL
        if (item.pkey === 'ssl_protocols') {
          console.log('object', item.pvalue)
          // const PVALUE = item.pvalue || ''
          // const arr = PVALUE.split(' ')
          // arr.forEach(item => {
          //   if (item in this.tls) {
          //     this.tls[item] = '1'
          //   }
          // })
          // return
        }

        if (item.pkey in this.form) {
          this.form[item.pkey] = item.pvalue
          return
        }

        // 如果存在值
        if (item.pkey in this.tableData[0]) {
          this.tableData[0][item.pkey] = item.pvalue
          this.tableData[0].status = item.status

          if (item.pkey === 'other_ssl_key') {
            this.other_ssl_key_id = item.id
          }
          if (item.pkey === 'other_ssl_pem') {
            this.other_ssl_pem_id = item.id
          }
        }

        // 如果配置了证书，查询证书到期时间
        const { NotBefore, NotAfter, SigAlgName, subjectAlternativeNames } =
          item
        if (NotBefore) {
          this.tableData[0].NotBefore = NotBefore
        }
        if (NotAfter) {
          this.tableData[0].NotAfter = NotAfter
        }
        if (SigAlgName) {
          this.tableData[0].info = SigAlgName
        }
        if (subjectAlternativeNames) {
          this.tableData[0].subjectAlternativeNames = subjectAlternativeNames
        }
      })
      this.tableData[0].domain = res.mainServerName

      const { domain, subjectAlternativeNames, status } = this.tableData[0]
      const sslDomainStr = subjectAlternativeNames || domain || ''
      const sslDomains = sslDomainStr.split(',')
      this.tableData[0].sslDomains = sslDomains
      this.$emit('updateSslDomains', status != 1 ? [] : sslDomains)
    },

    /**
     * @description: 删除证书
     */

    async deleteSingle() {
      const result = await this.$doDelete({
        title: '清除证书配置文件',
        content: '此操作将会清空证书下的配置文件（不会删除证书）。是否继续？'
      })
      if (!result) return

      const { data: res1 } = await doDeleteSiteAttr({
        pkey: 'other_ssl_key',
        id: this.other_ssl_key_id
      })
      if (res1.code !== 1) return

      const { data: res2 } = await doDeleteSiteAttr({
        pkey: 'other_ssl_pem',
        id: this.other_ssl_pem_id
      })

      if (res2.code !== 1) return
      // 推送数据
      this.$listeners.preheatSite()

      this.$msg.success(this.antsT('清除成功'))
      this.$set(this.tableData, 0, tableObj)
      this.getSiteDetail()
    },

    /**
     * @description: 单个保存
     * @param {*} key
     */

    doSave(key = '') {
      if (
        this.tableData[0].status != 1 &&
        this.form[key] != 0 &&
        key !== 'ssl_cdn_apply_cert'
      ) {
        this.form[key] = '0'
        return this.$alert('请先配置 HTTPS 证书', '未配置证书', {
          center: true,
          type: 'info'
        })
      }

      this.saveSiteAttr({
        [key]: this.form[key]
      })
    },

    /**
     * @description: TLS 切换保存
     */
    changeTls(val) {
      this.saveSiteAttr({
        ssl_protocols: this.form.ssl_protocols
      })

      // const arr = []
      // Object.keys(this.tls).forEach(key => {
      //   if (this.tls[key] == '1') {
      //     arr.push(key)
      //   }
      // })

      // this.saveSiteAttr({
      //   ssl_protocols: arr.join(' ')
      // })
    },

    /**
     * @description: 保存配置数据
     */

    async saveSiteAttr(dataObj) {
      const res = await this.$listeners.saveSiteAttr(dataObj)
    },

    /**
     * @description: 显示添加源站对话框
     */

    showCreateUpdateDialog(row = {}) {
      this.$refs.CreateUpdateDialogRef.showDialog(row, this.sysCertifyData)
    },

    // 获取可用证书
    async doGetCertByHost() {
      this.btnLoading = true
      try {
        const { data: res } = await getCertifyByHost({
          host: this.$route.query.domain.trim()
        })
        if (res.code !== 1) return
        this.sysCertifyData.obj = res.sys_certify || {}
        this.sysCertifyData.arr = res.data || []
      } finally {
        this.btnLoading = false
      }
    },

    // 点击申请证书
    async apliyCert(mode = 0) {
      this.btnLoading = true
      try {
        const { data: res } = await doApplyCert({
          // 0 = 申请 | 1 = 重新申请
          mode,
          siteId: this.$route.query.id
        })
        if (res.code !== 1) return
        this.$msg.success('证书申请已提交')
        this.getSiteDetail()
      } finally {
        this.btnLoading = false
      }

      // 如果为管理平台
      // if (this.isAdmin) {
      //   const { data } = await pushByInputInfo({
      //     apply_certificate: id
      //   })
      //   res = data
      // } else {
      //   // 如果为用户平台
      //   const { data } = await doReauthCertify({
      //     CertId: id
      //   })
      //   res = data
      // }
      // this.btnLoading = false
      // if (res.code !== 1) return
      // this.$msg.success('申请请求已提交，请等待')
    }
  }
}
</script>
