<template>
  <el-card class="animated fadeIn content-box">
    <table-query-form
      :search-arr="[
        {
          name: '检索IP地址',
          key: 'ip',
          value: queryInfo.ip
        }
      ]"
      :queryInfo="queryInfo"
      @changeInput="getTableData"
    >
      <template slot="buttons">
        <ants-button
          type="primary"
          icon="el-icon-plus"
          size="small"
          @click="showSaveDialog"
          :disabled="$root.loading || btnLoading"
          text="添加白名单IP"
        />
        <ants-button
          type="info"
          size="small"
          icon="el-icon-delete"
          :disabled="$root.loading"
          :loading="btnLoading"
          @click="batchDelete"
          text="批量删除"
          class="mr-df"
        />

        <ants-switch
          v-model="whiteIpStatus"
          active-text="开启"
          inactive-text="关闭"
          :active-value="1"
          :inactive-value="0"
          v-loading="btnLoading"
          @change="changeStatus"
        />
      </template>
    </table-query-form>

    <ants-table
      :data="tableData"
      @getTableData="getTableData"
      :total="total"
      :queryInfo="queryInfo"
    >
      <ants-table-column width="60" prop="id" label="ID"> </ants-table-column>
      <ants-table-column prop="ip" label="白名单IP" min-width="200">
      </ants-table-column>
      <ants-table-column prop="remark" label="备注信息" min-width="200">
      </ants-table-column>
      <ants-table-column
        prop="createTime"
        sortable
        label="创建时间"
        min-width="140"
      >
      </ants-table-column>

      <!-- <ants-table-column
          prop="status"
          label="启用"
          min-width="80"
          align="center"
        >
          <template #default="{ row, $index }">
            <ants-table-switch
              v-model="row.status"
              :ref="`tableSwitchRef${$index}`"
              @change="changeStatus(row, `tableSwitchRef${$index}`)"
            >
            </ants-table-switch>
          </template>
        </ants-table-column> -->

      <ants-table-column label="操作" width="160">
        <template #default="{ row }">
          <ants-button
            type="primary"
            size="mini"
            :disabled="btnLoading"
            @click="showSaveDialog(row)"
            text="修改"
          />
          <ants-button
            type="danger"
            size="mini"
            :disabled="btnLoading"
            @click="deleteSingle(row)"
            text="删除"
          />
        </template>
      </ants-table-column>
    </ants-table>

    <SaveDialog ref="SaveDialogRef" @refresh="getTableData" />
  </el-card>
</template>

<script>
import SaveDialog from './components/SaveDialog'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const {
  loginWhiteIpList,
  loginWhiteIpDelete,
  userModuleUpdate
} = require(`@/v2/${PROCESS_NAME}/api/login-white-ip`)

export default {
  components: {
    SaveDialog
  },
  data() {
    return {
      btnLoading: false,
      total: 0,
      queryInfo: {
        ip: '',
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      selectArr: [],
      tableData: [],
      whiteIpStatus: 0
    }
  },
  created() {
    this.getTableData()
  },
  watch: {
    '$root.userinfo.whiteIpStatus': {
      handler(newVal) {
        this.whiteIpStatus = newVal
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {},
  methods: {
    // 获取表格数据
    async getTableData() {
      this.$root.loading = true
      try {
        const { data: res } = await loginWhiteIpList(this.queryInfo)
        if (res.code !== 1) return
        console.log(res)
        const obj = res.data || {}
        this.tableData = obj.list || []
        this.total = obj.totalCount || 0
      } finally {
        this.$root.loading = false
      }
    },

    // 添加修改对话框显示
    showSaveDialog(row = {}) {
      this.$refs.SaveDialogRef.showDialog(row)
    },

    // 删除单个
    async deleteSingle(row) {
      const result = await this.$doDelete({
        tag: '白名单IP'
      })
      if (!result) return

      this.btnLoading = true
      try {
        const { data } = await loginWhiteIpDelete({
          ids: row.id
        })
        if (data.code !== 1) return
        this.getTableData()
        this.$msg.success(this.antsT('删除成功'))
      } finally {
        this.btnLoading = false
      }
    },

    // 批量删除
    async batchDelete() {
      const selectLength = this.selectArr.length
      const result = await this.$batchDelete(selectLength, {
        tag: '白名单IP'
      })
      if (!result) return

      this.btnLoading = true
      try {
        const idsArr = this.selectArr.map((it) => it.id)
        const { data: res } = await loginWhiteIpDelete({
          ids: idsArr + ''
        })

        if (res.code !== 1) return
        this.getTableData()
        this.$msg.success(this.antsT('批量成功删除 '))
        this.selectArr = [] // 释放
      } finally {
        this.btnLoading = false
      }
    },

    // 开关
    changeStatus(val) {
      const info = {
        0: {
          title: '关闭登录白名单IP限制',
          msg: '关闭后，将不限制登录白名单IP，是否继续？',
          btnText: '立即关闭'
        },
        1: {
          title: '开启登录白名单IP限制',
          msg: '开启后，将限制登录白名单IP。请确认已填写自己的IP，否则将无法登录！',
          btnText: '立即开启'
        }
      }

      const activeInfo = info[val]

      this.$confirm(activeInfo.msg, activeInfo.title, {
        dangerouslyUseHTMLString: true,
        center: true,
        type: 'info',
        confirmButtonText: activeInfo.btnText,
        beforeClose: async (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '加载中...'

            try {
              const { data: res } = await userModuleUpdate({
                whiteIpStatus: val
              })

              if (res.code !== 1) {
                instance.confirmButtonText = activeInfo.btnText
                return
              }

              instance.confirmButtonText = '操作成功'
              this.$msg.success('操作成功')
              this.$root.getUserinfo()
              done()
            } finally {
              instance.confirmButtonLoading = false
            }
          } else {
            done()
          }
        }
      }).catch((err) => {
        this.whiteIpStatus = val ? 0 : 1
        throw err
      })
    }
  }
}
</script>

<style lang="scss" scoped></style>
