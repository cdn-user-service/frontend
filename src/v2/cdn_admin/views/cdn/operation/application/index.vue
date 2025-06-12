<template>
  <div>
    <el-card class="animated fadeIn content-box">
      <table-query-form :search-arr="[
        {
          name: '检索应用名称',
          key: 'mainServerName',
          value: queryInfo.mainServerName
        }
      ]" :queryInfo="queryInfo" @changeInput="getTableData">
        <template slot="buttons">
          <ants-button type="primary" icon="el-icon-plus" size="small" :disabled="$root.loading"
            @click="showCreateUpdateDialog()" text="添加应用软件" />
          <ants-button type="info" size="small" icon="el-icon-delete" :disabled="$root.loading" :loading="btnLoading"
            @click="batchDelete" text="批量删除" />
        </template>
      </table-query-form>

      <ants-table :data="tableData" @getTableData="getTableData" @selection-change="handleSelectionChange"
        :total="total" :queryInfo="queryInfo">
        <ants-table-column type="selection" width="45" align="center">
        </ants-table-column>
        <ants-table-column width="70" prop="id" label="序号"> </ants-table-column>
        <ants-table-column prop="name" label="软件名称" min-width="140">
        </ants-table-column>
        <ants-table-column prop="type" label="软件类型" min-width="140">
        </ants-table-column>
        <ants-table-column prop="version" label="版本号" min-width="140">
        </ants-table-column>
        <ants-table-column prop="time" label="创建时间" min-width="140">
        </ants-table-column>
        <ants-table-column label="操作" width="230" auto-fixed>
          <template #default="{ row }">
            <ants-button type="primary" size="mini" @click="showCreateUpdateDialog(row)" :disabled="btnLoading"
              text="配置" />
            <ants-button type="success" size="mini" @click="goRecordPage(row)" :disabled="btnLoading" text="授权" />
            <el-dropdown placement="bottom" :show-timeout="100" @command="handleMore">
              <ants-button plain :disabled="btnLoading" type="primary" size="mini"
                style="margin-left: 10px; padding: 7px 9px" text="更多"><i class="el-icon-caret-bottom el-icon--right" />
              </ants-button>

              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-for="(item, key) in {
                  initNode: '服务类型',
                  initNode: '软件配置',
                  enableNode: '修复记录',
                  toCreateBackup: '清理列表',
                  toCreateResource: '部署规划',
                  toCreateResource: '授权中心',
                }" :key="key">{{ antsT(item) }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <!-- 添加DNS对话框 -->
    <!-- <CreateUpdateDialog ref="CreateUpdateDialogRef" /> -->
  </div>
</template>

<script>
// import CreateUpdateDialog from './CreateUpdateDialog'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const {
  getDnsApiList,
  doDeleteDnsApi
} = require(`@/v2/${PROCESS_NAME}/api/cdn/dns`)

export default {
  components: {
    // CreateUpdateDialog
  },
  data() {
    return {
      btnLoading: false,
      total: 0,
      queryInfo: {
        userType: '',
        source: '',
        user: '',
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      selectArr: [],
      tableData: [],
      isAdmin: PROCESS_NAME === 'cdn_admin'
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    /**
     * @description: 获取分组数据
     */

    async getTableData() {
      this.$root.loading = true
      this.tableData = [
        {
          id: 1,
          name: 'node-agent',
          type: '节点守护',
          version: '8.0.38',
          time: '2025-02-13 09:02:01',
        }

      ]
      this.$root.loading = false
      this.total = this.tableData.length


      // const { data: res } = await getDnsApiList(this.queryInfo)
      // this.$root.loading = false
      // if (res.code !== 1) return
      // this.tableData = res.data.list || []
      // this.total = res.data.totalCount
    },

    // 勾选操作
    handleSelectionChange(val) {
      this.selectArr = val
    },

    toggleAppKey(row, idx) {
      const appkeyText = row.appkeyText ? null : row.appKey
      this.$set(this.tableData[idx], 'appkeyText', appkeyText)
    },

    /**
     * @description: 加密显示 appKey
     */

    // encryAppKey(appKey = '') {
    //   const length = appKey.length
    //   let str = ''
    //   for (let i = 0; i < mailArr[0].length - 3; i++) {
    //     string1 += '*'
    //   }
    //   return
    // },

    /**
     * @description: 添加DNS
     */

    showCreateUpdateDialog(row = {}) {
      this.$refs.CreateUpdateDialogRef.showDialog(row)
    },

    /**
     * @description: 前往解析页面
     * @param {*} row
     */

    goRecordPage(row) {
      this.$router.push({
        path: './dns/record',
        query: { id: row.id, domain: row.appDomain, source: row.source }
      })
    },

    /**
     * @description: 单个删除
     * @param {*} row
     */

    async singleDelete(row) {
      const result = await this.$doDelete({
        tag: 'DNS API'
      })
      if (!result) return
      this.btnLoading = true
      const { data } = await doDeleteDnsApi({
        ids: row.id
      })
      this.btnLoading = false

      if (data.code !== 1) return
      this.getTableData()
      this.$msg.success(this.antsT('删除成功'))
    },

    /**
     * @description: 批量删除
     */

    async batchDelete() {
      const selectLength = this.selectArr.length

      const result = await this.$batchDelete(selectLength, {
        tag: 'DNS API'
      })
      if (!result) return

      this.btnLoading = true

      const idsArr = this.selectArr.map((item, index) => {
        return item.id
      })
      const { data: res } = await doDeleteDnsApi({
        ids: idsArr + ''
      })
      this.btnLoading = false

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success(selectLength + this.antsT('个 DNS API 已成功删除'))
      this.selectArr = [] // 释放
    }
  }
}
</script>
