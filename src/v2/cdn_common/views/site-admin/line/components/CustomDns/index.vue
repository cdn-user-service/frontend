<template>
  <div>
    <ants-form-card>
      <template slot="title">
        {{ antsT('自定义CNAME解析') }}
      </template>
      <template slot="info">
        {{ antsT('给当前域名配置独立的CNAME解析') }}
      </template>
      <template slot="content">
        <div class="mb-df">
          <ants-button
            v-if="!$root.disabledCrud"
            size="mini"
            type="primary"
            icon="el-icon-plus"
            :disabled="$root.loading"
            @click="showCreateUpdateDialog({}, 'create')"
            text="添加解析记录"
          />
          <el-divider direction="vertical"></el-divider>
          <strong>{{ (cname || '').split(',')[0] || '-' }}</strong>
        </div>
        <el-table :data="tableData" v-loading="$root.loading" border>
          <ants-table-column
            min-width="140"
            prop="recordId"
            label="记录ID"
            align="center"
          >
          </ants-table-column>
          <ants-table-column
            min-width="140"
            prop="top"
            label="主机记录"
            align="center"
          >
          </ants-table-column>
          <ants-table-column
            min-width="100"
            prop="recordType"
            label="记录类型"
            align="center"
          >
          </ants-table-column>
          <ants-table-column
            min-width="100"
            prop="line"
            label="线路"
            align="center"
          >
            <template #default="{ row }">
              {{ lineList[row.line] }}
            </template>
          </ants-table-column>
          <ants-table-column
            min-width="140"
            prop="value"
            label="记录值"
            align="center"
          >
          </ants-table-column>
          <ants-table-column
            min-width="100"
            prop="ttl"
            label="TTL"
            align="center"
          >
          </ants-table-column>

          <ants-table-column
            prop="domain"
            label="操作"
            width="160"
            align="center"
            v-if="!$root.disabledCrud"
          >
            <template #default="{ row }">
              <ants-button
                size="mini"
                type="primary"
                @click="showCreateUpdateDialog(row, 'update')"
                text="编辑"
              />
              <ants-button
                size="mini"
                type="danger"
                @click="deleteSingle(row)"
                text="删除"
              />
            </template>
          </ants-table-column>
        </el-table>
      </template>
    </ants-form-card>

    <CreateUpdateDialog
      ref="CreateUpdateDialogRef"
      v-on="$listeners"
      v-bind="$attrs"
      :cname="cname"
      :dns-config-id="dnsConfigId"
      :ips-arr="ipsArr"
      :line-list="lineList"
    />
  </div>
</template>

<script>
import CreateUpdateDialog from './createUpdate'
export default {
  components: {
    CreateUpdateDialog
  },
  data() {
    return {
      form: {
        // [mm_text] 自定义DNS解析记录,
        custom_dns: ''
      },
      cname: '',
      dnsConfigId: '',
      ipsArr: [],
      tableData: [],
      // 线路
      lineList: {},
      total: 0,
      queryInfo: {
        page: 1,
        limit: 20
      }
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    /**
     * @description: 获取自定义DNS解析列表
     */

    async getTableData() {
      const { data: res } = await this.$listeners.getSiteDetail('custom_dns')
      const arr = res.attr || []
      let allIpsArr = []
      const dnsInfoArr = []
      let dnsLineObj = {}

      if (arr.length) {
        this.cname = arr[0].cname

        // 可用的IP列表
        allIpsArr = arr[0].all_ips

        // 已设置的解析
        const dnsInfoObj = arr[0].dns_infos || {}
        Object.keys(dnsInfoObj).forEach(key => {
          dnsInfoArr.push(...dnsInfoObj[key])
        })

        // 线路列表
        const lineObj = arr[0].dns_lines || {}
        Object.keys(lineObj).forEach(key => {
          this.dnsConfigId = key
          dnsLineObj = {
            ...dnsLineObj,
            ...lineObj[key]
          }
        })
      }
      console.log(dnsLineObj)

      this.tableData = dnsInfoArr
      this.ipsArr = allIpsArr
      this.lineList = dnsLineObj
    },

    /**
     * @description: 显示添加源站对话框
     */

    showCreateUpdateDialog(row = {}, handle = '') {
      this.$refs.CreateUpdateDialogRef.showDialog(row, handle)
    },

    /**
     * @description: 单个删除
     * @param {*} row
     */

    async deleteSingle(row) {
      const res = await this.$listeners.saveSiteAttr({
        custom_dns: JSON.stringify({
          ...row,
          handle: 'delete',
          dnsConfigId: this.dnsConfigId
        })
      })
      if (res) this.getTableData()
    }
  }
}
</script>
